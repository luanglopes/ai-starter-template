import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import * as v from 'valibot';

function createLoginFormSchema() {
	const t = getI18nStore().t.bind(getI18nStore());
	return v.object({
		email: v.pipe(v.string(), v.email(t('validation.emailInvalid'))),
		password: v.pipe(v.string(), v.minLength(8, t('validation.passwordMin8'))),
		rememberMe: v.optional(v.boolean(), false)
	});
}

type LoginFormSchema = ReturnType<typeof createLoginFormSchema>;

export type LoginFormOutput = FormTypes<LoginFormSchema>['output'];

export class LoginFormStore extends FormControllerBase<LoginFormSchema> {
	constructor() {
		super(createLoginFormSchema, {
			email: '',
			password: '',
			rememberMe: false
		});
	}
}
