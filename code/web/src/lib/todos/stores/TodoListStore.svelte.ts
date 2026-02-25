import { createTodo } from '$lib/todos/services/createTodo';
import { deleteTodo } from '$lib/todos/services/deleteTodo';
import { enhanceTodoDescription } from '$lib/todos/services/enhanceTodoDescription';
import { listTodos } from '$lib/todos/services/listTodos';
import { updateTodo } from '$lib/todos/services/updateTodo';
import type { Todo } from '../dtos/Todo';

export class TodoListStore {
	todos = $state<Todo[]>([]);
	total = $state(0);
	loading = $state(false);
	error = $state<string | null>(null);
	actionLoading = $state<Record<string, boolean>>({});

	async load() {
		this.loading = true;
		this.error = null;

		const result = await listTodos();
		if (result.isErr()) {
			this.error = result.error.error;
			this.loading = false;
			return;
		}

		this.todos = result.value.todos;
		this.total = result.value.total;
		this.loading = false;
	}

	async create(input: { title: string; description?: string }) {
		const result = await createTodo(input);
		if (result.isErr()) {
			this.error = result.error.error;
			return false;
		}
		this.todos = [result.value.todo, ...this.todos];
		this.total += 1;
		return true;
	}

	async toggle(todo: Todo) {
		this.actionLoading[todo.id] = true;
		const result = await updateTodo(todo.id, { completed: !todo.completed });
		this.actionLoading[todo.id] = false;
		if (result.isErr()) {
			this.error = result.error.error;
			return;
		}
		this.todos = this.todos.map((item) => (item.id === todo.id ? result.value.todo : item));
	}

	async update(id: string, input: { title?: string; description?: string }) {
		this.actionLoading[id] = true;
		const result = await updateTodo(id, input);
		this.actionLoading[id] = false;
		if (result.isErr()) {
			this.error = result.error.error;
			return false;
		}
		this.todos = this.todos.map((item) => (item.id === id ? result.value.todo : item));
		return true;
	}

	async remove(id: string) {
		this.actionLoading[id] = true;
		const result = await deleteTodo(id);
		this.actionLoading[id] = false;
		if (result.isErr()) {
			this.error = result.error.error;
			return;
		}
		this.todos = this.todos.filter((item) => item.id !== id);
		this.total = Math.max(0, this.total - 1);
	}

	async enhance(id: string) {
		this.actionLoading[id] = true;
		const result = await enhanceTodoDescription(id);
		this.actionLoading[id] = false;
		if (result.isErr()) {
			this.error = result.error.error;
			return;
		}
		this.todos = this.todos.map((item) => (item.id === id ? result.value.todo : item));
	}
}

let todoListStore: TodoListStore;

export function getTodoListStore() {
	if (!todoListStore) {
		todoListStore = new TodoListStore();
	}
	return todoListStore;
}
