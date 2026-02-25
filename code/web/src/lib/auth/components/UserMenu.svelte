<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAuthStore } from '$lib/auth/stores/AuthStore.svelte';
	import { getBillingStore } from '$lib/billing/stores/BillingStore.svelte';
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
	import { routes } from '$lib/common/routes';

	const authStore = getAuthStore();
	const billingStore = getBillingStore();
	const i18nStore = getI18nStore();

	let open = $state(false);
	let menuEl: HTMLDivElement | undefined = $state();

	let initials = $derived.by(() => {
		const user = authStore.state.user;
		if (!user) return '?';
		if (user.name) return user.name.charAt(0).toUpperCase();
		return user.email.charAt(0).toUpperCase();
	});

	let displayName = $derived(authStore.state.user?.name ?? authStore.state.user?.email ?? '');
	let displayEmail = $derived(authStore.state.user?.email ?? '');

	function toggle() {
		open = !open;
	}

	function handleClickOutside(e: MouseEvent) {
		if (menuEl && !menuEl.contains(e.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
		} else {
			document.removeEventListener('click', handleClickOutside, true);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	});

	async function goToSettings() {
		open = false;
		await goto(resolve(routes.settings));
	}

	async function handleLogout() {
		open = false;
		await authStore.logout();
	}
</script>

{#if authStore.state.user}
	<div class="user-menu" bind:this={menuEl}>
		<button class="user-menu-trigger" onclick={toggle} aria-expanded={open} aria-haspopup="true">
			<div class="avatar">{initials}</div>
			<div class="user-info">
				<div class="user-name">{displayName}</div>
				<div class="user-email">{displayEmail}</div>
			</div>
			<div class="expand-icon" class:expand-icon--open={open}>
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
					<path d="M18 15l-6-6-6 6" />
				</svg>
			</div>
		</button>

		{#if open}
			<div class="dropdown" role="menu">
				<div class="plan-row">
					<span class="plan-label">{i18nStore.t('userMenu.currentPlan')}</span>
					<span class="plan-badge">{i18nStore.t(`settings.plans.${billingStore.plan}.name`)}</span>
				</div>
				<div class="divider"></div>
				<button class="dropdown-item" role="menuitem" onclick={goToSettings}>
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
						<path
							d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
						/>
						<circle cx="12" cy="12" r="3" />
					</svg>
					{i18nStore.t('userMenu.settings')}
				</button>
				<div class="divider"></div>
				<button class="dropdown-item dropdown-item--danger" role="menuitem" onclick={handleLogout}>
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
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
					{i18nStore.t('userMenu.logout')}
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* ===== User Menu Wrapper ===== */
	.user-menu {
		position: relative;
		margin-top: auto;
	}

	/* ===== Trigger ===== */
	.user-menu-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-5);
		border: none;
		border-top: 1px solid var(--border);
		background: none;
		cursor: pointer;
		transition: background 0.15s;
		font-family: var(--body);
		text-align: left;
	}

	.user-menu-trigger:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	/* ===== Avatar ===== */
	.avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--primary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--display);
		font-size: var(--text-caption);
		font-weight: var(--weight-semibold);
		color: var(--primary-on);
		flex-shrink: 0;
	}

	/* ===== User Info ===== */
	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--white);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-email {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--text-light);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ===== Expand Icon ===== */
	.expand-icon {
		margin-left: auto;
		flex-shrink: 0;
		color: var(--text-light);
		transition: transform 0.15s;
		display: flex;
	}

	.expand-icon--open {
		transform: rotate(180deg);
	}

	/* ===== Dropdown ===== */
	.dropdown {
		position: absolute;
		bottom: calc(100% + var(--space-1_5));
		left: var(--space-3);
		right: var(--space-3);
		z-index: var(--z-sticky);
		background: var(--surface-raised);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--space-1_5);
		box-shadow: var(--shadow-lg);
		animation: menuPopIn 0.15s ease-out;
		transform-origin: bottom center;
	}

	@keyframes menuPopIn {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* ===== Plan Row ===== */
	.plan-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-2_5) var(--space-3_5);
	}

	.plan-label {
		font-size: var(--text-xs);
		font-weight: var(--weight-medium);
		color: var(--text-light);
	}

	.plan-badge {
		display: inline-flex;
		padding: var(--space-0_5) var(--space-2_5);
		font-size: var(--text-micro);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-pill);
		background: var(--secondary-soft);
		color: var(--secondary);
	}

	/* ===== Divider ===== */
	.divider {
		height: 1px;
		background: var(--border);
		margin: var(--space-1) var(--space-2);
	}

	/* ===== Dropdown Items ===== */
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: var(--space-2_5);
		width: 100%;
		padding: var(--space-2_5) var(--space-3_5);
		border: none;
		border-radius: 10px;
		background: none;
		font-family: var(--body);
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.dropdown-item:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--white);
	}

	.dropdown-item--danger {
		color: var(--danger);
	}

	.dropdown-item--danger:hover {
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
