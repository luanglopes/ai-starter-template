<script lang="ts">
	import TodoList from '$lib/todos/components/TodoList.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { getTodoListStore } from '$lib/todos/stores/TodoListStore.svelte';

	const todoStore = getTodoListStore();
	const i18nStore = getI18nStore();

	let title = $state('');
	let description = $state('');

	$effect(() => {
		todoStore.load();
	});

	async function handleCreate() {
		if (!title.trim()) return;
		const ok = await todoStore.create({ title, description: description || undefined });
		if (ok) {
			title = '';
			description = '';
		}
	}
</script>

<section class="todos-page">
	<header class="page-header">
		<h1>{i18nStore.t('todos.title')}</h1>
		<p>{i18nStore.t('todos.subtitle')}</p>
	</header>

	<form
		class="create-form"
		onsubmit={(e) => {
			e.preventDefault();
			handleCreate();
		}}
	>
		<input type="text" bind:value={title} placeholder={i18nStore.t('todos.titlePlaceholder')} />
		<textarea
			bind:value={description}
			rows="3"
			placeholder={i18nStore.t('todos.descriptionPlaceholder')}
		></textarea>
		<button type="submit">{i18nStore.t('todos.addTodo')}</button>
	</form>

	{#if todoStore.error}
		<p class="error">{todoStore.error}</p>
	{/if}

	{#if todoStore.loading}
		<p>{i18nStore.t('common.status.loading')}</p>
	{:else if todoStore.todos.length === 0}
		<p>{i18nStore.t('todos.empty')}</p>
	{:else}
		<TodoList
			todos={todoStore.todos}
			actionLoading={todoStore.actionLoading}
			onToggle={(todo) => todoStore.toggle(todo)}
			onEnhance={(id) => todoStore.enhance(id)}
			onRemove={(id) => todoStore.remove(id)}
		/>
	{/if}
</section>

<style>
	.todos-page {
		max-width: 840px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
		display: grid;
		gap: var(--space-5);
	}

	.page-header h1 {
		margin: 0;
	}

	.page-header p {
		margin: var(--space-1) 0 0;
		color: var(--text-mid);
	}

	.create-form {
		display: grid;
		gap: var(--space-2);
		padding: var(--space-4);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--surface);
	}

	input,
	textarea {
		width: 100%;
		padding: var(--space-2);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--bg);
		color: var(--white);
	}

	button {
		justify-self: start;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-sm);
		border: 1px solid var(--primary);
		background: var(--primary);
		color: var(--primary-on);
	}

	.error {
		color: var(--danger);
	}
</style>
