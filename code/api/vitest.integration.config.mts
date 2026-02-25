import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig(async () => {
	return {
		test: {
			include: ["**/test/integration/**/*.ts"],
			setupFiles: ["./test/setup/db-setup.ts"],
			env: {
				NODE_ENV: "test",
			},
			poolOptions: {
				workers: {
					isolatedStorage: false,
					singleWorker: true,
					wrangler: {
						configPath: "./wrangler.jsonc",
					},
					miniflare: {
						bindings: {
							ENVIRONMENT: "test",
							DATABASE_URL:
								"postgresql://postgres:postgres@localhost:5432/template-test",
						},
					},
				},
			},
		},
	};
});
