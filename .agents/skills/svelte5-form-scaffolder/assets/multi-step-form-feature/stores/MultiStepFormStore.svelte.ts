import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import * as v from 'valibot';

// Step 1 Schema
const step1Schema = v.object({
	firstName: v.pipe(v.string('First name is required'), v.trim(), v.minLength(2)),
	lastName: v.pipe(v.string('Last name is required'), v.trim(), v.minLength(2))
});

// Step 2 Schema
const step2Schema = v.object({
	email: v.pipe(v.string(), v.email('Invalid email address')),
	phone: v.optional(v.string(), '')
});

// Step 3 Schema
const step3Schema = v.object({
	preferences: v.pipe(v.string('Please select your preferences'), v.minLength(1)),
	newsletter: v.optional(v.boolean(), false)
});

// Combined schema for final submission
const fullFormSchema = v.object({
	...step1Schema.entries,
	...step2Schema.entries,
	...step3Schema.entries
});

// Type exports
export type Step1Data = FormTypes<typeof step1Schema>['output'];
export type Step2Data = FormTypes<typeof step2Schema>['output'];
export type Step3Data = FormTypes<typeof step3Schema>['output'];
export type FullFormData = FormTypes<typeof fullFormSchema>['output'];

// Individual step form stores
export class Step1FormStore extends FormControllerBase<typeof step1Schema> {
	constructor(initialData?: Partial<Step1Data>) {
		super(step1Schema, {
			firstName: initialData?.firstName || '',
			lastName: initialData?.lastName || ''
		});
	}
}

export class Step2FormStore extends FormControllerBase<typeof step2Schema> {
	constructor(initialData?: Partial<Step2Data>) {
		super(step2Schema, {
			email: initialData?.email || '',
			phone: initialData?.phone || ''
		});
	}
}

export class Step3FormStore extends FormControllerBase<typeof step3Schema> {
	constructor(initialData?: Partial<Step3Data>) {
		super(step3Schema, {
			preferences: initialData?.preferences || '',
			newsletter: initialData?.newsletter || false
		});
	}
}

// Multi-step orchestrator store
export class MultiStepFormStore {
	currentStep = $state(1);
	totalSteps = 3;

	// Accumulated data from all steps
	formData = $state<Partial<FullFormData>>({});

	// Step form stores
	step1Store = new Step1FormStore();
	step2Store = new Step2FormStore();
	step3Store = new Step3FormStore();

	constructor() {
		// Initialize with any saved data
		this.step1Store = new Step1FormStore(this.formData);
		this.step2Store = new Step2FormStore(this.formData);
		this.step3Store = new Step3FormStore(this.formData);
	}

	nextStep() {
		if (this.currentStep < this.totalSteps) {
			this.currentStep++;
		}
	}

	previousStep() {
		if (this.currentStep > 1) {
			this.currentStep--;
		}
	}

	saveStepData(step: number, data: Partial<FullFormData>) {
		this.formData = { ...this.formData, ...data };
	}

	getFullData(): FullFormData {
		return this.formData as FullFormData;
	}

	reset() {
		this.currentStep = 1;
		this.formData = {};
		this.step1Store.reset();
		this.step2Store.reset();
		this.step3Store.reset();
	}
}
