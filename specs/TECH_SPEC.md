# AI Starter Technical Specification

## API Surface
- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/:id`
- `PATCH /api/todos/:id`
- `DELETE /api/todos/:id`
- `POST /api/todos/:id/enhance-description`
- `POST /api/billing/checkout`
- `GET /api/billing/portal`
- `GET /api/billing/plan`
- `DELETE /api/account`
- Better Auth: `/api/auth/*`

## Data Model
- Better Auth tables
- `todos`
- `ai_call_logs`

## AI Design
- Provider abstraction via `AIProvider`
- Default providers: Gemini, Ollama
- Enhancement calls logged in `ai_call_logs`
- Plan limits enforced on AI enhancement usage

## Web App
- App routes: `/todos`, `/settings`
- Feature modules: `auth`, `billing`, `settings`, `todos`, `common`

## Validation
- API: `bun run check`, `bun run test:unit`
- Web: `bun run check`, `bun run lint`
