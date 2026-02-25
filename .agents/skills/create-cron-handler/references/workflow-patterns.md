# Workflow Patterns

## Contents
1. [Step Configuration Reference](#step-configuration-reference)
2. [step.sleep() — Rate Limiting](#stepsleep--rate-limiting)
3. [Sequential Fan-Out with Rate Limiting](#sequential-fan-out-with-rate-limiting)
4. [Parallel Batching](#parallel-batching)
5. [Full Example: DailyBriefingWorkflow](#full-example-dailybriefingworkflow)

---

## Step Configuration Reference

```typescript
await step.do(
  "step-name",           // Must be unique within the workflow — used as checkpoint key
  {
    retries: {
      limit: 2,          // Number of retries (0 = no retries)
      delay: "10 seconds",
      backoff: "exponential",  // Optional: "linear" | "exponential" (default: "linear")
    },
    timeout: "2 minutes",  // Formats: "30 seconds", "2 minutes", "1 hour"
  },
  async () => { /* work */ },
);
```

**Conservative config** (control steps, DB reads):
```typescript
{ retries: { limit: 1, delay: "5 seconds" }, timeout: "30 seconds" }
```

**Standard config** (external API calls):
```typescript
{ retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "30 seconds" }
```

**Long-running config** (AI generation, heavy computation):
```typescript
{ retries: { limit: 2, delay: "15 seconds", backoff: "exponential" }, timeout: "3 minutes" }
```

---

## step.sleep() — Rate Limiting

Use `step.sleep()` between external API calls to avoid rate limits:

```typescript
for (const item of items) {
  await step.do(`fetch:${item.id}`, config, async () => fetchData(this.env, item));
  await step.sleep(`rate-limit:${item.id}`, "1.1 seconds");  // Name must be unique
}
```

`step.sleep()` is checkpointed — the sleep time is not re-waited on workflow restart.

---

## Sequential Fan-Out with Rate Limiting

Process items one at a time with a sleep between each (avoids rate limits):

```typescript
const results: Result[] = [];
for (const item of items) {
  const result = await step.do(
    `process:${item.id}`,
    { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "30 seconds" },
    async () => processItem(this.env, item),
  );
  results.push(result);
  await step.sleep(`rate-limit:${item.id}`, "1.1 seconds");
}
```

---

## Parallel Batching

Process items in parallel batches of N (balances throughput vs. rate limits):

```typescript
const BATCH_SIZE = 5;

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await step.do(
    `batch:${i}`,
    { retries: { limit: 2, delay: "15 seconds", backoff: "exponential" }, timeout: "3 minutes" },
    async () => {
      await Promise.all(batch.map((item) => processItem(this.env, item)));
    },
  );
}
```

---

## Full Example: DailyBriefingWorkflow

The complete workflow in production (`api/src/workflows/daily-briefing/DailyBriefingWorkflow.ts`) demonstrates:
- Step classes instantiated inside `step.do()` with constructor-injected DAOs/providers
- DB access inside `step.do()` via `getConnection(this.env)`
- Sequential fan-out + rate limiting (news fetch stage)
- Parallel batching (insight generation stage)
- Passing data between steps (market context)
- Filtering results before next stage

```typescript
export class DailyBriefingWorkflow extends WorkflowEntrypoint<Env, { date: string }> {
  async run(event: WorkflowEvent<{ date: string }>, step: WorkflowStep): Promise<void> {
    const { date } = event.payload;

    // Step 1: Initialize — get list of tickers to process
    const tickerInfo = await step.do("initialize", CONTROL_STEP, async () => {
      const db = getConnection(this.env);
      const initStep = new InitializeTickerInfo(getWatchlistDAO(db), getStockDAO(db));
      return initStep.execute();
    });

    // Stage 1: Sequential with rate limiting
    const newsBatchResults: FetchNewsForTickerOutput[] = [];
    for (const { ticker, companyName } of tickerInfo) {
      const result = await step.do(
        `fetch-news:${ticker}`,
        { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "30 seconds" },
        async () => {
          const db = getConnection(this.env);
          const fetchStep = new FetchNewsForTicker(getNewsBatchDAO(db), getNewsProvider(this.env));
          return fetchStep.execute({ ticker, companyName, date });
        },
      );
      newsBatchResults.push(result);
      await step.sleep(`rate-limit:${ticker}`, "1.1 seconds");
    }

    // Stage 2: Parallel batches of 5 (filter skipped first)
    const successfulBatches = newsBatchResults.filter(
      (r): r is Extract<FetchNewsForTickerOutput, { skipped: false }> => !r.skipped,
    );
    for (let i = 0; i < successfulBatches.length; i += 5) {
      const batch = successfulBatches.slice(i, i + 5);
      await step.do(
        `generate-insights-batch:${i}`,
        { retries: { limit: 2, delay: "15 seconds", backoff: "exponential" }, timeout: "3 minutes" },
        async () => {
          const db = getConnection(this.env);
          const insightStep = new GenerateInsightForTicker(
            getNewsBatchDAO(db), getStockInsightDAO(db), getWatchlistDAO(db),
            getInsightAIProvider(this.env), getPriceHistoryProvider(this.env),
          );
          await Promise.all(batch.map((b) => insightStep.execute({ ...b, date })));
        },
      );
    }

    // Stage 3: Generate shared context once, then per-user assembly
    const marketContext = await step.do(
      "generate-market-context",
      { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "2 minutes" },
      async () => {
        const ctxStep = new GenerateMarketContextStep(getNewsProvider(this.env), getInsightAIProvider(this.env));
        return ctxStep.execute({ date });
      },
    );

    const userIds = await step.do("get-users", CONTROL_STEP, async () => {
      const db = getConnection(this.env);
      return getWatchlistDAO(db).getAllUserIdsWithWatchlists();
    });

    for (const userId of userIds) {
      await step.do(
        `briefing:${userId}`,
        { retries: { limit: 2, delay: "10 seconds", backoff: "exponential" }, timeout: "2 minutes" },
        async () => {
          const db = getConnection(this.env);
          const assembleStep = new AssembleBriefingForUser(
            getStockInsightDAO(db), getBriefingDAO(db), getWatchlistDAO(db),
            getEntitlementProvider(this.env), getUserDAO(db), getEmailProvider(this.env),
          );
          return assembleStep.execute({ userId, date, marketContext });
        },
      );
    }
  }
}
```
