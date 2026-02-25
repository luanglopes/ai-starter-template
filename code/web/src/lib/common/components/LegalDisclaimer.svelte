<script lang="ts">
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';

	const i18nStore = getI18nStore();
</script>

<p class="disclaimer">{i18nStore.t('common.legalDisclaimer')}</p>

<style>
	.disclaimer {
		font-size: var(--text-xs);
		color: var(--text-light);
		line-height: var(--leading-relaxed);
		opacity: 0.8;
	}
</style>
