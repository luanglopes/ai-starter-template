<script lang="ts">
	import { resolve } from '$app/paths';
	import AuthLayout from '$lib/auth/components/AuthLayout.svelte';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { LoginFormStore } from '$lib/auth/stores/LoginFormStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import { routes } from '$lib/common/routes';

	const authStore = getAuthStore();
	const i18nStore = getI18nStore();
	const formStore = new LoginFormStore();

	async function handleLogin(data: Parameters<typeof authStore.login>[0]) {
		await authStore.login(data);
	}
</script>

<AuthLayout title={i18nStore.t('auth.login.title')} subtitle={i18nStore.t('auth.login.subtitle')}>
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
			<span>{authStore.errorMessage}</span>
		</div>
	{/if}

	<form use:formController={{ formStore, onSubmit: handleLogin }}>
		<div class="input-group">
			<label for="email" class="label">{i18nStore.t('auth.login.emailLabel')}</label>
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

		<div class="input-group">
			<div class="label-row">
				<label for="password" class="label">{i18nStore.t('auth.login.passwordLabel')}</label>
				<a href={resolve(routes.auth.forgotPassword)} class="forgot-link"
					>{i18nStore.t('auth.login.forgotPassword')}</a
				>
			</div>
			<input
				id="password"
				name="password"
				type="password"
				placeholder={i18nStore.t('auth.login.passwordPlaceholder')}
				autocomplete="current-password"
				class="input"
				class:input--error={formStore.errors.password}
			/>
			{#if formStore.errors.password}
				<p class="hint hint--error">{formStore.errors.password.message}</p>
			{/if}
		</div>

		<div class="checkbox-group">
			<label class="checkbox-label">
				<input name="rememberMe" type="checkbox" class="checkbox" />
				<span class="checkbox-mark"></span>
				<span class="checkbox-text">{i18nStore.t('auth.login.rememberMe')}</span>
			</label>
		</div>

		<button type="submit" class="btn btn-primary" disabled={authStore.loaders.login}>
			{#if authStore.loaders.login}
				<span class="spinner"></span>
				{i18nStore.t('auth.login.submitting')}
			{:else}
				{i18nStore.t('auth.login.submit')}
			{/if}
		</button>
	</form>

	<p class="footer-text">
		{i18nStore.t('auth.login.footerPrefix')}
		<a href={resolve(routes.auth.signup)}>{i18nStore.t('auth.login.footerLink')}</a>
	</p>
</AuthLayout>

<style>
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
	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}
	.label-row .label {
		margin-bottom: 0;
	}
	.forgot-link {
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--primary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}
	.forgot-link:hover {
		color: var(--primary-deep);
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
		align-items: center;
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
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
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
</style>
