<script lang="ts">
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import Turnstile from '$lib/common/components/Turnstile.svelte';

	type Props = {
		email: string;
		onVerified: () => void;
		onClose: () => void;
	};

	let { email, onVerified, onClose }: Props = $props();

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();

	const RESEND_COOLDOWN = 180; // 3 minutes in seconds

	let dialogEl = $state<HTMLDialogElement>();
	let step = $state<'captcha' | 'otp' | 'success'>('captcha');
	let captchaToken = $state<string>();
	let turnstileRef = $state<Turnstile>();
	let sending = $state(false);
	let verifying = $state(false);
	let otp = $state('');
	let errorMessage = $state<string>();
	let resendCountdown = $state(0);
	let showResendCaptcha = $state(false);

	$effect(() => {
		if (dialogEl && !dialogEl.open) dialogEl.showModal();
	});

	// Countdown timer effect
	$effect(() => {
		if (resendCountdown <= 0) return;
		const timer = setInterval(() => {
			resendCountdown--;
			if (resendCountdown <= 0) clearInterval(timer);
		}, 1000);
		return () => clearInterval(timer);
	});

	// Auto-resend once captcha resolves during resend flow
	$effect(() => {
		if (showResendCaptcha && captchaToken) {
			doResend();
		}
	});

	function startResendTimer() {
		resendCountdown = RESEND_COOLDOWN;
	}

	function formatCountdown(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	async function sendCode() {
		if (!captchaToken) return;
		sending = true;
		errorMessage = undefined;
		const token = captchaToken;
		captchaToken = undefined;
		turnstileRef?.reset();
		const result = await authStore.sendVerificationOTP(email, token);
		sending = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			step = 'otp';
			startResendTimer();
		}
	}

	async function verifyCode() {
		if (otp.length < 6) return;
		verifying = true;
		errorMessage = undefined;
		const result = await authStore.verifyEmailWithOTP(email, otp);
		verifying = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			step = 'success';
			setTimeout(() => {
				onVerified();
			}, 1200);
		}
	}

	function handleResendClick() {
		showResendCaptcha = true;
	}

	async function doResend() {
		if (!captchaToken) return;
		sending = true;
		errorMessage = undefined;
		showResendCaptcha = false;
		const token = captchaToken;
		captchaToken = undefined;
		turnstileRef?.reset();
		const result = await authStore.sendVerificationOTP(email, token);
		sending = false;
		if (result.error) {
			errorMessage = result.error;
		} else {
			startResendTimer();
		}
	}

	function handleOtpInput(e: Event) {
		const target = e.target as HTMLInputElement;
		otp = target.value.replace(/\D/g, '').slice(0, 6);
		target.value = otp;
	}

	const isBusy = $derived(sending || verifying);
	const canResend = $derived(resendCountdown <= 0 && !sending);
</script>

<dialog
	bind:this={dialogEl}
	aria-label={i18nStore.t('settings.emailVerificationModal.title')}
	oncancel={(e) => {
		e.preventDefault();
		if (!isBusy) onClose();
	}}
>
	<div class="modal">
		{#if step === 'success'}
			<div class="modal-icon modal-icon--success">
				<svg
					width="28"
					height="28"
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
			</div>
			<h2 class="modal-title">{i18nStore.t('settings.emailVerificationModal.successTitle')}</h2>
			<p class="modal-desc">{i18nStore.t('settings.emailVerificationModal.successDescription')}</p>
		{:else}
			<div class="modal-icon">
				<svg
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="2" y="4" width="20" height="16" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			</div>

			<h2 class="modal-title">{i18nStore.t('settings.emailVerificationModal.title')}</h2>
			<p class="modal-desc">
				{#if step === 'captcha'}
					{i18nStore.t('settings.emailVerificationModal.captchaDescription', { email })}
				{:else}
					{i18nStore.t('settings.emailVerificationModal.otpDescription', { email })}
				{/if}
			</p>

			{#if errorMessage}
				<div class="alert">
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
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			{#if step === 'captcha'}
				<div class="captcha-section" inert={sending}>
					<Turnstile
						bind:this={turnstileRef}
						siteKey={PUBLIC_TURNSTILE_SITE_KEY}
						onToken={(token) => (captchaToken = token)}
						onExpired={() => (captchaToken = undefined)}
					/>
				</div>

				<div class="modal-actions">
					<button class="btn btn-primary" onclick={sendCode} disabled={!captchaToken || sending}>
						{#if sending}
							<span class="spinner"></span>
							{i18nStore.t('settings.emailVerificationModal.sending')}
						{:else}
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
								<line x1="22" y1="2" x2="11" y2="13" />
								<polygon points="22 2 15 22 11 13 2 9 22 2" />
							</svg>
							{i18nStore.t('settings.emailVerificationModal.sendCode')}
						{/if}
					</button>
					<button class="btn btn-ghost" onclick={onClose} disabled={sending}
						>{i18nStore.t('common.actions.cancel')}</button
					>
				</div>
			{:else if step === 'otp'}
				<div class="otp-section" inert={verifying}>
					<label for="verify-otp" class="label">{i18nStore.t('settings.emailVerificationModal.otpLabel')}</label>
					<input
						id="verify-otp"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						placeholder={i18nStore.t('settings.emailVerificationModal.otpPlaceholder')}
						maxlength="6"
						class="input input--otp"
						value={otp}
						oninput={handleOtpInput}
					/>
				</div>

				<div class="modal-actions">
					<button
						class="btn btn-primary"
						onclick={verifyCode}
						disabled={otp.length < 6 || verifying}
					>
						{#if verifying}
							<span class="spinner"></span>
							{i18nStore.t('settings.emailVerificationModal.verifying')}
						{:else}
							{i18nStore.t('settings.emailVerificationModal.verifyEmail')}
						{/if}
					</button>
					<button
						class="btn btn-ghost"
						onclick={handleResendClick}
						disabled={!canResend || showResendCaptcha}
					>
						{#if sending}
							{i18nStore.t('settings.emailVerificationModal.resending')}
						{:else if resendCountdown > 0}
							{i18nStore.t('settings.emailVerificationModal.resendAvailableIn', {
								time: formatCountdown(resendCountdown)
							})}
						{:else}
							{i18nStore.t('settings.emailVerificationModal.resendCode')}
						{/if}
					</button>
				</div>

				{#if showResendCaptcha}
					<div class="captcha-section captcha-section--below">
						<Turnstile
							bind:this={turnstileRef}
							siteKey={PUBLIC_TURNSTILE_SITE_KEY}
							onToken={(token) => (captchaToken = token)}
							onExpired={() => (captchaToken = undefined)}
						/>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</dialog>

<style>
	dialog {
		border: none;
		background: transparent;
		padding: 0;
		margin: auto;
		width: var(--width-form);
		max-width: calc(100% - var(--space-8));
		overflow: visible;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fadeIn 0.2s ease both;
	}

	.modal {
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		padding: var(--space-9) var(--space-8);
		box-shadow: var(--shadow-xl);
		animation: popIn 0.4s var(--ease-spring) both;
	}

	/* ===== Icon ===== */
	.modal-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: 16px;
		background: var(--primary-soft);
		border: 1px solid rgba(232, 168, 72, 0.15);
		color: var(--primary);
		margin-bottom: var(--space-4);
	}

	.modal-icon--success {
		background: var(--secondary-soft);
		border-color: rgba(56, 190, 201, 0.15);
		color: var(--secondary);
		animation: popIn 0.4s var(--ease-spring) both;
	}

	/* ===== Typography ===== */
	.modal-title {
		font-family: var(--display);
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--white);
		margin-bottom: var(--space-2);
	}

	.modal-desc {
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	/* ===== Alert ===== */
	.alert {
		display: flex;
		align-items: center;
		gap: var(--space-2_5);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		margin-bottom: var(--space-5);
		background: var(--danger-soft);
		border: 1px solid rgba(224, 82, 82, 0.15);
		color: var(--danger);
		text-align: left;
	}

	.alert svg {
		flex-shrink: 0;
	}

	/* ===== Captcha ===== */
	.captcha-section {
		margin-bottom: var(--space-6);
	}

	.captcha-section--below {
		margin-bottom: 0;
		margin-top: var(--space-5);
	}

	/* ===== OTP ===== */
	.otp-section {
		text-align: left;
		margin-bottom: var(--space-4);
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

	/* ===== Actions ===== */
	.modal-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-family: var(--body);
		font-size: var(--text-sm);
		font-weight: var(--weight-bold);
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		padding: var(--space-3) var(--space-7);
		transition:
			background var(--transition-spring),
			transform var(--transition-spring),
			box-shadow var(--transition-spring),
			color var(--transition-spring);
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

	.btn-ghost {
		background: transparent;
		color: var(--text-mid);
	}

	.btn-ghost:hover:not(:disabled) {
		color: var(--white);
	}

	/* ===== Spinner ===== */
	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(28, 18, 0, 0.3);
		border-top-color: var(--primary-on);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
