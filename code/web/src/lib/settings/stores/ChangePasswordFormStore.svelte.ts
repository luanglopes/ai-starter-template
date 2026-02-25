import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import * as v from 'valibot';

function createSchema() {
	const t = getI18nStore().t.bind(getI18nStore());
	return v.object({
		currentPassword: v.pipe(v.string(), v.minLength(1, t('validation.currentPasswordRequired'))),
		newPassword: v.pipe(v.string(), v.minLength(6, t('validation.newPasswordMin6'))),
		confirmNewPassword: v.pipe(
			v.string(),
			v.minLength(1, t('validation.confirmNewPasswordRequired'))
		)
	});
}

type ChangePasswordSchema = ReturnType<typeof createSchema>;

export type ChangePasswordFormOutput = FormTypes<ChangePasswordSchema>['output'];
type ChangePasswordFormErrors = FormTypes<ChangePasswordSchema>['errors'];

export class ChangePasswordFormStore extends FormControllerBase<ChangePasswordSchema> {
	constructor() {
		super(createSchema, {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		});
	}

	override getValidatedValue() {
		const result = super.getValidatedValue();
		if (result.isErr()) return result;
		if (result.value.newPassword !== result.value.confirmNewPassword) {
			this.errors = {
				...this.errors,
				confirmNewPassword: {
					message: getI18nStore().t('validation.passwordsDoNotMatch')
				} as ChangePasswordFormErrors['confirmNewPassword']
			};
			return result;
		}
		return result;
	}
}
