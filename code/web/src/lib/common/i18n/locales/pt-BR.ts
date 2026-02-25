export default {
	common: {
		appName: 'AI Starter',
		authMarketing: 'Autenticação, billing e todos com IA prontos para produção.',
		language: {
			label: 'Idioma',
			en: 'Inglês',
			ptBR: 'Português (Brasil)'
		},
		legalDisclaimer:
			'O AI Starter fornece sugestões de texto com IA. Sempre revise e valide o conteúdo gerado antes de usar em fluxos de produção.',
		status: {
			loading: 'Carregando...'
		},
		actions: {
			cancel: 'Cancelar',
			saveChanges: 'Salvar alterações',
			delete: 'Excluir',
			verify: 'Verificar',
			upgrade: 'Fazer upgrade',
			manageSubscription: 'Gerenciar assinatura',
			redirecting: 'Redirecionando...'
		}
	},
	navigation: {
		todos: 'Tarefas',
		settings: 'Configurações'
	},
	auth: {
		login: {
			title: 'Bem-vindo de volta',
			subtitle: 'Entre na sua conta para continuar',
			emailLabel: 'E-mail',
			passwordLabel: 'Senha',
			passwordPlaceholder: 'Digite sua senha',
			forgotPassword: 'Esqueceu a senha?',
			rememberMe: 'Lembrar de mim',
			submitting: 'Entrando...',
			submit: 'Entrar',
			footerPrefix: 'Não tem uma conta?',
			footerLink: 'Crie uma'
		},
		signup: {
			title: 'Crie sua conta',
			subtitle: 'Comece agora com sua nova conta',
			duplicateEmailPrefix: 'Este e-mail já está cadastrado.',
			duplicateEmailLink: 'Entrar em vez disso?',
			nameLabel: 'Nome completo',
			namePlaceholder: 'Maria Silva',
			emailLabel: 'E-mail',
			emailPlaceholder: 'voce@empresa.com',
			passwordLabel: 'Senha',
			passwordPlaceholder: 'Mín. 8 caracteres',
			confirmPasswordLabel: 'Confirmar senha',
			confirmPasswordPlaceholder: 'Repita a senha',
			termsPrefix: 'Concordo com os',
			termsOfService: 'Termos de Serviço',
			and: 'e',
			privacyPolicy: 'Política de Privacidade',
			submitting: 'Criando conta...',
			submit: 'Criar conta',
			footerPrefix: 'Já tem uma conta?',
			footerLink: 'Entrar'
		},
		forgotPassword: {
			title: 'Redefinir sua senha',
			subtitle: 'Digite seu e-mail e enviaremos um código para redefinir',
			emailLabel: 'E-mail',
			emailPlaceholder: 'voce@empresa.com',
			submitting: 'Enviando código...',
			submit: 'Enviar código de redefinição',
			backToSignIn: 'Voltar para entrar'
		},
		resetPassword: {
			title: 'Definir nova senha',
			subtitleWithEmail: 'Digite o código enviado para %{email} e sua nova senha',
			subtitleNoEmail: 'Redefina sua senha',
			noPending: 'Nenhuma redefinição de senha pendente foi encontrada.',
			requestCode: 'Solicitar um código',
			otpLabel: 'Código de verificação',
			otpPlaceholder: '000000',
			newPasswordLabel: 'Nova senha',
			newPasswordPlaceholder: 'Mín. 8 caracteres',
			confirmPasswordLabel: 'Confirmar nova senha',
			confirmPasswordPlaceholder: 'Repita a nova senha',
			submitting: 'Redefinindo senha...',
			submit: 'Redefinir senha',
			backToSignIn: 'Voltar para entrar',
			otpRequired: 'Digite o código de 6 dígitos enviado para seu e-mail',
			success: 'Senha redefinida com sucesso! Redirecionando para login...'
		},
		verifyEmail: {
			title: 'Verifique seu e-mail',
			subtitleWithEmail: 'Enviamos um código de 6 dígitos para %{email}',
			subtitleNoEmail: 'Digite seu código de verificação',
			noPending: 'Nenhuma verificação de e-mail pendente foi encontrada.',
			backToSignIn: 'Voltar para entrar',
			otpLabel: 'Código de verificação',
			otpPlaceholder: '000000',
			verifying: 'Verificando...',
			submit: 'Verificar e-mail',
			resendPrompt: 'Não recebeu o código?',
			resending: 'Enviando...',
			resendIn: 'Reenviar em %{time}',
			resendCode: 'Reenviar código',
			success: 'Código de verificação enviado para seu e-mail',
			skip: 'Pular por agora'
		},
		store: {
			duplicateEmail: 'Este e-mail já está cadastrado.',
			signedOut: 'Você saiu da conta'
		}
	},
	validation: {
		emailInvalid: 'E-mail inválido',
		passwordMin8: 'A senha deve ter pelo menos 8 caracteres',
		passwordsDoNotMatch: 'As senhas não coincidem',
		nameMin3: 'O nome deve ter pelo menos 3 caracteres',
		termsRequired: 'Você deve aceitar os Termos de Serviço',
		currentPasswordRequired: 'A senha atual é obrigatória',
		newPasswordMin6: 'A nova senha deve ter pelo menos 6 caracteres',
		confirmNewPasswordRequired: 'Confirme sua nova senha',
		nameRequired: 'Nome é obrigatório'
	},
	todos: {
		title: 'Tarefas',
		subtitle: 'Gerencie suas tarefas e use IA para melhorar descrições.',
		titlePlaceholder: 'Título da tarefa',
		descriptionPlaceholder: 'Descrição opcional',
		addTodo: 'Adicionar tarefa',
		empty: 'Ainda não há tarefas.',
		actions: {
			aiEnhance: 'Melhorar com IA',
			delete: 'Excluir'
		}
	},
	settings: {
		title: 'Configurações',
		profile: {
			title: 'Perfil',
			description: 'Gerencie as informações da sua conta.',
			displayName: 'Nome de exibição',
			displayNamePlaceholder: 'Seu nome',
			email: 'E-mail',
			emailReadonlyHint: 'O e-mail não pode ser alterado.',
			verified: 'Verificado',
			notVerified: 'Não verificado',
			saving: 'Salvando...',
			updateFailed: 'Falha ao atualizar o perfil.',
			updatedSuccess: 'Perfil atualizado com sucesso.',
			emailVerifiedSuccess: 'E-mail verificado com sucesso.'
		},
		password: {
			title: 'Alterar senha',
			description: 'Atualize a senha da sua conta.',
			currentPassword: 'Senha atual',
			currentPasswordPlaceholder: 'Digite a senha atual',
			newPassword: 'Nova senha',
			newPasswordPlaceholder: 'Digite a nova senha',
			confirmNewPassword: 'Confirmar nova senha',
			confirmNewPasswordPlaceholder: 'Confirme a nova senha',
			changing: 'Alterando...',
			submit: 'Alterar senha',
			changeFailed: 'Falha ao alterar a senha.',
			changedSuccess: 'Senha alterada com sucesso.'
		},
		billing: {
			title: 'Faturamento',
			description: 'Escolha um plano que atenda suas necessidades.',
			currentPlanBadge: 'Plano atual',
			mostPopularBadge: 'Mais popular',
			period: '/mês',
			freeDescription: 'Comece com o básico.',
			starterDescription: 'Para usuários mais avançados.',
			proDescription: 'Para quem precisa de tudo.',
			activeChip: 'Ativo'
		},
		plans: {
			free: {
				name: 'Gratuito',
				features: [
					'Até 50 tarefas',
					'20 melhorias de descrição com IA por mês',
					'Gerenciamento básico de tarefas'
				]
			},
			starter: {
				name: 'Starter',
				features: [
					'Até 250 tarefas',
					'200 melhorias de descrição com IA por mês',
					'Suporte prioritário de cobrança',
					'Ideal para equipes em crescimento'
				]
			},
			pro: {
				name: 'Pro',
				features: [
					'Tarefas ilimitadas',
					'1000 melhorias de descrição com IA por mês',
					'Atendimento mais rápido',
					'Ideal para fluxos intensivos com IA',
					'Visibilidade avançada de uso'
				]
			}
		},
		danger: {
			title: 'Zona de perigo',
			description:
				'Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.',
			deleteAccount: 'Excluir conta',
			deleteMyAccount: 'Excluir minha conta',
			deleting: 'Excluindo...',
			deleteFailed: 'Falha ao excluir a conta.'
		},
		deleteModal: {
			title: 'Excluir conta',
			description:
				'Esta ação é permanente e irreversível. Todos os seus projetos, releases e dados serão excluídos permanentemente.',
			confirmLabel: 'Digite %{email} para confirmar',
			confirmPlaceholder: 'Digite seu e-mail'
		},
		emailVerificationModal: {
			successTitle: 'E-mail verificado',
			successDescription: 'Seu e-mail foi verificado com sucesso.',
			title: 'Verifique seu e-mail',
			captchaDescription: 'Vamos enviar um código de 6 dígitos para %{email}',
			otpDescription: 'Digite o código de 6 dígitos enviado para %{email}',
			sending: 'Enviando...',
			sendCode: 'Enviar código de verificação',
			otpLabel: 'Código de verificação',
			otpPlaceholder: '000000',
			verifying: 'Verificando...',
			verifyEmail: 'Verificar e-mail',
			resending: 'Reenviando...',
			resendCode: 'Reenviar código',
			resendAvailableIn: 'Reenvio disponível em %{time}'
		}
	},
	userMenu: {
		currentPlan: 'Plano atual',
		settings: 'Configurações',
		logout: 'Sair'
	}
};
