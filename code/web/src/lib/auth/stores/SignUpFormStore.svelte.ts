import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import { err, ok, type Result } from 'neverthrow';
import * as v from 'valibot';

function createSignUpFormSchema() {
	const t = getI18nStore().t.bind(getI18nStore());
	return v.object({
		email: v.pipe(v.string(), v.email(t('validation.emailInvalid'))),
		password: v.pipe(v.string(), v.minLength(8, t('validation.passwordMin8'))),
		confirmPassword: v.pipe(v.string(), v.minLength(8, t('validation.passwordMin8'))),
		name: v.pipe(v.string(), v.minLength(3, t('validation.nameMin3'))),
		termsAccepted: v.literal(true, t('validation.termsRequired'))
	});
}

type SignUpFormSchema = ReturnType<typeof createSignUpFormSchema>;

export type SignUpFormOutput = FormTypes<SignUpFormSchema>['output'];
type SignUpFormErrors = FormTypes<SignUpFormSchema>['errors'];

export class SignUpFormStore extends FormControllerBase<SignUpFormSchema> {
	constructor() {
		super(createSignUpFormSchema, {
			email: '',
			password: '',
			confirmPassword: '',
			name: '',
			termsAccepted: false as never
		});
	}

	override getValidatedValue(): Result<v.InferOutput<SignUpFormSchema>, Error> {
		const result = super.getValidatedValue();
		if (result.isErr()) return result;

		const data = result.value;
		if (data.password !== data.confirmPassword) {
			this.errors.confirmPassword = {
				message: getI18nStore().t('validation.passwordsDoNotMatch')
			} as SignUpFormErrors['confirmPassword'];
			return err(new Error('Validation error'));
		}

		return ok(data);
	}
}
