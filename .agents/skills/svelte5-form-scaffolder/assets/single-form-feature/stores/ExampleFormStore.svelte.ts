import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import * as v from 'valibot';

// Define your form schema with Valibot
const exampleFormSchema = v.object({
	// Example field: required string with minimum length
	name: v.pipe(
		v.string('Name is required'),
		v.trim(),
		v.minLength(2, 'Name must be at least 2 characters')
	),
	// Example field: validated email
	email: v.pipe(v.string(), v.email('Invalid email address')),
	// Example field: optional string with default
	message: v.optional(v.string(), '')
	// Add more fields as needed
});

// Export type helpers for use in components and services
export type ExampleFormOutput = FormTypes<typeof exampleFormSchema>['output'];
export type ExampleFormInput = FormTypes<typeof exampleFormSchema>['input'];
export type ExampleFormErrors = FormTypes<typeof exampleFormSchema>['errors'];

// FormStore class - extends FormControllerBase with your schema
export class ExampleFormStore extends FormControllerBase<typeof exampleFormSchema> {
	constructor(initialData?: Partial<ExampleFormInput>) {
		super(exampleFormSchema, {
			name: initialData?.name || '',
			email: initialData?.email || '',
			message: initialData?.message || ''
		});
	}
}

// Optional: Factory function for creating instances
export function createExampleFormStore(initialData?: Partial<ExampleFormInput>) {
	return new ExampleFormStore(initialData);
}
