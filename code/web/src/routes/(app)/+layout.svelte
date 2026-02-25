<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import UserMenu from '$lib/auth/components/UserMenu.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';

	const { children } = $props();
	const authStore = getAuthStore();
	const i18nStore = getI18nStore();
	authStore.monitorRouteChanges('AppLayout');

	const navItems = $derived.by(() => {
		i18nStore.version;
		return [
			{ label: i18nStore.t('navigation.todos'), href: routes.todos },
			{ label: i18nStore.t('navigation.settings'), href: routes.settings }
		] as const;
	});

	function isActive(href: string): boolean {
		return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	}
</script>

<div class="app-shell">
	<aside class="sidebar">
		<div class="brand">{i18nStore.t('common.appName')}</div>
		<nav class="nav">
			{#each navItems as item (item.href)}
				<a href={resolve(item.href)} class="nav-item" class:nav-item--active={isActive(item.href)}>
					{item.label}
				</a>
			{/each}
		</nav>
		<UserMenu />
	</aside>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.app-shell {
		display: grid;
		grid-template-columns: 240px 1fr;
		min-height: 100dvh;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		background: var(--surface);
		border-right: 1px solid var(--border);
	}

	.brand {
		padding: var(--space-5);
		font-family: var(--display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
	}

	.nav {
		display: grid;
		gap: var(--space-1);
		padding: 0 var(--space-3);
	}

	.nav-item {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-sm);
		color: var(--text-mid);
		text-decoration: none;
	}

	.nav-item--active {
		background: var(--surface-raised);
		color: var(--white);
	}

	.content {
		min-width: 0;
	}

	@media (max-width: 900px) {
		.app-shell {
			grid-template-columns: 1fr;
		}

		.sidebar {
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		.nav {
			display: flex;
			padding-bottom: var(--space-3);
		}
	}
</style>
