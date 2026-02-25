<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { routes } from '$lib/common/routes';

	$effect(() => {
		goto(resolve(routes.app));
	});
</script>
