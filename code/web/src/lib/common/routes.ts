export const routes = {
	auth: {
		login: '/auth/login',
		signup: '/auth/signup',
		verifyEmail: '/auth/verify-email',
		forgotPassword: '/auth/forgot-password',
		resetPassword: '/auth/reset-password'
	},
	app: '/todos',
	todos: '/todos',
	settings: '/settings'
} as const;
