<script lang="ts">
	type Props = {
		siteKey: string;
		onToken: (token: string) => void;
		onError?: (errorCode: string) => void;
		onExpired?: () => void;
		theme?: 'dark' | 'light' | 'auto';
		size?: 'normal' | 'compact' | 'flexible';
	};

	let { siteKey, onToken, onError, onExpired, theme = 'dark', size = 'normal' }: Props = $props();

	let containerEl: HTMLDivElement;
	let widgetId: string | undefined;

	function loadScript(): Promise<void> {
		if (window.turnstile) return Promise.resolve();
		return new Promise((resolve, reject) => {
			const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
			if (existing) {
				existing.addEventListener('load', () => resolve());
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Failed to load Turnstile script'));
			document.head.appendChild(script);
		});
	}

	export function reset() {
		if (widgetId !== undefined && window.turnstile) {
			window.turnstile.reset(widgetId);
		}
	}

	$effect(() => {
		let destroyed = false;
		let currentWidgetId: string | undefined;

		loadScript().then(() => {
			if (destroyed || !containerEl || !window.turnstile) return;
			currentWidgetId = window.turnstile.render(containerEl, {
				sitekey: siteKey,
				theme,
				size,
				callback: (token: string) => onToken(token),
				'error-callback': (errorCode: string) => onError?.(errorCode),
				'expired-callback': () => onExpired?.()
			});
			widgetId = currentWidgetId;
		});

		return () => {
			destroyed = true;
			if (currentWidgetId !== undefined && window.turnstile) {
				window.turnstile.remove(currentWidgetId);
			}
			widgetId = undefined;
		};
	});
</script>

<div bind:this={containerEl} class="turnstile-container"></div>

<style>
	.turnstile-container {
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}
</style>
