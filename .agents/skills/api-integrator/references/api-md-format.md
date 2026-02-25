# docs/API.md Format Reference

## Document Structure

docs/API.md follows a consistent markdown structure for documenting REST API endpoints.

### Section Hierarchy

```
# API Documentation
## Authentication
## Base URL
## Endpoints
### [Resource Name]
#### [Operation Number]. [Operation Name]
## Common Response Patterns
## Data Models
## Notes for Frontend Integration
```

### Endpoint Documentation Format

Each endpoint follows this structure:

````markdown
#### N. Operation Name

Brief description

**Endpoint:** `METHOD /api/path/:param`

**URL Parameters:**

- `param` (required/optional): Description

**Query Parameters:**

- `param` (optional): Description (default: value)

**Request Body:**

```json
{
	"field": "value"
}
```
````

**Validation Rules:**

- `field` (required/optional): type, constraints

**Success Response:**

**Status:** `200 OK`

```json
{
	"data": {}
}
```

**Error Responses:**

| Status Code | Error Type           | Description |
| ----------- | -------------------- | ----------- |
| `400`       | ValidationError      | ...         |
| `401`       | UnauthenticatedError | ...         |

````

## Parsing Strategy

### 1. Identify Endpoints

Look for headers matching: `#### [Number]. [Operation Name]`

Examples:
- `#### 1. Create Todo`
- `#### 2. List Todos`
- `#### 6. Enhance Todo Description`

### 2. Extract HTTP Method and Path

Find line starting with `**Endpoint:**`

Pattern: `**Endpoint:** \`METHOD /api/path\``

Examples:
- `**Endpoint:** \`POST /api/todos\``
- `**Endpoint:** \`GET /api/todos/:id\``
- `**Endpoint:** \`PATCH /api/todos/:id\``

### 3. Parse URL Parameters

Find section `**URL Parameters:**` followed by bullet list.

Pattern: `- \`param\` (required/optional): Description`

Example:
```markdown
**URL Parameters:**
- `id` (required): The todo ID
````

### 4. Parse Query Parameters

Find section `**Query Parameters:**` followed by bullet list.

Pattern: `- \`param\` (optional): Description (default: value)`

Example:

```markdown
**Query Parameters:**

- `limit` (optional): Maximum number to return (default: 100)
- `offset` (optional): Number to skip (default: 0)
```

### 5. Parse Request Body

Find JSON code block after `**Request Body:**`

Look for inline comments like `// optional` to determine optional fields.

Example:

````markdown
**Request Body:**

```json
{
	"title": "Buy groceries",
	"description": "Milk, eggs" // optional
}
```
````

````

### 6. Parse Success Response

Find JSON code block after `**Success Response:**` and `**Status:** \`200 OK\``

This defines the response type structure.

Example:
```markdown
**Success Response:**

**Status:** `200 OK`

```json
{
  "todo": {
    "id": "01JQWE123",
    "title": "Buy groceries",
    "description": "Milk, eggs",
    "completed": false,
    "ownerId": "user123"
  }
}
````

````

### 7. Extract Data Models

Find `## Data Models` section with TypeScript type definitions.

Example:
```markdown
## Data Models

### Todo

```typescript
{
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  ownerId: string;
}
````

````

## Type Inference Rules

### Optional Fields

Fields are optional if:
1. Marked with `// optional` in JSON examples
2. Marked with `(optional)` in parameter lists
3. Have `?:` in TypeScript Data Models
4. Listed under "Note: All fields are optional" sections

### Required Fields

Fields are required if:
1. Marked with `(required)` in parameter lists
2. Not marked as optional
3. Listed under Validation Rules without "(optional)"

### Field Types

Infer TypeScript types from:
1. TypeScript Data Models section (authoritative)
2. JSON example values (fallback)
   - String values → `string`
   - Number values → `number`
   - Boolean values → `boolean`
   - null → Optional type
   - Array → `Type[]`

### Nested Objects

For response objects containing nested entities:

```json
{
  "todo": { "id": "...", "title": "..." }
}
````

Generate response type that references the DTO:

```typescript
export type CreateTodoResponse = {
	todo: Todo; // Reference to DTO
};
```

## Service Naming Convention

Derive service function names from operation names:

| Operation Name           | Service Function     | File Name               |
| ------------------------ | -------------------- | ----------------------- |
| Create Todo              | `createTodo`         | `createTodo.ts`         |
| List Todos               | `listTodos`          | `listTodos.ts`          |
| Get Todo Details         | `getTodoById`        | `getTodoById.ts`        |
| Update Todo              | `updateTodo`         | `updateTodo.ts`         |
| Delete Todo              | `deleteTodo`         | `deleteTodo.ts`         |
| Enhance Todo Description | `enhanceDescription` | `enhanceDescription.ts` |

Pattern: Convert to camelCase, remove entity name if redundant, use descriptive verb.
