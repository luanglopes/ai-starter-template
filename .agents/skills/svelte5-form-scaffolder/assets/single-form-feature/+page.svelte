<script lang="ts">
	import ExampleForm from '$lib/example/components/ExampleForm.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { routes } from '$lib/common/routes';

	function handleSuccess() {
		// Redirect or show success message
		// goto(resolve(routes.app));
		console.log('Form submitted successfully!');
	}
</script>

<div class="container mx-auto p-6">
	<div class="mx-auto max-w-2xl">
		<h1 class="mb-6 text-3xl font-bold">Example Page</h1>
		<ExampleForm onSuccess={handleSuccess} />
	</div>
</div>
