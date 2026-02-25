<script lang="ts">
	import { MultiStepFormStore } from '../stores/MultiStepFormStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import Input from '$lib/common/components/Input.svelte';
	import Button from '$lib/common/components/Button.svelte';

	type Props = {
		onComplete?: (data: any) => void | Promise<void>;
	};

	let { onComplete }: Props = $props();

	const store = new MultiStepFormStore();

	let isLoading = $state(false);
	let errorMessage = $state('');

	async function handleStep1Submit(data: any) {
		store.saveStepData(1, data);
		store.nextStep();
	}

	async function handleStep2Submit(data: any) {
		store.saveStepData(2, data);
		store.nextStep();
	}

	async function handleStep3Submit(data: any) {
		store.saveStepData(3, data);

		isLoading = true;
		errorMessage = '';

		try {
			const fullData = store.getFullData();
			await onComplete?.(fullData);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Something went wrong';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body">
		<!-- Progress indicator -->
		<div class="mb-6">
			<ul class="steps w-full">
				<li class="step {store.currentStep >= 1 ? 'step-primary' : ''}">Personal Info</li>
				<li class="step {store.currentStep >= 2 ? 'step-primary' : ''}">Contact</li>
				<li class="step {store.currentStep >= 3 ? 'step-primary' : ''}">Preferences</li>
			</ul>
		</div>

		{#if errorMessage}
			<div role="alert" class="mb-4 alert alert-error">
				<span>{errorMessage}</span>
			</div>
		{/if}

		<!-- Step 1: Personal Information -->
		{#if store.currentStep === 1}
			<form
				class="flex flex-col gap-4"
				use:formController={{
					formStore: store.step1Store,
					onSubmit: handleStep1Submit
				}}
			>
				<h2 class="text-xl font-semibold">Personal Information</h2>

				<Input
					label="First Name"
					name="firstName"
					type="text"
					placeholder="Enter your first name"
					required
					error={store.step1Store.errors.firstName?.message}
				/>

				<Input
					label="Last Name"
					name="lastName"
					type="text"
					placeholder="Enter your last name"
					required
					error={store.step1Store.errors.lastName?.message}
				/>

				<div class="mt-4 flex gap-2">
					<Button type="submit" variant="primary" class="flex-1">Next</Button>
				</div>
			</form>
		{/if}

		<!-- Step 2: Contact Information -->
		{#if store.currentStep === 2}
			<form
				class="flex flex-col gap-4"
				use:formController={{
					formStore: store.step2Store,
					onSubmit: handleStep2Submit
				}}
			>
				<h2 class="text-xl font-semibold">Contact Information</h2>

				<Input
					label="Email"
					name="email"
					type="email"
					placeholder="Enter your email"
					required
					error={store.step2Store.errors.email?.message}
				/>

				<Input
					label="Phone (Optional)"
					name="phone"
					type="tel"
					placeholder="Enter your phone number"
					error={store.step2Store.errors.phone?.message}
				/>

				<div class="mt-4 flex gap-2">
					<Button type="button" variant="ghost" onclick={() => store.previousStep()} class="flex-1">
						Back
					</Button>
					<Button type="submit" variant="primary" class="flex-1">Next</Button>
				</div>
			</form>
		{/if}

		<!-- Step 3: Preferences -->
		{#if store.currentStep === 3}
			<form
				class="flex flex-col gap-4"
				inert={isLoading}
				use:formController={{
					formStore: store.step3Store,
					onSubmit: handleStep3Submit
				}}
			>
				<h2 class="text-xl font-semibold">Your Preferences</h2>

				<div class="flex flex-col gap-1">
					<label for="preferences" class="label text-sm text-gray-300">Preferences</label>
					<select
						name="preferences"
						id="preferences"
						class="select w-full {store.step3Store.errors.preferences ? 'select-error' : ''}"
					>
						<option value="">Select your preference</option>
						<option value="option1">Option 1</option>
						<option value="option2">Option 2</option>
						<option value="option3">Option 3</option>
					</select>
					{#if store.step3Store.errors.preferences}
						<span class="text-xs text-error">{store.step3Store.errors.preferences.message}</span>
					{/if}
				</div>

				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-2">
						<input type="checkbox" name="newsletter" class="checkbox checkbox-primary" />
						<span class="label-text">Subscribe to newsletter</span>
					</label>
				</div>

				<div class="mt-4 flex gap-2">
					<Button
						type="button"
						variant="ghost"
						onclick={() => store.previousStep()}
						disabled={isLoading}
						class="flex-1"
					>
						Back
					</Button>
					<Button type="submit" variant="primary" loading={isLoading} class="flex-1">
						{isLoading ? 'Submitting...' : 'Complete'}
					</Button>
				</div>
			</form>
		{/if}
	</div>
</div>
