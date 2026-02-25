import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import { err, ok, type Result } from 'neverthrow';
import * as v from 'valibot';

function createResetPasswordFormSchema() {
	const t = getI18nStore().t.bind(getI18nStore());
	return v.object({
		newPassword: v.pipe(v.string(), v.minLength(8, t('validation.passwordMin8'))),
		confirmNewPassword: v.pipe(v.string(), v.minLength(8, t('validation.passwordMin8')))
	});
}

type ResetPasswordFormSchema = ReturnType<typeof createResetPasswordFormSchema>;

export type ResetPasswordFormOutput = FormTypes<ResetPasswordFormSchema>['output'];
type ResetPasswordFormErrors = FormTypes<ResetPasswordFormSchema>['errors'];

export class ResetPasswordFormStore extends FormControllerBase<ResetPasswordFormSchema> {
	constructor() {
		super(createResetPasswordFormSchema, {
			newPassword: '',
			confirmNewPassword: ''
		});
	}

	override getValidatedValue(): Result<v.InferOutput<ResetPasswordFormSchema>, Error> {
		const result = super.getValidatedValue();
		if (result.isErr()) return result;

		const data = result.value;
		if (data.newPassword !== data.confirmNewPassword) {
			this.errors.confirmNewPassword = {
				message: getI18nStore().t('validation.passwordsDoNotMatch')
			} as ResetPasswordFormErrors['confirmNewPassword'];
			return err(new Error('Validation error'));
		}

		return ok(data);
	}
}
