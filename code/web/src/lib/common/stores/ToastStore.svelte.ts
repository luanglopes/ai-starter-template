type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type Toast = {
	id: string;
	variant: ToastVariant;
	message: string;
};

type ToastInput = {
	message: string;
};

export class ToastStore {
	toasts = $state<Toast[]>([]);

	#add(variant: ToastVariant, input: ToastInput) {
		const id = crypto.randomUUID();
		this.toasts.push({ id, variant, message: input.message });
		setTimeout(() => this.dismiss(id), 4000);
	}

	success(input: ToastInput) {
		this.#add('success', input);
	}

	error(input: ToastInput) {
		this.#add('error', input);
	}

	info(input: ToastInput) {
		this.#add('info', input);
	}

	dismiss(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}
}

let toastStore: ToastStore;

export function getToastStore() {
	if (!toastStore) {
		toastStore = new ToastStore();
	}
	return toastStore;
}
