<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/auth/components/AuthLayout.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { ResetPasswordFormStore } from '$lib/auth/stores/ResetPasswordFormStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';
	import type { ResetPasswordFormOutput } from '$lib/auth/stores/ResetPasswordFormStore.svelte';

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();
	const formStore = new ResetPasswordFormStore();

	let otp = $state('');
	let loading = $state(false);
	let errorMessage = $state<string>();
	let successMessage = $state<string>();

	const email = $derived(authStore.pendingPasswordResetEmail);

	function handleOTPInput(e: Event) {
		const target = e.target as HTMLInputElement;
		otp = target.value.replace(/\D/g, '').slice(0, 6);
		target.value = otp;
	}

	async function handleSubmit(data: ResetPasswordFormOutput) {
		if (!email || otp.length < 6) {
			errorMessage = i18nStore.t('auth.resetPassword.otpRequired');
			return;
		}
		loading = true;
		errorMessage = undefined;
		const result = await authStore.resetPasswordWithOTP(email, otp, data.newPassword);
		loading = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			successMessage = i18nStore.t('auth.resetPassword.success');
			setTimeout(() => goto(resolve(routes.auth.login)), 2000);
		}
	}
</script>

<AuthLayout
	title={i18nStore.t('auth.resetPassword.title')}
	subtitle={email
		? i18nStore.t('auth.resetPassword.subtitleWithEmail', { email })
		: i18nStore.t('auth.resetPassword.subtitleNoEmail')}
>
	{#if !email}
		<div class="no-email">
			<p class="no-email-text">{i18nStore.t('auth.resetPassword.noPending')}</p>
			<a href={resolve(routes.auth.forgotPassword)} class="back-link">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				{i18nStore.t('auth.resetPassword.requestCode')}
			</a>
		</div>
	{:else}
		{#if errorMessage}
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
				<span>{errorMessage}</span>
			</div>
		{/if}

		{#if successMessage}
			<div class="alert alert--success">
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
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				<span>{successMessage}</span>
			</div>
		{/if}

		<form use:formController={{ formStore, onSubmit: handleSubmit }}>
			<div class="input-group">
				<label for="otp" class="label">{i18nStore.t('auth.resetPassword.otpLabel')}</label>
				<input
					id="otp"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					placeholder={i18nStore.t('auth.resetPassword.otpPlaceholder')}
					maxlength="6"
					class="input input--otp"
					value={otp}
					oninput={handleOTPInput}
				/>
			</div>

			<div class="input-group">
				<label for="newPassword" class="label">{i18nStore.t('auth.resetPassword.newPasswordLabel')}</label>
				<input
					id="newPassword"
					name="newPassword"
					type="password"
					placeholder={i18nStore.t('auth.resetPassword.newPasswordPlaceholder')}
					autocomplete="new-password"
					class="input"
					class:input--error={formStore.errors.newPassword}
				/>
				{#if formStore.errors.newPassword}
					<p class="hint hint--error">{formStore.errors.newPassword.message}</p>
				{/if}
			</div>

			<div class="input-group">
				<label for="confirmNewPassword" class="label"
					>{i18nStore.t('auth.resetPassword.confirmPasswordLabel')}</label
				>
				<input
					id="confirmNewPassword"
					name="confirmNewPassword"
					type="password"
					placeholder={i18nStore.t('auth.resetPassword.confirmPasswordPlaceholder')}
					autocomplete="new-password"
					class="input"
					class:input--error={formStore.errors.confirmNewPassword}
				/>
				{#if formStore.errors.confirmNewPassword}
					<p class="hint hint--error">{formStore.errors.confirmNewPassword.message}</p>
				{/if}
			</div>

			<button type="submit" class="btn btn-primary" disabled={loading}>
				{#if loading}
					<span class="spinner"></span>
					{i18nStore.t('auth.resetPassword.submitting')}
				{:else}
					{i18nStore.t('auth.resetPassword.submit')}
				{/if}
			</button>
		</form>

		<p class="footer-text">
			<a href={resolve(routes.auth.login)} class="back-link">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				{i18nStore.t('auth.resetPassword.backToSignIn')}
			</a>
		</p>
	{/if}
</AuthLayout>

<style>
	/* Input */
	.input-group {
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

	.input--otp {
		font-family: var(--mono);
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		letter-spacing: var(--space-2);
		text-align: center;
		padding: var(--space-4);
	}

	.hint {
		font-size: var(--text-xs);
		margin-top: var(--space-1_5);
	}

	.hint--error {
		color: var(--danger);
	}

	/* Alerts */
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
		border: 1px solid rgba(224, 82, 82, 0.15);
		color: var(--danger);
	}

	.alert--success {
		background: var(--success-soft);
		border: 1px solid rgba(56, 190, 201, 0.15);
		color: var(--success);
	}

	/* Button */
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

	.btn-primary:active:not(:disabled) {
		transform: translateY(0) scale(1);
	}

	/* Spinner */
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

	/* No email state */
	.no-email {
		text-align: center;
		padding: var(--space-6) 0;
	}

	.no-email-text {
		font-size: var(--text-sm);
		color: var(--text-mid);
		margin-bottom: var(--space-4);
	}

	/* Footer */
	.footer-text {
		text-align: center;
		margin-top: var(--space-6);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1_5);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.back-link:hover {
		color: var(--white);
	}
</style>
