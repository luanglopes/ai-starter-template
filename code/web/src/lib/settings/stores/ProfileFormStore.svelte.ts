import { FormControllerBase, type FormTypes } from '$lib/common/actions/formController.svelte';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import * as v from 'valibot';

function createProfileFormSchema() {
	return v.object({
		name: v.pipe(v.string(), v.minLength(1, getI18nStore().t('validation.nameRequired')))
	});
}

type ProfileFormSchema = ReturnType<typeof createProfileFormSchema>;

export type ProfileFormOutput = FormTypes<ProfileFormSchema>['output'];

export class ProfileFormStore extends FormControllerBase<ProfileFormSchema> {
	constructor(name: string) {
		super(createProfileFormSchema, {
			name
		});
	}
}
