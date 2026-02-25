// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface TurnstileInstance {
		render(
			container: HTMLElement,
			options: {
				sitekey: string;
				theme?: 'dark' | 'light' | 'auto';
				size?: 'normal' | 'compact' | 'flexible';
				callback?: (token: string) => void;
				'error-callback'?: (errorCode: string) => void;
				'expired-callback'?: () => void;
			}
		): string;
		reset(widgetId: string): void;
		remove(widgetId: string): void;
	}

	interface Window {
		turnstile?: TurnstileInstance;
	}
}

export {};
