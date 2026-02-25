import { i18n } from './config';
import type { AppLocale } from './types';

type LocaleModule = {
	default: Record<string, unknown>;
};

const loaders: Record<AppLocale, () => Promise<LocaleModule>> = {
	en: () => import('./locales/en'),
	'pt-BR': () => import('./locales/pt-BR')
};

const loadedLocales = new Set<AppLocale>();

export async function ensureLocaleLoaded(locale: AppLocale): Promise<void> {
	if (loadedLocales.has(locale)) return;

	const module = await loaders[locale]();
	i18n.store({ [locale]: module.default });
	loadedLocales.add(locale);
}
