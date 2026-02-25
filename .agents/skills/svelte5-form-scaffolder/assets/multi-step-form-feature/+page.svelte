<script lang="ts">
	import MultiStepForm from '$lib/multistep/components/MultiStepForm.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { routes } from '$lib/common/routes';

	async function handleComplete(data: any) {
		console.log('Form completed with data:', data);

		// Example: Submit to API
		// const response = await api.post('/api/onboarding', data);

		// Redirect on success
		// await goto(resolve(routes.app));
	}
</script>

<div class="container mx-auto p-6">
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-6 text-3xl font-bold">Multi-Step Form Example</h1>
		<MultiStepForm onComplete={handleComplete} />
	</div>
</div>
