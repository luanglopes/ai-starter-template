<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/auth/components/AuthLayout.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { SignUpFormStore } from '$lib/auth/stores/SignUpFormStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import Turnstile from '$lib/common/components/Turnstile.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();
	const formStore = new SignUpFormStore();

	let captchaToken = $state<string>();
	let turnstileRef = $state<Turnstile>();

	async function handleSignUp(data: Parameters<typeof authStore.signUp>[0]) {
		await authStore.signUp(data, captchaToken);
		if (authStore.errorMessage) {
			captchaToken = undefined;
			turnstileRef?.reset();
		}
	}
</script>

<AuthLayout title={i18nStore.t('auth.signup.title')} subtitle={i18nStore.t('auth.signup.subtitle')}>
	{#if authStore.errorMessage}
		<div class="alert alert--danger">
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="12" />
				<line x1="12" y1="16" x2="12.01" y2="16" />
			</svg>
			<span>
				{#if authStore.signupErrorType === 'duplicate_email'}
					{i18nStore.t('auth.signup.duplicateEmailPrefix')}
					<a href={resolve(routes.auth.login)}>{i18nStore.t('auth.signup.duplicateEmailLink')}</a
					>
				{:else}
					{authStore.errorMessage}
				{/if}
			</span>
		</div>
	{/if}

	<form use:formController={{ formStore, onSubmit: handleSignUp }}>
		<div class="input-group">
			<label for="name" class="label">{i18nStore.t('auth.signup.nameLabel')}</label>
			<input
				id="name"
				name="name"
				type="text"
				placeholder={i18nStore.t('auth.signup.namePlaceholder')}
				autocomplete="name"
				class="input"
				class:input--error={formStore.errors.name}
			/>
			{#if formStore.errors.name}
				<p class="hint hint--error">{formStore.errors.name.message}</p>
			{/if}
		</div>

		<div class="input-group">
			<label for="email" class="label">{i18nStore.t('auth.signup.emailLabel')}</label>
			<input
				id="email"
				name="email"
				type="email"
				placeholder={i18nStore.t('auth.signup.emailPlaceholder')}
				autocomplete="email"
				class="input"
				class:input--error={formStore.errors.email}
			/>
			{#if formStore.errors.email}
				<p class="hint hint--error">{formStore.errors.email.message}</p>
			{/if}
		</div>

		<div class="input-row">
			<div class="input-group">
				<label for="password" class="label">{i18nStore.t('auth.signup.passwordLabel')}</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder={i18nStore.t('auth.signup.passwordPlaceholder')}
					autocomplete="new-password"
					class="input"
					class:input--error={formStore.errors.password}
				/>
				{#if formStore.errors.password}
					<p class="hint hint--error">{formStore.errors.password.message}</p>
				{/if}
			</div>

			<div class="input-group">
				<label for="confirmPassword" class="label">{i18nStore.t('auth.signup.confirmPasswordLabel')}</label>
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder={i18nStore.t('auth.signup.confirmPasswordPlaceholder')}
					autocomplete="new-password"
					class="input"
					class:input--error={formStore.errors.confirmPassword}
				/>
				{#if formStore.errors.confirmPassword}
					<p class="hint hint--error">{formStore.errors.confirmPassword.message}</p>
				{/if}
			</div>
		</div>

		<div class="checkbox-group">
			<label class="checkbox-label">
				<input name="termsAccepted" type="checkbox" class="checkbox" />
				<span class="checkbox-mark"></span>
				<span class="checkbox-text">
					{i18nStore.t('auth.signup.termsPrefix')}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/terms" target="_blank" class="terms-link">{i18nStore.t('auth.signup.termsOfService')}</a>
					{i18nStore.t('auth.signup.and')}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/privacy" target="_blank" class="terms-link">{i18nStore.t('auth.signup.privacyPolicy')}</a>
				</span>
			</label>
			{#if formStore.errors.termsAccepted}
				<p class="hint hint--error terms-error">{formStore.errors.termsAccepted.message}</p>
			{/if}
		</div>

		<Turnstile
			bind:this={turnstileRef}
			siteKey={PUBLIC_TURNSTILE_SITE_KEY}
			onToken={(token) => (captchaToken = token)}
			onExpired={() => (captchaToken = undefined)}
		/>

		<button
			type="submit"
			class="btn btn-primary"
			disabled={authStore.loaders.signup || !captchaToken}
		>
			{#if authStore.loaders.signup}
				<span class="spinner"></span>
				{i18nStore.t('auth.signup.submitting')}
			{:else}
				{i18nStore.t('auth.signup.submit')}
			{/if}
		</button>
	</form>

	<p class="footer-text">
		{i18nStore.t('auth.signup.footerPrefix')}
		<a href={resolve(routes.auth.login)}>{i18nStore.t('auth.signup.footerLink')}</a>
	</p>
</AuthLayout>

<style>
	.input-group {
		margin-bottom: var(--space-5);
	}
	.input-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
	}
	.input-row .input-group {
		margin-bottom: var(--space-5);
	}
	.label {
		display: block;
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		color: var(--text-mid);
		margin-bottom: var(--space-2);
	}
	.input {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		font-family: var(--body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--white);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		outline: none;
		transition:
			border-color var(--transition-base),
			box-shadow var(--transition-base);
	}
	.input::placeholder {
		color: var(--text-light);
	}
	.input:hover {
		border-color: var(--border-hover);
	}
	.input:focus {
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
	}
	.input--error {
		border-color: rgba(224, 82, 82, 0.4);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
	}
	.hint {
		font-size: var(--text-xs);
		color: var(--text-light);
		margin-top: var(--space-1_5);
	}
	.hint--error {
		color: var(--danger);
	}
	.checkbox-group {
		margin-bottom: var(--space-6);
	}
	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2_5);
		cursor: pointer;
		position: relative;
	}
	.checkbox {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	.checkbox-mark {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		border: 1px solid var(--border-hover);
		background: var(--bg);
		transition:
			background var(--transition-base),
			border-color var(--transition-base);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-top: 2px;
	}
	.checkbox-mark::after {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 3px;
		background: var(--primary);
		opacity: 0;
		transform: scale(0.5);
		transition:
			opacity var(--transition-base),
			transform 0.25s var(--ease-spring);
	}
	.checkbox:checked + .checkbox-mark {
		border-color: var(--primary);
	}
	.checkbox:checked + .checkbox-mark::after {
		opacity: 1;
		transform: scale(1);
	}
	.checkbox-text {
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		line-height: var(--leading-normal);
	}
	.terms-link {
		color: var(--primary);
		font-weight: var(--weight-semibold);
	}
	.terms-error {
		margin-left: var(--space-7);
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-3_5) var(--space-8);
		font-family: var(--body);
		font-size: var(--text-base);
		font-weight: var(--weight-bold);
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			background var(--transition-spring),
			transform var(--transition-spring),
			box-shadow var(--transition-spring);
	}
	.btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
	.btn-primary {
		background: var(--primary);
		color: var(--primary-on);
		box-shadow: var(--shadow-sm);
	}
	.btn-primary:hover:not(:disabled) {
		background: var(--primary-deep);
		transform: translateY(-2px) scale(1.02);
		box-shadow: var(--shadow-md);
	}
	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(28, 18, 0, 0.3);
		border-top-color: var(--primary-on);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.alert {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-3_5) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		margin-bottom: var(--space-6);
		line-height: var(--leading-normal);
	}
	.alert svg {
		flex-shrink: 0;
		margin-top: 1px;
	}
	.alert--danger {
		background: var(--danger-soft);
		border: 1px solid rgba(224, 82, 82, 0.2);
		color: var(--danger);
	}
	.footer-text {
		margin-top: var(--space-5);
		text-align: center;
		font-family: var(--body);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
	}
	.footer-text a {
		color: var(--primary);
		font-weight: var(--weight-semibold);
	}
	@media (max-width: 720px) {
		.input-row {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
