import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { routes } from '$lib/common/routes';
import { getI18nStore } from '$lib/common/i18n/I18nStore.svelte';
import { getToastStore } from '$lib/common/stores/ToastStore.svelte';
import { getBillingStore } from '$lib/billing/stores/BillingStore.svelte';
import { untrack } from 'svelte';
import { authClient } from '../client';
import type { LoginFormOutput } from './LoginFormStore.svelte';
import type { SignUpFormOutput } from './SignUpFormStore.svelte';

type User = {
	id: string;
	email: string;
	name: string | null;
	emailVerified: boolean;
	createdAt: Date;
};

type AuthState = {
	user: User | null;
};

type SignupErrorType = 'duplicate_email' | 'general' | undefined;

export class AuthStore {
	state = $state<AuthState>({
		user: null
	});
	isAuthenticated = $derived(!!this.state.user);
	isEmailVerified = $derived(!!this.state.user?.emailVerified);
	loaders = $state({
		pending: true,
		signup: false,
		login: false
	});
	errorMessage = $state<string>();
	signupErrorType = $state<SignupErrorType>();
	pendingVerificationEmail = $state<string>();
	pendingPasswordResetEmail = $state<string>();
	#isMonitoringRoutes = false;

	constructor() {
		this.init();
	}

	private async init() {
		const sessionResult = await authClient.getSession();
		if (sessionResult.error) {
			console.log('Error getting session on init:', sessionResult.error);
		}
		const sessionUser = sessionResult.data?.user;
		this.state.user = sessionUser
			? {
					id: sessionUser.id,
					email: sessionUser.email,
					name: sessionUser.name,
					emailVerified: sessionUser.emailVerified,
					createdAt: sessionUser.createdAt
				}
			: null;

		if (this.state.user) {
			await getBillingStore().load();
		}

		this.loaders.pending = false;
		await this.checkAuth();
	}

	private async checkAuth() {
		if (this.loaders.pending) return;
		Object.keys($state.snapshot(this.loaders)).forEach((key) => {
			if (key !== 'pending') {
				this.loaders[key as keyof typeof this.loaders] = false;
			}
		});
		this.errorMessage = undefined;
		const isGuestRoute = page.route.id?.startsWith('/auth');
		if (!this.isAuthenticated && !isGuestRoute) {
			await goto(resolve(routes.auth.login));
		}
	}

	async monitorRouteChanges(caller: string) {
		$effect(() => {
			if (this.#isMonitoringRoutes)
				throw new Error(`monitorRouteChanges already called by another caller: ${caller}`);
			this.#isMonitoringRoutes = true;
			if (page.route.id) {
				this.errorMessage = undefined;
				untrack(() => {
					this.checkAuth();
				});
			}
			return () => {
				this.#isMonitoringRoutes = false;
			};
		});
	}

	async signUp(input: SignUpFormOutput, captchaToken?: string) {
		this.errorMessage = undefined;
		this.signupErrorType = undefined;
		this.loaders.signup = true;

		// Exclude confirmPassword and termsAccepted before sending to API
		const { confirmPassword, termsAccepted, ...signUpData } = input;
		void confirmPassword;
		void termsAccepted;

		const { error } = await authClient.signUp.email({
			email: signUpData.email,
			password: signUpData.password,
			name: signUpData.name,
			fetchOptions: captchaToken ? { headers: { 'x-captcha-response': captchaToken } } : undefined
		});
		if (error) {
			const msg = error.message?.toLowerCase() ?? '';
			if (msg.includes('user already exists')) {
				this.signupErrorType = 'duplicate_email';
				this.errorMessage = getI18nStore().t('auth.store.duplicateEmail');
			} else {
				this.signupErrorType = 'general';
				this.errorMessage = error.message;
			}
			this.loaders.signup = false;
		} else {
			await this.refreshSession();
			this.pendingVerificationEmail = signUpData.email;
			this.loaders.signup = false;
			await goto(resolve(routes.auth.verifyEmail));
		}
	}

	async login(input: LoginFormOutput) {
		this.errorMessage = undefined;
		this.loaders.login = true;
		const { data, error } = await authClient.signIn.email({
			email: input.email,
			password: input.password,
			rememberMe: input.rememberMe ?? false
		});
		if (error) {
			this.errorMessage = error.message;
			this.loaders.login = false;
		} else {
			this.state.user = {
				id: data.user.id,
				email: data.user.email,
				name: data.user.name,
				emailVerified: data.user.emailVerified,
				createdAt: data.user.createdAt
			};

			await getBillingStore().load();
			await goto(resolve(routes.app));
		}
	}

	async sendVerificationOTP(
		email: string,
		captchaToken?: string
	): Promise<{ success: boolean; error?: string }> {
		const { error } = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: 'email-verification',
			fetchOptions: captchaToken ? { headers: { 'x-captcha-response': captchaToken } } : undefined
		});
		if (error) {
			return { success: false, error: error.message };
		}
		return { success: true };
	}

	async verifyEmailWithOTP(
		email: string,
		otp: string
	): Promise<{ success: boolean; error?: string }> {
		const { error } = await authClient.emailOtp.verifyEmail({
			email,
			otp
		});
		if (error) {
			return { success: false, error: error.message };
		}
		return { success: true };
	}

	async sendPasswordResetOTP(
		email: string,
		captchaToken?: string
	): Promise<{ success: boolean; error?: string }> {
		const { error } = await authClient.forgetPassword.emailOtp({
			email,
			fetchOptions: captchaToken ? { headers: { 'x-captcha-response': captchaToken } } : undefined
		});
		if (error) {
			return { success: false, error: error.message };
		}
		return { success: true };
	}

	async resetPasswordWithOTP(
		email: string,
		otp: string,
		newPassword: string
	): Promise<{ success: boolean; error?: string }> {
		const { error } = await authClient.emailOtp.resetPassword({
			email,
			otp,
			password: newPassword
		});
		if (error) {
			return { success: false, error: error.message };
		}
		return { success: true };
	}

	async refreshSession() {
		const { data: session } = await authClient.getSession();
		if (session?.user) {
			this.state.user = {
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
				emailVerified: session.user.emailVerified,
				createdAt: session.user.createdAt
			};
		}
	}

	async logout() {
		await authClient.signOut();
		this.state.user = null;
		getToastStore().info({ message: getI18nStore().t('auth.store.signedOut') });
		await goto(resolve(routes.auth.login));
	}
}

let authStore: AuthStore;

export function getAuthStore() {
	if (!authStore) {
		authStore = new AuthStore();
	}
	return authStore;
}
