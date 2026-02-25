<script lang="ts">
	import './layout.css';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';

	const { children } = $props();
	const authStore = getAuthStore();
	const i18nStore = getI18nStore();

	let dismissed = $state(false);
	let exiting = $state(false);

	$effect(() => {
		i18nStore.init();
	});

	$effect(() => {
		if (!authStore.loaders.pending && i18nStore.ready && !dismissed) {
			exiting = true;
			const timer = setTimeout(() => {
				dismissed = true;
			}, 400);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if !authStore.loaders.pending && i18nStore.ready}
	{@render children()}
{/if}

{#if !dismissed}
	<div class="splash" class:exiting>
		<div class="splash-content">
			<div class="brand">{i18nStore.t('common.appName')}</div>
		</div>
	</div>
{/if}

<style>
	.splash {
		position: fixed;
		inset: 0;
		z-index: var(--z-splash);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg);
		transition: opacity 0.4s var(--ease-smooth);
	}

	.splash.exiting {
		opacity: 0;
		pointer-events: none;
	}

	.brand {
		font-family: var(--display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-bold);
		color: var(--white);
	}
</style>
