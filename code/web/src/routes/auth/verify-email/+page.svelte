<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/auth/components/AuthLayout.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import Turnstile from '$lib/common/components/Turnstile.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';

	const RESEND_COOLDOWN_SECONDS = 180;

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();

	let otp = $state('');
	let loading = $state(false);
	let resending = $state(false);
	let errorMessage = $state<string>();
	let successMessage = $state<string>();
	let showCaptcha = $state(false);
	let turnstileRef = $state<Turnstile>();
	let countdown = $state(RESEND_COOLDOWN_SECONDS);
	let timerInterval: ReturnType<typeof setInterval> | undefined;

	const email = $derived(authStore.pendingVerificationEmail);
	const canResend = $derived(countdown <= 0 && !resending);

	function startTimer() {
		countdown = RESEND_COOLDOWN_SECONDS;
		showCaptcha = false;
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			countdown -= 1;
			if (countdown <= 0) {
				clearInterval(timerInterval);
				timerInterval = undefined;
			}
		}, 1000);
	}

	function formatCountdown(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	function handleResendClick() {
		if (!canResend) return;
		showCaptcha = true;
	}

	async function onCaptchaToken(token: string) {
		if (!email) return;
		resending = true;
		errorMessage = undefined;
		showCaptcha = false;
		turnstileRef?.reset();
		const result = await authStore.sendVerificationOTP(email, token);
		resending = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			successMessage = i18nStore.t('auth.verifyEmail.success');
			setTimeout(() => (successMessage = undefined), 4000);
			startTimer();
		}
	}

	async function verifyOTP() {
		if (!email || otp.length < 6) return;
		loading = true;
		errorMessage = undefined;
		const result = await authStore.verifyEmailWithOTP(email, otp);
		loading = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			await authStore.refreshSession();
			await goto(resolve(routes.app));
		}
	}

	function handleOTPInput(e: Event) {
		const target = e.target as HTMLInputElement;
		otp = target.value.replace(/\D/g, '').slice(0, 6);
		target.value = otp;
	}

	$effect(() => {
		if (email) startTimer();
		return () => {
			if (timerInterval) clearInterval(timerInterval);
		};
	});
</script>

<AuthLayout
	title={i18nStore.t('auth.verifyEmail.title')}
	subtitle={email
		? i18nStore.t('auth.verifyEmail.subtitleWithEmail', { email })
		: i18nStore.t('auth.verifyEmail.subtitleNoEmail')}
>
	{#if !email}
		<div class="no-email">
			<p class="no-email-text">{i18nStore.t('auth.verifyEmail.noPending')}</p>
			<a href={resolve(routes.auth.login)} class="back-link">
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
				{i18nStore.t('auth.verifyEmail.backToSignIn')}
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

		<div class="otp-section">
			<div class="input-group">
				<label for="otp" class="label">{i18nStore.t('auth.verifyEmail.otpLabel')}</label>
				<input
					id="otp"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					placeholder={i18nStore.t('auth.verifyEmail.otpPlaceholder')}
					maxlength="6"
					class="input input--otp"
					value={otp}
					oninput={handleOTPInput}
				/>
			</div>

			<button
				type="button"
				class="btn btn-primary"
				disabled={loading || otp.length < 6}
				onclick={verifyOTP}
			>
				{#if loading}
					<span class="spinner"></span>
					{i18nStore.t('auth.verifyEmail.verifying')}
				{:else}
					{i18nStore.t('auth.verifyEmail.submit')}
				{/if}
			</button>
		</div>

		<div class="resend-section">
			<p class="resend-text">{i18nStore.t('auth.verifyEmail.resendPrompt')}</p>
			<button type="button" class="resend-btn" disabled={!canResend} onclick={handleResendClick}>
				{#if resending}
					{i18nStore.t('auth.verifyEmail.resending')}
				{:else if countdown > 0}
					{i18nStore.t('auth.verifyEmail.resendIn', { time: formatCountdown(countdown) })}
				{:else}
					{i18nStore.t('auth.verifyEmail.resendCode')}
				{/if}
			</button>
		</div>

		{#if showCaptcha}
			<Turnstile
				bind:this={turnstileRef}
				siteKey={PUBLIC_TURNSTILE_SITE_KEY}
				onToken={onCaptchaToken}
				onExpired={() => undefined}
			/>
		{/if}

		<p class="footer-text">
			<a href={resolve(routes.app)} class="skip-link">{i18nStore.t('auth.verifyEmail.skip')}</a>
		</p>
	{/if}
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

	.input--otp {
		font-family: var(--mono);
		font-size: var(--text-3xl);
		font-weight: var(--weight-bold);
		letter-spacing: var(--space-2);
		text-align: center;
		padding: var(--space-4);
	}

	/* OTP section */
	.otp-section {
		margin-bottom: var(--space-6);
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

	/* Resend */
	.resend-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1_5);
		margin-bottom: var(--space-4);
	}

	.resend-text {
		font-size: var(--text-sm);
		color: var(--text-mid);
	}

	.resend-btn {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--primary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color var(--transition-fast);
	}

	.resend-btn:hover:not(:disabled) {
		color: var(--primary-deep);
	}

	.resend-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

	/* Footer & back link */
	.footer-text {
		text-align: center;
		margin-top: var(--space-2);
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

	.skip-link {
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--text-light);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.skip-link:hover {
		color: var(--text-mid);
	}
</style>
