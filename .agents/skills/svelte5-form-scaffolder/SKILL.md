---
name: svelte5-form-scaffolder
description: Scaffold form-heavy features for Svelte 5 applications following established architecture patterns. Use when the user asks to create forms or form-based features such as (1) Contact forms, feedback forms, or simple data collection forms, (2) Multi-step forms like onboarding, wizards, or checkout flows, (3) CRUD forms for creating/editing resources, (4) Any feature that requires form validation with Valibot and neverthrow Results. Triggers include requests like "create a contact form feature", "build a multi-step onboarding form", "add a form to collect user feedback", or "scaffold a feature with form validation".
---

# Svelte 5 Form Scaffolder

Generates complete, production-ready form features following Svelte 5 + SvelteKit architecture patterns with Valibot validation, neverthrow Results, and proper separation of concerns.

Resolve the web package root first (for example `code/web` or `web`) and run scaffolding/file edits there.

**UI Component Reference**: For all form UI components (inputs, labels, buttons, layouts), use the **svelte5-component-creator** skill which enforces docs/DESIGN_SYSTEM.md design tokens.

## Quick Start

Choose the template based on form complexity:

**Single-form feature**: Use `assets/single-form-feature/` for simple forms (contact, feedback, single-entity CRUD)

**Multi-step form feature**: Use `assets/multi-step-form-feature/` for wizards, onboarding, or complex multi-page flows

## Scaffolding a Single-Form Feature

Use this for straightforward forms with a single submission.

**Prerequisites**: Generate service layer files first using the `api-integrator` skill. This skill focuses on form UI, validation, and state management.

### 1. Copy template files to feature directory

```
src/lib/{feature-name}/
├── stores/{Feature}FormStore.svelte.ts    # From: assets/single-form-feature/stores/ExampleFormStore.svelte.ts
└── components/{Feature}Form.svelte        # From: assets/single-form-feature/components/ExampleForm.svelte

src/routes/{route-path}/
└── +page.svelte                           # From: assets/single-form-feature/+page.svelte
```

**Note**: Service layer files should be generated using the `api-integrator` skill based on docs/API.md documentation.

### 2. Customize the FormStore

In `{Feature}FormStore.svelte.ts`:

1. Rename `exampleFormSchema` to `{feature}FormSchema`
2. Define form fields with Valibot validators:
   - Required strings: `v.pipe(v.string('Error message'), v.trim(), v.minLength(N))`
   - Email: `v.pipe(v.string(), v.email('Invalid email'))`
   - Optional fields: `v.optional(v.string(), '')`
   - Numbers: `v.pipe(v.number(), v.minValue(N))`
   - Booleans: `v.boolean()`
   - Custom: Use Valibot's pipe for chaining validators
3. Update type exports: `ExampleFormOutput` → `{Feature}FormOutput`
4. Update constructor initial values to match schema fields
5. Rename class: `ExampleFormStore` → `{Feature}FormStore`

### 3. Customize the Component

In `{Feature}Form.svelte`:

1. Update imports: `ExampleFormStore` → `{Feature}FormStore`
2. Import the appropriate service function (generated via `api-integrator` skill)
3. Customize Props type for any external data/callbacks needed
4. Update form fields to match schema:
   - Use `<Input>` for text/email/password/number fields
   - Use `<textarea>` with manual binding for text areas
   - Use `<select>` for dropdowns
   - Add `name` attribute matching schema field names
   - Bind errors: `error={formStore.errors.{fieldName}?.message}`
5. Update card title and labels
6. Customize success/error handling with neverthrow Result pattern

### 4. Add route page

In `+page.svelte`:

1. Import your component: `{Feature}Form`
2. Update import path: `$lib/example/components/ExampleForm.svelte` → `$lib/{feature}/components/{Feature}Form.svelte`
3. Customize `handleSuccess` callback (navigation, notifications, etc.)
4. Update page title and layout

### 5. Add route to routes.ts

```typescript
export const routes = {
	// ... existing routes
	{featureName}: '/{feature-path}'
} as const;
```

## Scaffolding a Multi-Step Form Feature

Use this for forms split across multiple steps/pages with shared state.

### 1. Copy template files to feature directory

```
src/lib/{feature-name}/
├── stores/MultiStep{Feature}Store.svelte.ts    # From: assets/multi-step-form-feature/stores/MultiStepFormStore.svelte.ts
└── components/MultiStep{Feature}.svelte        # From: assets/multi-step-form-feature/components/MultiStepForm.svelte

src/routes/{route-path}/
└── +page.svelte                                # From: assets/multi-step-form-feature/+page.svelte
```

### 2. Customize the Multi-Step Store

In `MultiStep{Feature}Store.svelte.ts`:

1. Define schemas for each step:
   - `step1Schema`, `step2Schema`, `step3Schema`, etc.
   - Each schema contains fields specific to that step
2. Create `fullFormSchema` combining all step schemas:
   ```typescript
   const fullFormSchema = v.object({
   	...step1Schema.entries,
   	...step2Schema.entries,
   	...step3Schema.entries
   });
   ```
3. Export types for each step: `Step1Data`, `Step2Data`, etc.
4. Create FormStore classes for each step extending `FormControllerBase`
5. Update `MultiStep{Feature}Store`:
   - Set `totalSteps` to match number of steps
   - Initialize step stores in constructor
   - Customize `formData` type to `Partial<FullFormData>`

### 3. Customize the Multi-Step Component

In `MultiStep{Feature}.svelte`:

1. Update imports with your renamed stores
2. Update `totalSteps` value
3. Customize progress indicator labels in `<ul class="steps">`
4. For each step:
   - Update section title
   - Add form fields matching step schema
   - Ensure `name` attributes match schema field names
   - Bind errors from the appropriate step store
5. Update final step submission handler to call your API service
6. Customize navigation button labels

### 4. Add route page

Similar to single-form, but import `MultiStep{Feature}` component and handle completion callback.

## Validation Patterns

Common Valibot patterns used in this architecture:

```typescript
// Required string with minimum length
v.pipe(v.string('Field is required'), v.trim(), v.minLength(3, 'Min 3 chars'));

// Email validation
v.pipe(v.string(), v.email('Invalid email address'));

// Optional with default
v.optional(v.string(), '');

// Number with range
v.pipe(v.number(), v.minValue(1), v.maxValue(100));

// Boolean
v.boolean();

// Custom validation
v.pipe(
	v.string(),
	v.custom((val) => val !== 'forbidden', 'Invalid value')
);

// Enum/literal
v.picklist(['option1', 'option2', 'option3']);
```

## Form Field Components

**Use the svelte5-component-creator skill for all form UI components.**

When creating form components (inputs, textareas, selects, buttons), invoke the `svelte5-component-creator` skill which will:

- Enforce docs/DESIGN_SYSTEM.md design tokens
- Follow Svelte 5 runes syntax
- Implement proper accessibility
- Handle error states and validation display

**Integration with FormStore:**

Form components created via `svelte5-component-creator` should accept these props for validation integration:

```svelte
type Props = {
	label: string;
	name: string;  // Must match schema field name
	error?: string;  // From formStore.errors.fieldName?.message
	value?: string;  // Bindable
	// ... other field-specific props
};
```

**Usage in forms:**

```svelte
<Input label="Email" name="email" type="email" error={formStore.errors.email?.message} />
```

## Architecture Conventions

**Naming**:

- Components: PascalCase (e.g., `ContactForm.svelte`)
- Stores: PascalCase with `.svelte.ts` extension (e.g., `ContactFormStore.svelte.ts`)
- Services: camelCase (e.g., `submitContact.ts`)
- Types: PascalCase (e.g., `ContactFormOutput`)

**File organization**:

- Feature modules in `src/lib/{feature}/`
- Each feature has `stores/`, `services/`, `components/` subdirectories
- Routes in `src/routes/` reference feature components
- Shared components in `src/lib/common/components/`

**Svelte 5 runes**:

- Use `$state` for reactive state in classes and components
- Use `$derived` for computed values
- Use `$props()` for component props
- Use `{@render children()}` instead of `<slot />`
- Use standard DOM events (`onclick`, `onchange`) not `on:` directive

**FormController pattern**:

- Form store extends `FormControllerBase` with Valibot schema
- Use `formController` action on `<form>` element
- Automatic field binding via `name` attributes
- Validation on blur, submission on form submit
- Error display via `formStore.errors.{fieldName}?.message`

## Common Customizations

**Adding file upload**:

```typescript
// In schema
fileUpload: v.optional(v.instanceof(File))

// In component
<input type="file" name="fileUpload" accept="image/*" />
```

**Conditional validation**:

```typescript
v.pipe(
	v.string(),
	v.custom((val) => (someCondition ? val.length > 5 : true), 'Conditional error')
);
```

**Async validation** (custom implementation):

```typescript
async validateField(fieldName: FormFields<S>): Promise<void> {
  // Add async check before calling super
  const isValid = await checkUsername(this.value[fieldName]);
  if (!isValid) {
    this.errors[fieldName] = { message: 'Already taken' };
    return;
  }
  super.validateField(fieldName);
}
```

**Form reset after success**:

```typescript
const result = await submitForm(data);
formStore.reset(); // Clears form and errors
```

**Redirect after submission**:

```typescript
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

async function handleSubmit(data: any) {
	await submitForm(data);
	await goto(resolve(routes.app));
}
```
