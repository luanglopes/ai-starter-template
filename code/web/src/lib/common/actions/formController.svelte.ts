import * as v from 'valibot';
import type { ActionReturn } from 'svelte/action';
import { err, ok, Result } from 'neverthrow';

type FormSchema = v.ObjectSchema<v.ObjectEntries, undefined>;
type FormValue<S extends FormSchema> = v.InferInput<S>;
type FormFields<S extends FormSchema> = keyof FormValue<S>;
type FormErrors<S extends FormSchema> = {
	[k in FormFields<S>]?: v.InferIssue<S['entries'][k]> | undefined;
};

export type FormTypes<S extends FormSchema> = {
	input: v.InferInput<S>;
	output: v.InferOutput<S>;
	errors: FormErrors<S>;
};

export class FormControllerBase<S extends FormSchema, V extends FormValue<S> = FormValue<S>> {
	#initialValue: V;
	#formEl: HTMLFormElement | undefined;
	#schemaProvider: (() => S) | undefined;
	schema: S;
	value: V = $state<V>({} as V);
	errors = $state<FormErrors<S>>({});

	constructor(schema: S | (() => S), initialValue: V) {
		this.#initialValue = initialValue;
		this.value = { ...initialValue };
		if (typeof schema === 'function') {
			this.#schemaProvider = schema;
			this.schema = this.#schemaProvider();
		} else {
			this.schema = schema;
		}
	}

	#refreshSchema() {
		if (this.#schemaProvider) {
			this.schema = this.#schemaProvider();
		}
	}

	set formEl(el: HTMLFormElement) {
		this.#formEl = el;
	}

	get hasChanges(): boolean {
		return Object.keys(this.#initialValue).some(
			(key) => !this.#deepEqual(this.value[key as keyof V], this.#initialValue[key as keyof V])
		);
	}

	#deepEqual(a: unknown, b: unknown): boolean {
		if (a === b) return true;
		if (a == null || b == null) return a === b;
		if (typeof a !== 'object' || typeof b !== 'object') return false;

		const aKeys = Object.keys(a as Record<string, unknown>);
		const bKeys = Object.keys(b as Record<string, unknown>);

		if (aKeys.length !== bKeys.length) return false;

		return aKeys.every((key) =>
			this.#deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
		);
	}

	validateField(fieldName: FormFields<S>): void | Promise<void> {
		this.#refreshSchema();
		const result = v.safeParse(this.schema.entries[fieldName as string], this.value[fieldName]);
		this.errors[fieldName] = result.success ? undefined : result.issues[0];
	}

	handleChange(fieldName: FormFields<S>, fieldValue: V[FormFields<S>]): void {
		this.value[fieldName] = fieldValue;
	}

	getValidatedValue(): Result<v.InferOutput<S>, Error> {
		this.#refreshSchema();
		const result = v.safeParse(this.schema, this.value);
		if (result.success) return ok(result.output);
		this.errors = result.issues.reduce((acc, issue) => {
			if (!issue.path?.[0]) return acc;
			return { ...acc, [issue.path[0].key as FormFields<S>]: issue };
		}, {} as FormErrors<S>);
		console.log('Current form value:', $state.snapshot(this.value));
		console.log('Validation errors:', $state.snapshot(this.errors));
		return err(new Error('Validation error'));
	}

	reset(): void {
		this.value = { ...this.#initialValue };
		this.errors = {};
		this.#formEl?.reset();
	}
}

type Params<S extends FormSchema, V extends v.InferInput<S>> = {
	formStore: FormControllerBase<S, V>;
	onSubmit: (data: v.InferOutput<S>) => void | Promise<void>;
};

export function formController<V extends FormValue<S>, S extends FormSchema = FormSchema>(
	node: HTMLFormElement,
	params: Params<S, V>
): ActionReturn<Params<S, V>> {
	let { formStore, onSubmit } = params;

	function canControlField(field: HTMLInputElement) {
		return field.name && field.name in formStore.schema.entries;
	}

	function register() {
		formStore.formEl = node;

		node.querySelectorAll<HTMLInputElement>('input, select, textarea').forEach((field) => {
			if (!canControlField(field)) return;

			$effect(() => {
				field.value = String(formStore.value[field.name as keyof V] ?? '');
			});

			field.oninput = () => {
				let value: unknown = field.value;
				if (field.type === 'number' || field.type === 'range') value = Number(value);
				if (field.type === 'checkbox') value = field.checked;
				formStore.handleChange(field.name as FormFields<S>, value as V[FormFields<S>]);
			};

			if (field.tagName === 'SELECT') {
				field.onchange = () => {
					formStore.validateField(field.name as FormFields<S>);
				};
			} else {
				field.onblur = () => {
					formStore.validateField(field.name as FormFields<S>);
				};
			}
		});

		node.onsubmit = (e) => {
			e.preventDefault();
			const result = formStore.getValidatedValue();
			if (result.isOk()) onSubmit(result.value);
		};
	}

	function unregister() {
		node.querySelectorAll<HTMLInputElement>('input, select, textarea').forEach((field) => {
			if (!canControlField(field)) return;
			field.oninput = null;
			field.onblur = null;
			field.onchange = null;
		});
		node.onsubmit = null;
	}

	register();

	return {
		update(newParams: Params<S, V>) {
			unregister();

			formStore = newParams.formStore;
			onSubmit = newParams.onSubmit;

			register();
		},
		destroy() {
			unregister();
		}
	};
}
