export const DEFAULT_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is AppLocale {
	return SUPPORTED_LOCALES.includes(locale as AppLocale);
}
