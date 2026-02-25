<script lang="ts">
	import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';

	type Props = {
		userEmail: string;
		onConfirm: () => void;
		onClose: () => void;
		deleting: boolean;
	};

	let { userEmail, onConfirm, onClose, deleting }: Props = $props();
	const i18nStore = getI18nStore();

	let dialogEl = $state<HTMLDialogElement>();
	let confirmEmail = $state('');
	let canDelete = $derived(confirmEmail === userEmail);

	$effect(() => {
		if (dialogEl && !dialogEl.open) dialogEl.showModal();
	});
</script>

<dialog
	bind:this={dialogEl}
	aria-label={i18nStore.t('settings.deleteModal.title')}
	oncancel={(e) => {
		e.preventDefault();
		if (!deleting) onClose();
	}}
>
	<div class="modal">
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
				<path
					d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
				/>
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		</div>

		<h2 class="modal-title">{i18nStore.t('settings.deleteModal.title')}</h2>
		<p class="modal-desc">
			{i18nStore.t('settings.deleteModal.description')}
		</p>

		<div class="confirm-section" inert={deleting}>
			<label for="confirm-email" class="label">
				{i18nStore.t('settings.deleteModal.confirmLabel', { email: userEmail })}
			</label>
			<input
				id="confirm-email"
				type="email"
				class="input"
				placeholder={i18nStore.t('settings.deleteModal.confirmPlaceholder')}
				bind:value={confirmEmail}
				autocomplete="off"
			/>
		</div>

		<div class="modal-actions">
			<button class="btn btn-danger" onclick={onConfirm} disabled={!canDelete || deleting}>
				{#if deleting}
					<span class="spinner"></span>
					{i18nStore.t('settings.danger.deleting')}
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
						<polyline points="3 6 5 6 21 6" />
						<path
							d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
						/>
					</svg>
					{i18nStore.t('settings.danger.deleteMyAccount')}
				{/if}
			</button>
			<button class="btn btn-ghost" onclick={onClose} disabled={deleting}
				>{i18nStore.t('common.actions.cancel')}</button
			>
		</div>
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

	.modal-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: var(--space-4);
		background: var(--danger-soft);
		border: 1px solid rgba(224, 82, 82, 0.15);
		color: var(--danger);
		margin-bottom: var(--space-4);
	}

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

	/* ===== Confirm Section ===== */
	.confirm-section {
		text-align: left;
		margin-bottom: var(--space-6);
	}

	.label {
		display: block;
		font-size: var(--text-caption);
		font-weight: var(--weight-medium);
		color: var(--text-mid);
		margin-bottom: var(--space-2);
	}

	.input {
		width: 100%;
		padding: var(--space-2_5) var(--space-3_5);
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
		border-color: var(--danger);
		box-shadow: 0 0 0 3px rgba(224, 82, 82, 0.12);
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

	.btn-danger {
		background: var(--danger);
		color: var(--white);
		box-shadow: var(--shadow-sm);
	}

	.btn-danger:hover:not(:disabled) {
		background: #c43c3c;
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
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: var(--white);
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
