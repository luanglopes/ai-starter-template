import { I18n } from 'i18n-js';
import { DEFAULT_LOCALE } from './types';

export const i18n = new I18n();

i18n.enableFallback = true;
i18n.defaultLocale = DEFAULT_LOCALE;
i18n.locale = DEFAULT_LOCALE;
