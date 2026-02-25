import { i18n } from './config';
import { ensureLocaleLoaded } from './loader';
import {
	DEFAULT_LOCALE,
	isSupportedLocale,
	SUPPORTED_LOCALES,
	type AppLocale
} from './types';

const LOCALE_STORAGE_KEY = 'template.locale';

function resolvePreferredLocale(): AppLocale {
	if (typeof window === 'undefined') return DEFAULT_LOCALE;

	const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
	if (stored && isSupportedLocale(stored)) {
		return stored;
	}

	for (const candidate of navigator.languages) {
		if (isSupportedLocale(candidate)) return candidate;
		const prefixed = SUPPORTED_LOCALES.find((locale) =>
			candidate.toLowerCase().startsWith(locale.toLowerCase().split('-')[0])
		);
		if (prefixed) return prefixed;
	}

	return DEFAULT_LOCALE;
}

function updateHtmlLang(locale: AppLocale) {
	if (typeof document === 'undefined') return;
	document.documentElement.lang = locale;
}

export class I18nStore {
	locale = $state<AppLocale>(DEFAULT_LOCALE);
	ready = $state(false);
	loading = $state(false);
	version = $state(0);

	#initPromise: Promise<void> | null = null;

	async init(): Promise<void> {
		if (this.ready) return;
		if (this.#initPromise) return this.#initPromise;

		this.#initPromise = (async () => {
			const preferredLocale = resolvePreferredLocale();
			await this.setLocale(preferredLocale, false);
			this.ready = true;
		})();

		return this.#initPromise;
	}

	async setLocale(locale: AppLocale, persist = true): Promise<void> {
		this.loading = true;
		await ensureLocaleLoaded(locale);
		i18n.locale = locale;
		this.locale = locale;
		this.version += 1;

		if (persist && typeof localStorage !== 'undefined') {
			localStorage.setItem(LOCALE_STORAGE_KEY, locale);
		}

		updateHtmlLang(locale);
		this.loading = false;
	}

	t(key: string, options: Record<string, unknown> = {}): string {
		this.version;
		const result = i18n.t(key, options as never);
		if (typeof result === 'string' && result.startsWith('translation missing:')) {
			return `[missing "${key}"]`;
		}
		return String(result);
	}

}

let i18nStore: I18nStore;

export function getI18nStore(): I18nStore {
	if (!i18nStore) {
		i18nStore = new I18nStore();
	}
	return i18nStore;
}
