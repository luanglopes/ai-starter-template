---
name: create-cron-handler
description: Create a new scheduled cron job for the Cloudflare Workers API, including the cron handler function, Cloudflare Workflow class, step functions, and wrangler.jsonc registration. Use when the user asks to add a new cron job, scheduled task, background job, or recurring automation. Triggers include requests like "add a cron job for...", "create a scheduled task that...", "run X every day at...", "add a background workflow for...", or "trigger Y on a schedule".
---

# Create Cron Handler

Add a scheduled background job using the Cloudflare Workers cron + Workflows pattern. This covers two layers:
1. **Cron handler** (`interfaces/cron/`) — triggered by Cloudflare's scheduler
2. **Workflow** (`workflows/`) — durable, checkpointed async execution via Cloudflare Workflows

Resolve the API package root first (for example `code/api` or `api`). All paths below are relative to the API package root unless explicitly stated otherwise.

## Architecture

```
wrangler.jsonc (cron schedule)
  └── src/index.ts (scheduled export)
        └── interfaces/cron/scheduled.ts (handler registry)
              └── interfaces/cron/handlers/TriggerXxx.ts (validates + starts workflow)
                    └── workflows/feature-name/FeatureWorkflow.ts (WorkflowEntrypoint)
                          └── workflows/feature-name/steps/*.ts (step functions)
```

## Workflow

### 1. Clarify Requirements

Ask:
- What should the job do?
- What cron schedule (standard cron expression)?
- Does it need idempotency (avoid double-running for same date/key)?
- What external services or DAOs does it need?

### 2. Create the Cron Handler

Create `<api-root>/src/interfaces/cron/handlers/TriggerFeatureName.ts`:

```typescript
import { getTodayDateUTC, isWeekdayUTC } from "../../../workflows/feature-name/utils";

export async function triggerFeatureName(env: Env): Promise<void> {
  // Optional: guard against unwanted days
  if (!isWeekdayUTC(new Date())) return;

  const date = getTodayDateUTC();

  try {
    await env.FEATURE_NAME_WORKFLOW.create({
      id: `feature-name-${date}`,  // Idempotent ID prevents duplicates
      params: { date },
    });
  } catch {
    console.log(`Feature name already triggered for ${date}`);
  }
}
```

Key points:
- Signature is always `(env: Env) => Promise<void>`
- Use idempotent workflow IDs (e.g. `feature-name-${date}`) — Cloudflare rejects duplicate IDs, so catch the error to safely skip re-runs
- Keep handler logic minimal; real work goes in the Workflow

### 3. Register in the Cron Router

Edit `<api-root>/src/interfaces/cron/scheduled.ts` — add the handler to the `cronHandlers` map:

```typescript
import { triggerFeatureName } from "./handlers/TriggerFeatureName";

const cronHandlers: Record<string, (env: Env) => Promise<void>> = {
  "0 9 * * 1-5": triggerDailyBriefing,
  "0 0 * * *":   triggerFeatureName,  // Add your entry
};
```

The key is the exact cron expression from `wrangler.jsonc`.

### 4. Create Shared Utilities (if needed)

If the workflow needs date/time helpers, create `<api-root>/src/workflows/feature-name/utils.ts`:

```typescript
export function getTodayDateUTC(): string {
  return new Date().toISOString().split("T")[0];
}

export function isWeekdayUTC(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}
```

Reuse existing utils from `workflows/daily-briefing/utils.ts` when appropriate (import across workflows is fine).

### 5. Create the Workflow Class

Create `<api-root>/src/workflows/feature-name/FeatureNameWorkflow.ts`:

```typescript
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { getConnection } from "../../infra/drizzle/connection";
import { getSomeDAO } from "../../infra/factories/DAOFactory";

type Params = { date: string };

export class FeatureNameWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<void> {
    const { date } = event.payload;

    // Each step.do() is checkpointed — completed steps are not re-executed on restart
    const items = await step.do(
      "initialize",
      { retries: { limit: 1, delay: "5 seconds" }, timeout: "30 seconds" },
      async () => {
        const db = getConnection(this.env);
        const dao = getSomeDAO(db);
        return dao.findAll();
      },
    );

    for (const item of items) {
      await step.do(
        `process:${item.id}`,
        { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "1 minute" },
        async () => {
          // ... do work
        },
      );
    }
  }
}
```

See [workflow-patterns.md](references/workflow-patterns.md) for step retry configs, `step.sleep()` for rate limiting, and batching patterns.

### 6. Create Step Classes

Extract meaningful units into per-directory step classes following the use case pattern:

```
<api-root>/src/workflows/feature-name/steps/
  DoSomething/
    types.ts                 # Input, Output, Interface types
    DoSomething.ts           # Class implementation (constructor injection)
    DoSomething.spec.ts      # Unit tests with mocked deps
    index.ts                 # Re-exports
```

**`types.ts`** — define input/output types and the step interface:
```typescript
export type DoSomethingInput = { id: string; date: string };
export type DoSomethingOutput = { result: string };

export interface DoSomethingInterface {
  execute(params: DoSomethingInput): Promise<DoSomethingOutput>;
}
```

**`DoSomething.ts`** — class with constructor injection (no `env` dependency):
```typescript
import type { SomeDAO } from "../../../../app/dao/SomeDAO";
import type { DoSomethingInput, DoSomethingInterface, DoSomethingOutput } from "./types";

export class DoSomething implements DoSomethingInterface {
  constructor(private someDAO: SomeDAO) {}

  async execute(params: DoSomethingInput): Promise<DoSomethingOutput> {
    // ... work using this.someDAO
  }
}
```

**`index.ts`** — re-export for clean imports:
```typescript
export { DoSomething } from "./DoSomething";
export type { DoSomethingInput, DoSomethingInterface, DoSomethingOutput } from "./types";
```

**Why classes instead of plain functions?**
- DAOs and providers are injected via constructor → unit-testable with mocks (no ServiceLocator override needed)
- Consistent with the use case layer pattern (`app/usecases/`)
- Steps that wrap use cases inject the same deps and instantiate use cases internally

**Instantiate step classes inside `step.do()` callbacks** (not in the workflow constructor), because Cloudflare Workflows can resume from any step — each callback must create its own connections:

```typescript
await step.do(
  "do-something",
  { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "30 seconds" },
  async () => {
    const db = getConnection(this.env);
    const step = new DoSomething(getSomeDAO(db));
    return step.execute({ id, date });
  },
);
```

### 7. Export Workflow from Entry Point

Edit `<api-root>/src/index.ts` — add the named export so Cloudflare can bind the class:

```typescript
export { FeatureNameWorkflow } from "./workflows/feature-name/FeatureNameWorkflow";
```

### 8. Register in wrangler.jsonc

Add both the cron trigger and the workflow binding:

```jsonc
"triggers": {
  "crons": [
    "0 9 * * 1-5",  // existing
    "0 0 * * *"     // new schedule
  ]
},
"workflows": [
  // ... existing workflows
  {
    "name": "feature-name-workflow",
    "binding": "FEATURE_NAME_WORKFLOW",  // Must match env.FEATURE_NAME_WORKFLOW in handler
    "class_name": "FeatureNameWorkflow"  // Must match the exported class name
  }
]
```

After editing wrangler.jsonc, regenerate bindings so TypeScript knows about the new `Env` property:

```bash
cd api && bun run cf-typegen
```

### 9. Verify

```bash
cd api && bun run check   # Type-check + lint
```

## Reference Files

- **[workflow-patterns.md](references/workflow-patterns.md)** — Step retry configs, `step.sleep()` for rate limiting, batching/fan-out patterns, and the full DailyBriefingWorkflow as a real example
