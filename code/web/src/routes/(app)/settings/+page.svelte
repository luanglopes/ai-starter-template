<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth/client';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { createCheckout } from '$lib/billing/services/createCheckout';
	import { createPortal } from '$lib/billing/services/createPortal';
	import { getBillingStore } from '$lib/billing/stores/BillingStore.svelte';
	import { formController } from '$lib/common/actions/formController.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import type { AppLocale } from '$lib/common/i18n/types';
	import { routes } from '$lib/common/routes';
	import { getToastStore } from '$lib/common/stores/ToastStore.svelte';
	import DeleteAccountModal from '$lib/settings/components/DeleteAccountModal.svelte';
	import EmailVerificationModal from '$lib/settings/components/EmailVerificationModal.svelte';
	import LegalDisclaimer from '$lib/common/components/LegalDisclaimer.svelte';
	import { deleteAccount } from '$lib/settings/services/deleteAccount';
	import { ChangePasswordFormStore } from '$lib/settings/stores/ChangePasswordFormStore.svelte';
	import { ProfileFormStore } from '$lib/settings/stores/ProfileFormStore.svelte';

	const authStore = getAuthStore();
	const toastStore = getToastStore();
	const billingStore = getBillingStore();
	const i18nStore = getI18nStore();

	const PLAN_ORDER: Array<'free' | 'starter' | 'pro'> = ['free', 'starter', 'pro'];
	const PLAN_FEATURE_INDEXES: Record<'free' | 'starter' | 'pro', number[]> = {
		free: [0, 1, 2],
		starter: [0, 1, 2, 3],
		pro: [0, 1, 2, 3, 4]
	};

	function isCurrentPlan(key: 'free' | 'starter' | 'pro'): boolean {
		return billingStore.plan === key;
	}

	function isUpgrade(key: 'free' | 'starter' | 'pro'): boolean {
		return PLAN_ORDER.indexOf(key) > PLAN_ORDER.indexOf(billingStore.plan);
	}

	let error = $state('');
	let loading = $state('');

	// Profile
	let profileForm = $state(new ProfileFormStore(authStore.state.user?.name ?? ''));
	let savingProfile = $state(false);
	let profileError = $state('');

	// Change Password
	let passwordForm = $state(new ChangePasswordFormStore());
	let changingPassword = $state(false);
	let passwordError = $state('');

	// Email Verification
	let showVerifyModal = $state(false);

	async function handleVerified() {
		showVerifyModal = false;
		await authStore.refreshSession();
		toastStore.success({ message: i18nStore.t('settings.profile.emailVerifiedSuccess') });
	}

	// Delete Account
	let showDeleteModal = $state(false);
	let deleting = $state(false);

	async function saveProfile(data: { name: string }) {
		savingProfile = true;
		profileError = '';
		const { error: updateError } = await authClient.updateUser({ name: data.name });
		if (updateError) {
			profileError = updateError.message ?? i18nStore.t('settings.profile.updateFailed');
			savingProfile = false;
			return;
		}
		await authStore.refreshSession();
		profileForm = new ProfileFormStore(data.name);
		savingProfile = false;
		toastStore.success({ message: i18nStore.t('settings.profile.updatedSuccess') });
	}

	async function changePassword(data: {
		currentPassword: string;
		newPassword: string;
		confirmNewPassword: string;
	}) {
		if (data.newPassword !== data.confirmNewPassword) {
			passwordError = i18nStore.t('validation.passwordsDoNotMatch');
			return;
		}
		changingPassword = true;
		passwordError = '';
		const { error: changeError } = await authClient.changePassword({
			currentPassword: data.currentPassword,
			newPassword: data.newPassword
		});
		if (changeError) {
			passwordError = changeError.message ?? i18nStore.t('settings.password.changeFailed');
			changingPassword = false;
			return;
		}
		passwordForm = new ChangePasswordFormStore();
		changingPassword = false;
		toastStore.success({ message: i18nStore.t('settings.password.changedSuccess') });
	}

	async function handleDeleteAccount() {
		deleting = true;
		const result = await deleteAccount();
		if (result.isErr()) {
			deleting = false;
			showDeleteModal = false;
			toastStore.error({ message: result.error.error || i18nStore.t('settings.danger.deleteFailed') });
			return;
		}
		await authClient.signOut();
		await goto(resolve(routes.auth.login));
	}

	async function handleLocaleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		await i18nStore.setLocale(target.value as AppLocale);
	}

	async function upgrade(plan: 'starter' | 'pro') {
		loading = plan;
		error = '';
		const result = await createCheckout(
			plan,
			`${location.origin}${routes.app}`,
			`${location.origin}${routes.settings}`
		);
		loading = '';
		if (result.isErr()) {
			error = result.error.error;
			return;
		}
		location.href = result.value.url;
	}

	async function portal() {
		const result = await createPortal();
		if (result.isErr()) {
			error = result.error.error;
			return;
		}
		location.href = result.value.url;
	}
</script>

<section class="settings">
	<h1>{i18nStore.t('settings.title')}</h1>

	<div class="locale-switcher">
		<label for="language" class="label">{i18nStore.t('common.language.label')}</label>
		<select id="language" class="input input--locale" value={i18nStore.locale} onchange={handleLocaleChange}>
			<option value="en">{i18nStore.t('common.language.en')}</option>
			<option value="pt-BR">{i18nStore.t('common.language.ptBR')}</option>
		</select>
	</div>

	<div class="account-grid">
		<!-- Profile -->
		<div class="settings-section">
			<h2 class="section-title">{i18nStore.t('settings.profile.title')}</h2>
			<p class="section-desc">{i18nStore.t('settings.profile.description')}</p>

			<div class="section-card">
				<form
					class="settings-form"
					use:formController={{ formStore: profileForm, onSubmit: saveProfile }}
				>
					<div class="form-field">
						<label for="profile-name" class="label">{i18nStore.t('settings.profile.displayName')}</label>
						<input
							id="profile-name"
							name="name"
							type="text"
							class="input"
							placeholder={i18nStore.t('settings.profile.displayNamePlaceholder')}
							disabled={savingProfile}
						/>
						{#if profileForm.errors.name}
							<p class="field-error">{profileForm.errors.name.message}</p>
						{/if}
					</div>

					<div class="form-field">
						<div class="label-row">
							<label for="profile-email" class="label">{i18nStore.t('settings.profile.email')}</label>
							<div class="label-row-end">
								{#if authStore.isEmailVerified}
									<span class="verify-badge verify-badge--verified">{i18nStore.t('settings.profile.verified')}</span>
								{:else}
									<span class="verify-badge verify-badge--unverified"
										>{i18nStore.t('settings.profile.notVerified')}</span
									>
									<button type="button" class="verify-btn" onclick={() => (showVerifyModal = true)}>
										{i18nStore.t('common.actions.verify')}
									</button>
								{/if}
							</div>
						</div>
						<input
							id="profile-email"
							type="email"
							class="input input--readonly"
							value={authStore.state.user?.email ?? ''}
							readonly
							tabindex="-1"
						/>
						{#if authStore.isEmailVerified}
							<p class="field-hint">{i18nStore.t('settings.profile.emailReadonlyHint')}</p>
						{/if}
					</div>

					{#if profileError}
						<p class="field-error">{profileError}</p>
					{/if}

					<div class="form-actions">
						<button
							type="submit"
							class="btn btn-primary btn-sm"
							disabled={savingProfile || !profileForm.hasChanges}
						>
							{#if savingProfile}
								<span class="spinner"></span>
								{i18nStore.t('settings.profile.saving')}
							{:else}
								{i18nStore.t('common.actions.saveChanges')}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Change Password -->
		<div class="settings-section">
			<h2 class="section-title">{i18nStore.t('settings.password.title')}</h2>
			<p class="section-desc">{i18nStore.t('settings.password.description')}</p>

			<div class="section-card">
				<form
					class="settings-form"
					use:formController={{ formStore: passwordForm, onSubmit: changePassword }}
				>
					<div class="form-field">
						<label for="current-password" class="label">{i18nStore.t('settings.password.currentPassword')}</label>
						<input
							id="current-password"
							name="currentPassword"
							type="password"
							class="input"
							placeholder={i18nStore.t('settings.password.currentPasswordPlaceholder')}
							disabled={changingPassword}
						/>
						{#if passwordForm.errors.currentPassword}
							<p class="field-error">{passwordForm.errors.currentPassword.message}</p>
						{/if}
					</div>

					<div class="form-field">
						<label for="new-password" class="label">{i18nStore.t('settings.password.newPassword')}</label>
						<input
							id="new-password"
							name="newPassword"
							type="password"
							class="input"
							placeholder={i18nStore.t('settings.password.newPasswordPlaceholder')}
							disabled={changingPassword}
						/>
						{#if passwordForm.errors.newPassword}
							<p class="field-error">{passwordForm.errors.newPassword.message}</p>
						{/if}
					</div>

					<div class="form-field">
						<label for="confirm-new-password" class="label"
							>{i18nStore.t('settings.password.confirmNewPassword')}</label
						>
						<input
							id="confirm-new-password"
							name="confirmNewPassword"
							type="password"
							class="input"
							placeholder={i18nStore.t('settings.password.confirmNewPasswordPlaceholder')}
							disabled={changingPassword}
						/>
						{#if passwordForm.errors.confirmNewPassword}
							<p class="field-error">{passwordForm.errors.confirmNewPassword.message}</p>
						{/if}
					</div>

					{#if passwordError}
						<p class="field-error">{passwordError}</p>
					{/if}

					<div class="form-actions">
						<button type="submit" class="btn btn-primary btn-sm" disabled={changingPassword}>
							{#if changingPassword}
								<span class="spinner"></span>
								{i18nStore.t('settings.password.changing')}
							{:else}
								{i18nStore.t('settings.password.submit')}
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<!-- Billing -->
	<div class="settings-section">
		<h2 class="section-title">{i18nStore.t('settings.billing.title')}</h2>
		<p class="section-desc">{i18nStore.t('settings.billing.description')}</p>

		{#if billingStore.loading}
			<div class="plan-grid plan-grid--3">
				{#each PLAN_ORDER as planKey (planKey)}
					<div class="plan-card plan-card--skeleton">
						<div class="skeleton-line skeleton-line--title"></div>
						<div class="skeleton-line skeleton-line--price"></div>
						<div class="skeleton-line skeleton-line--desc"></div>
						<div class="skeleton-line skeleton-line--feature"></div>
						<div class="skeleton-line skeleton-line--feature"></div>
						<div class="skeleton-line skeleton-line--feature"></div>
						<div class="skeleton-line skeleton-line--btn"></div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="plan-grid plan-grid--3">
				{#each PLAN_ORDER as key (key)}
					{@const current = isCurrentPlan(key)}
					{@const canUpgrade = isUpgrade(key)}
					<div class="plan-card" class:plan-card--current={current}>
						{#if current}
							<div class="plan-badge plan-badge--current">{i18nStore.t('settings.billing.currentPlanBadge')}</div>
						{:else if key === 'starter' && !current}
							<div class="plan-badge">{i18nStore.t('settings.billing.mostPopularBadge')}</div>
						{/if}
						<div class="plan-header">
							<h3>{i18nStore.t(`settings.plans.${key}.name`)}</h3>
							<div class="plan-price">
								{#if key === 'free'}
									<span class="price">$0</span>
								{:else}
									<span class="price">${key === 'starter' ? '19' : '49'}</span>
								{/if}
								<span class="period">{i18nStore.t('settings.billing.period')}</span>
							</div>
						</div>
						<p class="plan-desc">
							{#if key === 'free'}
								{i18nStore.t('settings.billing.freeDescription')}
							{:else if key === 'starter'}
								{i18nStore.t('settings.billing.starterDescription')}
							{:else}
								{i18nStore.t('settings.billing.proDescription')}
							{/if}
						</p>
						<ul class="plan-features">
							{#each PLAN_FEATURE_INDEXES[key] as featureIndex (featureIndex)}
								<li>
									<svg
										class="check-icon"
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										stroke-linecap="round"
										stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
									>
									{i18nStore.t(`settings.plans.${key}.features.${featureIndex}`)}
								</li>
							{/each}
						</ul>
						{#if current}
							<span class="current-plan-chip">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg
								>
								{i18nStore.t('settings.billing.activeChip')}
							</span>
						{:else if canUpgrade}
							<button
								class="btn btn-primary"
								onclick={() => upgrade(key as 'starter' | 'pro')}
								disabled={loading !== ''}
							>
								{loading === key
									? i18nStore.t('common.actions.redirecting')
									: i18nStore.t('common.actions.upgrade')}
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<div class="billing-footer">
			<button class="btn btn-secondary" onclick={portal}>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>
				{i18nStore.t('common.actions.manageSubscription')}
			</button>
			{#if error}<p class="error">{error}</p>{/if}
		</div>
	</div>

	<!-- Danger Zone -->
	<div class="settings-section danger-zone">
		<div class="danger-header">
			<div class="danger-icon">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
					/>
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</svg>
			</div>
			<div>
				<h2 class="section-title section-title--danger">{i18nStore.t('settings.danger.title')}</h2>
				<p class="section-desc">
					{i18nStore.t('settings.danger.description')}
				</p>
			</div>
		</div>

		<button class="btn btn-danger-outline" onclick={() => (showDeleteModal = true)}>
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
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
			</svg>
			{i18nStore.t('settings.danger.deleteAccount')}
		</button>
	</div>

	<LegalDisclaimer />
</section>

{#if showVerifyModal}
	<EmailVerificationModal
		email={authStore.state.user?.email ?? ''}
		onVerified={handleVerified}
		onClose={() => (showVerifyModal = false)}
	/>
{/if}

{#if showDeleteModal}
	<DeleteAccountModal
		userEmail={authStore.state.user?.email ?? ''}
		{deleting}
		onConfirm={handleDeleteAccount}
		onClose={() => (showDeleteModal = false)}
	/>
{/if}

<style>
	.settings {
		max-width: var(--width-lg);
		margin: 0 auto;
	}

	h1 {
		font-family: var(--display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-bold);
		color: var(--white);
		margin-bottom: var(--space-5);
	}

	.locale-switcher {
		max-width: 280px;
		margin-bottom: var(--space-8);
	}

	.input--locale {
		appearance: none;
		cursor: pointer;
	}

	/* ===== Account Grid ===== */
	.account-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-5);
		margin-bottom: var(--space-10);
	}

	.account-grid .settings-section {
		margin-bottom: 0;
	}

	/* ===== Settings Sections ===== */
	.settings-section {
		margin-bottom: var(--space-10);
	}

	.section-title {
		font-family: var(--display);
		font-size: var(--text-lg);
		font-weight: var(--weight-semibold);
		color: var(--white);
		margin-bottom: var(--space-1_5);
	}

	.section-desc {
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		margin-bottom: var(--space-4);
		line-height: var(--leading-relaxed);
	}

	/* ===== Section Card ===== */
	.section-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		flex: 1;
	}

	.account-grid .settings-section {
		display: flex;
		flex-direction: column;
	}

	/* ===== Form Styles ===== */
	.settings-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.form-field {
		display: flex;
		flex-direction: column;
	}

	.label {
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

	.input:hover:not(:disabled):not(.input--readonly) {
		border-color: var(--border-hover);
	}

	.input:focus:not(.input--readonly) {
		border-color: var(--border-focus);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.06);
	}

	.input:disabled {
		opacity: 0.6;
	}

	.input--readonly {
		opacity: 0.6;
		cursor: default;
	}

	.field-error {
		color: var(--danger);
		font-size: var(--text-caption);
		margin-top: var(--space-1_5);
	}

	.field-hint {
		color: var(--text-light);
		font-size: var(--text-xs);
		margin-top: var(--space-1);
	}

	/* ===== Email Verification ===== */
	.label-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-2);
	}

	.label-row .label {
		margin-bottom: 0;
	}

	.label-row-end {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.verify-badge {
		font-size: var(--text-nano);
		font-weight: var(--weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-wide);
		padding: 3px var(--space-2_5);
		border-radius: var(--radius-pill);
		white-space: nowrap;
		flex-shrink: 0;
		display: inline-block;
	}

	.verify-badge--verified {
		background: var(--secondary-soft);
		color: var(--secondary);
		border: 1px solid rgba(56, 190, 201, 0.15);
	}

	.verify-badge--unverified {
		background: var(--warning-soft);
		color: var(--warning);
		border: 1px solid rgba(232, 168, 72, 0.15);
	}

	.verify-btn {
		font-family: var(--body);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--primary);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color 0.15s;
	}

	.verify-btn:hover:not(:disabled) {
		color: var(--primary-deep);
	}

	.verify-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-actions {
		padding-top: var(--space-1);
	}

	/* ===== Spinner ===== */
	.spinner {
		width: 14px;
		height: 14px;
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

	/* ===== Plan Grid ===== */
	.plan-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-5);
		margin-bottom: var(--space-6);
	}

	.plan-grid--3 {
		grid-template-columns: repeat(3, 1fr);
	}

	.plan-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		padding: var(--space-9) var(--space-7);
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-sm);
		transition:
			transform 0.3s var(--ease-spring),
			box-shadow 0.3s var(--ease-spring),
			border-color 0.3s var(--ease-spring);
		position: relative;
	}

	.plan-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: var(--border-hover);
	}

	.plan-card--current {
		border-color: rgba(56, 190, 201, 0.35);
		box-shadow: var(--shadow-lg);
		background:
			linear-gradient(135deg, rgba(56, 190, 201, 0.04) 0%, rgba(232, 168, 72, 0.02) 100%),
			var(--surface);
	}

	.plan-card--current:hover {
		border-color: rgba(56, 190, 201, 0.5);
		box-shadow:
			var(--shadow-lg),
			0 0 0 1px rgba(56, 190, 201, 0.08);
		transform: none;
	}

	.plan-badge {
		position: absolute;
		top: -11px;
		right: var(--space-6);
		font-family: var(--body);
		font-size: var(--text-nano);
		font-weight: var(--weight-bold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		padding: 3px var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--primary);
		color: var(--primary-on);
	}

	.plan-badge--current {
		background: var(--secondary);
		color: var(--bg);
	}

	/* ===== Current Plan Chip ===== */
	.current-plan-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-1_5);
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		padding: var(--space-3) var(--space-6);
		border-radius: var(--radius-sm);
		background: var(--secondary-soft);
		color: var(--secondary);
		border: 1px solid rgba(56, 190, 201, 0.15);
		width: 100%;
	}

	/* ===== Skeleton Loading ===== */
	.plan-card--skeleton {
		pointer-events: none;
	}

	.skeleton-line {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 25%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.04) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 6px;
	}

	.skeleton-line--title {
		width: 60%;
		height: 22px;
		margin-bottom: var(--space-3);
	}

	.skeleton-line--price {
		width: 40%;
		height: 32px;
		margin-bottom: var(--space-3);
	}

	.skeleton-line--desc {
		width: 90%;
		height: 16px;
		margin-bottom: var(--space-5);
	}

	.skeleton-line--feature {
		width: 80%;
		height: 14px;
		margin-bottom: var(--space-2_5);
	}

	.skeleton-line--btn {
		width: 100%;
		height: 48px;
		margin-top: auto;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.plan-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: var(--space-2);
	}

	.plan-header h3 {
		font-family: var(--display);
		font-size: var(--text-xl);
		font-weight: var(--weight-bold);
		color: var(--white);
	}

	.plan-price {
		display: flex;
		align-items: baseline;
		gap: var(--space-0_5);
	}

	.price {
		font-family: var(--display);
		font-size: var(--text-4xl);
		font-weight: var(--weight-bold);
		color: var(--white);
	}

	.period {
		font-size: var(--text-sm);
		color: var(--text-light);
	}

	.plan-desc {
		font-size: var(--text-sm);
		color: var(--text-mid);
		margin-bottom: var(--space-5);
		line-height: var(--leading-relaxed);
	}

	.plan-features {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-6);
		flex: 1;
	}

	.plan-features li {
		display: flex;
		align-items: center;
		gap: var(--space-2_5);
		font-size: var(--text-sm);
		color: var(--text-mid);
		padding: var(--space-1_5) 0;
	}

	.check-icon {
		flex-shrink: 0;
		color: var(--secondary);
	}

	/* ===== Billing Footer ===== */
	.billing-footer {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	/* ===== Buttons ===== */
	.btn {
		font-family: var(--body);
		font-size: var(--text-base);
		font-weight: var(--weight-bold);
		border-radius: var(--radius-sm);
		padding: var(--space-4) var(--space-8);
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		transition:
			background 0.25s var(--ease-spring),
			transform 0.25s var(--ease-spring),
			box-shadow 0.25s var(--ease-spring);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-sm {
		font-size: var(--text-caption);
		padding: var(--space-2_5) var(--space-5);
	}

	.btn-primary {
		background: var(--primary);
		color: var(--primary-on);
		box-shadow: var(--shadow-sm);
	}

	.plan-card .btn-primary {
		width: 100%;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-deep);
		transform: translateY(-2px) scale(1.02);
		box-shadow: var(--shadow-md);
	}

	.btn-secondary {
		background: var(--surface-raised);
		color: var(--white);
		border: 1px solid var(--border-hover);
		box-shadow: var(--shadow-sm);
	}

	.btn-secondary:hover {
		background: var(--surface-hover);
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.18);
		box-shadow: var(--shadow-md);
	}

	.error {
		color: var(--danger);
		font-size: var(--text-sm);
	}

	/* ===== Danger Zone ===== */
	.danger-zone {
		background: var(--surface);
		border: 1px solid rgba(224, 82, 82, 0.2);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	.danger-header {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		margin-bottom: var(--space-5);
	}

	.danger-header .section-title {
		margin-bottom: var(--space-1);
	}

	.danger-header .section-desc {
		margin-bottom: 0;
	}

	.danger-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 14px;
		background: var(--danger-soft);
		border: 1px solid rgba(224, 82, 82, 0.15);
		color: var(--danger);
		flex-shrink: 0;
	}

	.section-title--danger {
		color: var(--danger);
	}

	.btn-danger-outline {
		font-family: var(--body);
		font-size: var(--text-sm);
		font-weight: var(--weight-bold);
		padding: var(--space-2_5) var(--space-6);
		border-radius: var(--radius-sm);
		border: 1px solid rgba(224, 82, 82, 0.3);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		color: var(--danger);
		transition:
			background 0.25s var(--ease-spring),
			transform 0.25s var(--ease-spring),
			border-color 0.25s var(--ease-spring);
	}

	.btn-danger-outline:hover {
		background: var(--danger-soft);
		border-color: rgba(224, 82, 82, 0.5);
		transform: translateY(-2px);
	}

	/* ===== Responsive ===== */
	@media (max-width: 900px) {
		.account-grid {
			grid-template-columns: 1fr;
		}

		.account-grid .settings-section {
			margin-bottom: 0;
		}

		.plan-grid,
		.plan-grid--3 {
			grid-template-columns: 1fr;
		}

		.billing-footer {
			flex-direction: column;
			align-items: flex-start;
		}

		.settings-form {
			max-width: 100%;
		}
	}
</style>
