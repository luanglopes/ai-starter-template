<script lang="ts">
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import type { Todo } from '$lib/todos/dtos/Todo';

	type Props = {
		todos: Todo[];
		actionLoading: Record<string, boolean>;
		onToggle: (todo: Todo) => void;
		onEnhance: (id: string) => void;
		onRemove: (id: string) => void;
	};

	let { todos, actionLoading, onToggle, onEnhance, onRemove }: Props = $props();
	const i18nStore = getI18nStore();
</script>

<ul class="todo-list">
	{#each todos as todo (todo.id)}
		<li class="todo-item" class:todo-item--done={todo.completed}>
			<div class="todo-main">
				<label class="checkbox">
					<input type="checkbox" checked={todo.completed} onchange={() => onToggle(todo)} />
					<span>{todo.title}</span>
				</label>
				{#if todo.description}
					<p class="description">{todo.description}</p>
				{/if}
			</div>
			<div class="actions">
				<button type="button" onclick={() => onEnhance(todo.id)} disabled={actionLoading[todo.id]}>
					{i18nStore.t('todos.actions.aiEnhance')}
				</button>
				<button
					type="button"
					class="danger"
					onclick={() => onRemove(todo.id)}
					disabled={actionLoading[todo.id]}
				>
					{i18nStore.t('todos.actions.delete')}
				</button>
			</div>
		</li>
	{/each}
</ul>

<style>
	.todo-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--space-3);
	}

	.todo-item {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-4);
		background: var(--surface);
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.todo-item--done {
		opacity: 0.7;
	}

	.todo-main {
		min-width: 0;
	}

	.checkbox {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: var(--weight-semibold);
	}

	.description {
		margin: var(--space-2) 0 0;
		color: var(--text-mid);
	}

	.actions {
		display: flex;
		gap: var(--space-2);
	}

	button {
		padding: var(--space-1_5) var(--space-3);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--surface-raised);
		color: var(--white);
	}

	button.danger {
		border-color: var(--danger);
		color: var(--danger);
	}
</style>
