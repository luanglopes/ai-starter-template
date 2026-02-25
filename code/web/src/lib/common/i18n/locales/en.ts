export default {
	common: {
		appName: 'AI Starter',
		authMarketing: 'Production-ready auth, billing, and AI-enhanced todos.',
		language: {
			label: 'Language',
			en: 'English',
			ptBR: 'Portuguese (Brazil)'
		},
		legalDisclaimer:
			'AI Starter provides AI-assisted text suggestions. Always review and verify generated content before using it in production workflows.',
		status: {
			loading: 'Loading...'
		},
		actions: {
			cancel: 'Cancel',
			saveChanges: 'Save Changes',
			delete: 'Delete',
			verify: 'Verify',
			upgrade: 'Upgrade',
			manageSubscription: 'Manage Subscription',
			redirecting: 'Redirecting...'
		}
	},
	navigation: {
		todos: 'Todos',
		settings: 'Settings'
	},
	auth: {
		login: {
			title: 'Welcome back',
			subtitle: 'Sign in to your account to continue',
			emailLabel: 'Email',
			passwordLabel: 'Password',
			passwordPlaceholder: 'Enter your password',
			forgotPassword: 'Forgot password?',
			rememberMe: 'Remember me',
			submitting: 'Signing in...',
			submit: 'Sign in',
			footerPrefix: "Don't have an account?",
			footerLink: 'Create one'
		},
		signup: {
			title: 'Create your account',
			subtitle: 'Get started with your new account',
			duplicateEmailPrefix: 'This email is already registered.',
			duplicateEmailLink: 'Sign in instead?',
			nameLabel: 'Full name',
			namePlaceholder: 'Jane Smith',
			emailLabel: 'Email',
			emailPlaceholder: 'you@company.com',
			passwordLabel: 'Password',
			passwordPlaceholder: 'Min. 8 characters',
			confirmPasswordLabel: 'Confirm password',
			confirmPasswordPlaceholder: 'Repeat password',
			termsPrefix: 'I agree to the',
			termsOfService: 'Terms of Service',
			and: 'and',
			privacyPolicy: 'Privacy Policy',
			submitting: 'Creating account...',
			submit: 'Create account',
			footerPrefix: 'Already have an account?',
			footerLink: 'Sign in'
		},
		forgotPassword: {
			title: 'Reset your password',
			subtitle: "Enter your email and we'll send you a code to reset it",
			emailLabel: 'Email',
			emailPlaceholder: 'you@company.com',
			submitting: 'Sending code...',
			submit: 'Send reset code',
			backToSignIn: 'Back to sign in'
		},
		resetPassword: {
			title: 'Set new password',
			subtitleWithEmail: 'Enter the code sent to %{email} and your new password',
			subtitleNoEmail: 'Reset your password',
			noPending: 'No pending password reset found.',
			requestCode: 'Request a reset code',
			otpLabel: 'Verification code',
			otpPlaceholder: '000000',
			newPasswordLabel: 'New password',
			newPasswordPlaceholder: 'Min. 8 characters',
			confirmPasswordLabel: 'Confirm new password',
			confirmPasswordPlaceholder: 'Repeat new password',
			submitting: 'Resetting password...',
			submit: 'Reset password',
			backToSignIn: 'Back to sign in',
			otpRequired: 'Please enter the 6-digit code from your email',
			success: 'Password reset successful! Redirecting to sign in...'
		},
		verifyEmail: {
			title: 'Verify your email',
			subtitleWithEmail: 'We sent a 6-digit code to %{email}',
			subtitleNoEmail: 'Enter your verification code',
			noPending: 'No pending email verification found.',
			backToSignIn: 'Back to sign in',
			otpLabel: 'Verification code',
			otpPlaceholder: '000000',
			verifying: 'Verifying...',
			submit: 'Verify email',
			resendPrompt: "Didn't receive the code?",
			resending: 'Sending...',
			resendIn: 'Resend in %{time}',
			resendCode: 'Resend code',
			success: 'Verification code sent to your email',
			skip: 'Skip for now'
		},
		store: {
			duplicateEmail: 'This email is already registered.',
			signedOut: "You've been signed out"
		}
	},
	validation: {
		emailInvalid: 'Invalid email address',
		passwordMin8: 'Password must be at least 8 characters long',
		passwordsDoNotMatch: 'Passwords do not match',
		nameMin3: 'Name must be at least 3 characters long',
		termsRequired: 'You must accept the Terms of Service',
		currentPasswordRequired: 'Current password is required',
		newPasswordMin6: 'New password must be at least 6 characters',
		confirmNewPasswordRequired: 'Please confirm your new password',
		nameRequired: 'Name is required'
	},
	todos: {
		title: 'Todos',
		subtitle: 'Manage your tasks and use AI to improve descriptions.',
		titlePlaceholder: 'Todo title',
		descriptionPlaceholder: 'Optional description',
		addTodo: 'Add Todo',
		empty: 'No todos yet.',
		actions: {
			aiEnhance: 'AI Enhance',
			delete: 'Delete'
		}
	},
	settings: {
		title: 'Settings',
		profile: {
			title: 'Profile',
			description: 'Manage your account information.',
			displayName: 'Display Name',
			displayNamePlaceholder: 'Your name',
			email: 'Email',
			emailReadonlyHint: 'Email cannot be changed.',
			verified: 'Verified',
			notVerified: 'Not verified',
			saving: 'Saving...',
			updateFailed: 'Failed to update profile.',
			updatedSuccess: 'Profile updated successfully.',
			emailVerifiedSuccess: 'Email verified successfully.'
		},
		password: {
			title: 'Change Password',
			description: 'Update your account password.',
			currentPassword: 'Current Password',
			currentPasswordPlaceholder: 'Enter current password',
			newPassword: 'New Password',
			newPasswordPlaceholder: 'Enter new password',
			confirmNewPassword: 'Confirm New Password',
			confirmNewPasswordPlaceholder: 'Confirm new password',
			changing: 'Changing...',
			submit: 'Change Password',
			changeFailed: 'Failed to change password.',
			changedSuccess: 'Password changed successfully.'
		},
		billing: {
			title: 'Billing',
			description: 'Choose a plan that fits your needs.',
			currentPlanBadge: 'Current Plan',
			mostPopularBadge: 'Most Popular',
			period: '/mo',
			freeDescription: 'Get started with the basics.',
			starterDescription: 'For serious investors.',
			proDescription: 'For power users who need it all.',
			activeChip: 'Active'
		},
		plans: {
			free: {
				name: 'Free',
				features: [
					'Up to 50 todos',
					'20 AI description enhancements per month',
					'Core todo management'
				]
			},
			starter: {
				name: 'Starter',
				features: [
					'Up to 250 todos',
					'200 AI description enhancements per month',
					'Priority billing support',
					'Best for growing teams'
				]
			},
			pro: {
				name: 'Pro',
				features: [
					'Unlimited todos',
					'1000 AI description enhancements per month',
					'Fastest support response',
					'Ideal for AI-heavy workflows',
					'Advanced usage visibility'
				]
			}
		},
		danger: {
			title: 'Danger Zone',
			description:
				'Permanently delete your account and all associated data. This action cannot be undone.',
			deleteAccount: 'Delete Account',
			deleteMyAccount: 'Delete My Account',
			deleting: 'Deleting...',
			deleteFailed: 'Failed to delete account.'
		},
		deleteModal: {
			title: 'Delete Account',
			description:
				'This action is permanent and irreversible. All your projects, releases, and data will be permanently deleted.',
			confirmLabel: 'Type %{email} to confirm',
			confirmPlaceholder: 'Enter your email'
		},
		emailVerificationModal: {
			successTitle: 'Email Verified',
			successDescription: 'Your email has been verified successfully.',
			title: 'Verify your email',
			captchaDescription: "We'll send a 6-digit code to %{email}",
			otpDescription: 'Enter the 6-digit code sent to %{email}',
			sending: 'Sending...',
			sendCode: 'Send verification code',
			otpLabel: 'Verification code',
			otpPlaceholder: '000000',
			verifying: 'Verifying...',
			verifyEmail: 'Verify email',
			resending: 'Resending...',
			resendCode: 'Resend code',
			resendAvailableIn: 'Resend available in %{time}'
		}
	},
	userMenu: {
		currentPlan: 'Current plan',
		settings: 'Settings',
		logout: 'Log out'
	}
};
