# AI Starter PRD

## Product Goal
Ship a generic SaaS starter template with:
- Better Auth (email/password + OTP + password reset)
- Billing (free, starter, pro)
- Todo CRUD as the example feature
- AI description enhancement on todos

## Core User Flows
1. User signs up and logs in.
2. User creates, updates, and deletes todos.
3. User clicks "AI Enhance" to improve a todo description.
4. User manages billing plan in settings.
5. User can delete account and all related data.

## Non-Goals
- Domain-specific vertical logic from prior implementations
- Scheduled background workflows
- External market/news providers

## Success Criteria
- Clean starter architecture for extension.
- All core API/web checks pass.
- No legacy finance routes/components remain in app runtime.
