import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import * as v from 'valibot';

function createForgotPasswordFormSchema() {
	return v.object({
		email: v.pipe(v.string(), v.email(getI18nStore().t('validation.emailInvalid')))
	});
}

type ForgotPasswordFormSchema = ReturnType<typeof createForgotPasswordFormSchema>;

export type ForgotPasswordFormOutput = FormTypes<ForgotPasswordFormSchema>['output'];

export class ForgotPasswordFormStore extends FormControllerBase<ForgotPasswordFormSchema> {
	constructor() {
		super(createForgotPasswordFormSchema, {
			email: ''
		});
	}
}
