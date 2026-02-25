---
name: svelte5-component-creator
description: Create Svelte 5 components following the web-template project structure and design system. Use when the user asks to (1) create a new Svelte component, (2) build a UI component, (3) add a component to a feature module, (4) scaffold components with proper structure. Enforces docs/DESIGN_SYSTEM.md design tokens, Svelte 5 runes syntax, component scoping, and project conventions from CLAUDE.md. Triggers on requests like "create a component", "build a button component", "add a modal to the todos feature", "scaffold UI components".
---

# Svelte 5 Component Creator

This skill guides the creation of Svelte 5 components following the web-template project's architecture, design system, and conventions.

Resolve the web package root first (for example `code/web` or `web`) and run component edits there. Resolve the repository root separately for shared docs like `docs/DESIGN_SYSTEM.md`.

## ⚠️ CRITICAL REQUIREMENTS

Before creating ANY component, you MUST:

1. **Read docs/DESIGN_SYSTEM.md** - All styling must use design tokens from this file
2. **Follow CLAUDE.md conventions** - Svelte 5 runes, component patterns, code organization
3. **Understand the feature context** - Determine if this is a common component or feature-specific

## Component Placement Rules

### Common Components (`src/lib/common/components/`)

Place here if the component:

- Is reusable across multiple features (Modal, Header, ToastContainer)
- Provides UI primitives (buttons, inputs, cards, badges)
- Has no feature-specific business logic

**Examples:** `Modal.svelte`, `Header.svelte`, `Button.svelte`, `Badge.svelte`

### Feature Components (`src/lib/[feature]/components/`)

Place here if the component:

- Belongs to a specific domain (todos, clients, proposals)
- Contains feature-specific logic or data
- Integrates with feature stores or services

**Examples:** `TodoFormModal.svelte`, `TodoTable.svelte`, `ClientCard.svelte`

## Svelte 5 Syntax Rules (from CLAUDE.md)

**MANDATORY Svelte 5 patterns:**

```svelte
<!-- ✅ CORRECT: Use runes -->
<script lang="ts">
	type Props = {
		label: string;
		error?: string;
	};

	let { label, error }: Props = $props();
    let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<!-- ❌ WRONG: Legacy syntax -->
<script lang="ts">
	let count = 0; // Don't use this for reactive state
	$: doubled = count * 2; // Don't use $: labels

	export let label: string; // Don't use export for props
</script>
```

**Children and Events:**

```svelte
<!-- ✅ CORRECT: Snippet render -->
<div>{@render children?.()}</div>

<!-- ❌ WRONG: Slots -->
<div><slot /></div>

<!-- ✅ CORRECT: Standard DOM attributes -->
<button onclick={handleClick}>Click</button>

<!-- ❌ WRONG: on: directive -->
<button on:click={handleClick}>Click</button>
```

**Props Pattern:**

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		description?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: Snippet;
	};

	let { title, description, disabled = false, onclick, children }: Props = $props();
</script>
```

## Design System Integration

### ⚠️ CRITICAL: Read docs/DESIGN_SYSTEM.md Before Styling

**Before writing ANY styles, you MUST:**

1. Read `docs/DESIGN_SYSTEM.md`
2. Understand available design tokens in sections 1, 2, and 3
3. Use ONLY tokens defined in that file - NEVER hardcode values

**Token categories available:**

- Section 1: Primitive tokens (colors, spacing, typography, borders, shadows, animations, z-index)
- Section 2: Semantic tokens (backgrounds, text, borders, icons, spacing, typography, elevation, animations)
- Section 3: Component-specific tokens (buttons, inputs, cards, etc.)

**Example of correct token usage:**

```css
/* ✅ CORRECT: Use semantic tokens from docs/DESIGN_SYSTEM.md */
.component {
	background: var(--bg-primary);
	color: var(--text-primary);
	padding: var(--spacing-component-md);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-md);
	transition: all var(--duration-normal) var(--ease-out);
}

/* ❌ WRONG: Hardcoded values */
.component {
	background: #ffffff; /* NEVER hardcode colors */
	padding: 12px; /* NEVER hardcode spacing */
}
```

## Component Structure Template

### Basic Component

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		// Required props
		title: string;

		// Optional props with defaults
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;

		// Event handlers
		onclick?: (e: MouseEvent) => void;

		// Children
		children?: Snippet;
	};

	let { title, variant = 'primary', disabled = false, onclick, children }: Props = $props();

	// State
	let isHovered = $state(false);

	// Derived state
	let buttonClass = $derived(`btn btn-${variant}`);

	// Event handlers
	function handleClick(e: MouseEvent) {
		if (disabled) return;
		onclick?.(e);
	}
</script>

<button
	class={buttonClass}
	{disabled}
	onclick={handleClick}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{title}
	{@render children?.()}
</button>

<style>
	.btn {
		/* Use design tokens exclusively */
		padding: var(--spacing-component-md) var(--spacing-component-lg);
		border-radius: var(--radius-lg);
		font-family: var(--font-heading);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		transition: all var(--duration-normal) var(--ease-out);
		cursor: pointer;
		border: var(--border-1) solid transparent;
	}

	.btn-primary {
		background: var(--bg-brand);
		color: var(--text-inverse);
		border-color: var(--border-brand);
	}

	.btn-primary:hover {
		background: var(--bg-brand-strong);
		box-shadow: var(--shadow-brand);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
```

### Form Input Component

```svelte
<script lang="ts">
	type Props = {
		id: string;
		label: string;
		type?: 'text' | 'email' | 'password';
		value?: string;
		error?: string;
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		onchange?: (value: string) => void;
	};

	let {
		id,
		label,
		type = 'text',
		value = $bindable(''),
		error,
		placeholder,
		disabled = false,
		required = false,
		onchange
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}
</script>

<div class="form-field">
	<label for={id} class="form-label">
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>

	<input
		{id}
		{type}
		class="form-input"
		class:error
		{value}
		{placeholder}
		{disabled}
		{required}
		oninput={handleInput}
	/>

	{#if error}
		<p class="form-error">{error}</p>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-component-sm);
	}

	.form-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
	}

	.required {
		color: var(--text-error);
	}

	.form-input {
		padding: var(--spacing-component-md);
		border: var(--border-1) solid var(--border-primary);
		border-radius: var(--radius-lg);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: var(--text-base);
		font-family: var(--font-body);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.form-input:focus {
		outline: none;
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px var(--bg-accent-subtle);
	}

	.form-input.error {
		border-color: var(--border-error);
	}

	.form-input:disabled {
		background: var(--bg-secondary);
		color: var(--text-disabled);
		cursor: not-allowed;
	}

	.form-error {
		font-size: var(--text-xs);
		color: var(--text-error);
		margin: 0;
	}
</style>
```

## Accessibility Requirements

Every component MUST include:

1. **Semantic HTML**: Use proper elements (`<button>`, `<label>`, `<input>`)
2. **ARIA attributes**: When semantic HTML isn't sufficient
3. **Keyboard navigation**: Tab order, Enter/Space for actions
4. **Focus indicators**: Use design tokens for focus states
5. **Screen reader support**: Meaningful labels, `aria-label` when needed

```svelte
<!-- Good accessibility example -->
<button aria-label="Close modal" onclick={onClose}>
	<svg aria-hidden="true">...</svg>
</button>

<input id="search" type="search" aria-describedby="search-help" />
<p id="search-help">Search across all todos</p>
```

## Component Creation Workflow

1. **Determine placement**: Common vs feature-specific
2. **Read docs/DESIGN_SYSTEM.md**: MANDATORY - Load and understand all available design tokens
3. **Define Props type**: Use Svelte 5 patterns
4. **Implement logic**: Use runes (`$state`, `$derived`, `$effect`)
5. **Write template**: Use `{@render}`, standard DOM events
6. **Apply styles**: ONLY use design tokens from docs/DESIGN_SYSTEM.md (never hardcode)
7. **Add accessibility**: ARIA, keyboard, focus management
8. **Verify tokens**: All styles must map to tokens from docs/DESIGN_SYSTEM.md

## Common Patterns Reference

### Modal Integration

```svelte
<Modal {open} {onClose}>
	<div class="my-content">
		<!-- Content here -->
	</div>
</Modal>
```

### Conditional Rendering

```svelte
{#if loading}
	<div class="spinner">Loading...</div>
{:else if error}
	<div class="error">{error}</div>
{:else}
	<div class="content">{data}</div>
{/if}
```

### Lists

```svelte
{#each items as item (item.id)}
	<div class="item">{item.name}</div>
{:else}
	<p>No items found</p>
{/each}
```

### Bindable Props

```svelte
type Props = {
	value?: string;
};

let { value = $bindable('') }: Props = $props();
```

## Anti-Patterns (NEVER DO THIS)

❌ **Barrel files / index.ts exports**

```typescript
// DON'T create src/lib/common/components/index.ts
export { default as Modal } from './Modal.svelte';
export { default as Header } from './Header.svelte';
```

❌ **Hardcoded colors/spacing**

```css
.component {
	background: #ffffff; /* NEVER */
	padding: 12px; /* NEVER */
}
```

❌ **Legacy Svelte syntax**

```svelte
<script>
	export let value;  /* Use $props() */
	$: doubled = value * 2;  /* Use $derived */
</script>

<slot />  <!-- Use {@render children?.()} -->
<button on:click={fn}>  <!-- Use onclick={fn} -->
```

❌ **Global styles**

```css
/* NEVER apply global styles in components */
:global(body) {
	background: red;
}
```

## When to Read Additional Files

- **Before styling ANY component** → ALWAYS read docs/DESIGN_SYSTEM.md (all sections)
- **Dark mode questions?** → Read docs/DESIGN_SYSTEM.md section 2.1 (Dark Mode Overrides)
- **Component-specific tokens?** → Read docs/DESIGN_SYSTEM.md section 3 (Component Tokens)
- **Understanding existing patterns?** → Read similar components in `src/lib/*/components/`

## Quick Checklist

Before completing component creation, verify:

- [ ] Correct placement (common vs feature)
- [ ] Uses Svelte 5 runes (`$state`, `$derived`, `$props`)
- [ ] Props defined with `type Props`
- [ ] Children use `{@render children?.()}`
- [ ] Events use `onclick` not `on:click`
- [ ] ALL styles use design tokens (no hardcoded values)
- [ ] Accessibility attributes present
- [ ] Focus states defined
- [ ] Keyboard navigation works
- [ ] No barrel files created

---

**For complete design token reference, always read docs/DESIGN_SYSTEM.md before generating styles.**
**For architecture patterns and conventions, reference CLAUDE.md.**
