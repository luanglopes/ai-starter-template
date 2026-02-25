# API Documentation

Base URL: `http://localhost:8787`

## Authentication

- Better Auth routes: `/api/auth/*`
- Auth mode: Email/password + email OTP
- Protected endpoints require session cookie

## Todos

### `GET /api/todos`
List todos for the authenticated user.

Query parameters:
- `limit` (optional) — number of items to return
- `offset` (optional) — number of items to skip

### `POST /api/todos`
Create a new todo.

Request:
```json
{
  "title": "string",
  "description": "string (optional)"
}
```

### `GET /api/todos/:id`
Get todo details.

### `PATCH /api/todos/:id`
Update a todo.

Request:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "completed": "boolean (optional)"
}
```

### `DELETE /api/todos/:id`
Delete a todo.

### `POST /api/todos/:id/enhance-description`
Use AI to enhance the todo description.

## Billing

### `POST /api/billing/checkout`
Create checkout session.

Request:
```json
{
  "plan": "starter | pro",
  "successUrl": "string",
  "cancelUrl": "string"
}
```

### `GET /api/billing/portal`
Create billing portal session.

### `GET /api/billing/plan`
Get the authenticated user's current subscription plan.

Response:
```json
{
  "plan": "free"
}
```

## Account

### `DELETE /api/account`
Delete the authenticated user's account and data.

Response:
```json
{ "success": true }
```
