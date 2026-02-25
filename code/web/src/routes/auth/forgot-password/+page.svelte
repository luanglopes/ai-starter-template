<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/auth/components/AuthLayout.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { ForgotPasswordFormStore } from '$lib/auth/stores/ForgotPasswordFormStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import Turnstile from '$lib/common/components/Turnstile.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';
	import type { ForgotPasswordFormOutput } from '$lib/auth/stores/ForgotPasswordFormStore.svelte';

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();
	const formStore = new ForgotPasswordFormStore();

	let loading = $state(false);
	let errorMessage = $state<string>();
	let captchaToken = $state<string>();
	let turnstileRef = $state<Turnstile>();

	async function handleSubmit(data: ForgotPasswordFormOutput) {
		loading = true;
		errorMessage = undefined;
		const result = await authStore.sendPasswordResetOTP(data.email, captchaToken);
		loading = false;
		if (result.error) {
			errorMessage = result.error;
			captchaToken = undefined;
			turnstileRef?.reset();
		} else {
			authStore.pendingPasswordResetEmail = data.email;
			await goto(resolve(routes.auth.resetPassword));
		}
	}
</script>

<AuthLayout
	title={i18nStore.t('auth.forgotPassword.title')}
	subtitle={i18nStore.t('auth.forgotPassword.subtitle')}
>
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

	<form use:formController={{ formStore, onSubmit: handleSubmit }}>
		<div class="input-group">
			<label for="email" class="label">{i18nStore.t('auth.forgotPassword.emailLabel')}</label>
			<input
				id="email"
				name="email"
				type="email"
				placeholder={i18nStore.t('auth.forgotPassword.emailPlaceholder')}
				autocomplete="email"
				class="input"
				class:input--error={formStore.errors.email}
			/>
			{#if formStore.errors.email}
				<p class="hint hint--error">{formStore.errors.email.message}</p>
			{/if}
		</div>

		<Turnstile
			bind:this={turnstileRef}
			siteKey={PUBLIC_TURNSTILE_SITE_KEY}
			onToken={(token) => (captchaToken = token)}
			onExpired={() => (captchaToken = undefined)}
		/>

		<button type="submit" class="btn btn-primary" disabled={loading || !captchaToken}>
			{#if loading}
				<span class="spinner"></span>
				{i18nStore.t('auth.forgotPassword.submitting')}
			{:else}
				{i18nStore.t('auth.forgotPassword.submit')}
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
			{i18nStore.t('auth.forgotPassword.backToSignIn')}
		</a>
	</p>
</AuthLayout>

<style>
	/* Input */
	.input-group {
		margin-bottom: var(--space-6);
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
		margin-top: var(--space-1_5);
	}

	.hint--error {
		color: var(--danger);
	}

	/* Alert */
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
