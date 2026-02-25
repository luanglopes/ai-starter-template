<script lang="ts">
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		title: string;
		subtitle?: string;
	};

	let { children, title, subtitle }: Props = $props();
	const i18nStore = getI18nStore();
</script>

<div class="auth-shell">
	<aside class="brand-panel">
		<h1>{i18nStore.t('common.appName')}</h1>
		<p>{i18nStore.t('common.authMarketing')}</p>
	</aside>

	<main class="form-panel">
		<div class="form-card">
			<header class="form-header">
				<h2 class="form-title">{title}</h2>
				{#if subtitle}
					<p class="form-subtitle">{subtitle}</p>
				{/if}
			</header>
			{@render children()}
		</div>
	</main>
</div>

<style>
	.auth-shell {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 100dvh;
	}

	.brand-panel {
		display: grid;
		align-content: center;
		justify-items: center;
		gap: var(--space-3);
		background: linear-gradient(160deg, var(--surface), var(--bg));
		border-right: 1px solid var(--border);
		padding: var(--space-8);
	}

	.brand-panel h1 {
		margin: 0;
		font-family: var(--display);
		font-size: var(--text-4xl);
	}

	.brand-panel p {
		margin: 0;
		color: var(--text-mid);
		max-width: 420px;
		text-align: center;
	}

	.form-panel {
		display: grid;
		place-items: center;
		padding: var(--space-6);
	}

	.form-card {
		width: min(460px, 100%);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		padding: var(--space-6);
	}

	.form-header {
		margin-bottom: var(--space-5);
	}

	.form-title {
		margin: 0;
	}

	.form-subtitle {
		margin: var(--space-2) 0 0;
		color: var(--text-mid);
	}

	@media (max-width: 900px) {
		.auth-shell {
			grid-template-columns: 1fr;
		}

		.brand-panel {
			display: none;
		}
	}
</style>
