import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { CreateBillingCheckout } from "../../app/usecases/CreateBillingCheckout";
import { CreateTodo } from "../../app/usecases/CreateTodo";
import { DeleteAccount } from "../../app/usecases/DeleteAccount";
import { DeleteTodo } from "../../app/usecases/DeleteTodo";
import { EnhanceTodoDescription } from "../../app/usecases/EnhanceTodoDescription";
import { GetBillingPortal } from "../../app/usecases/GetBillingPortal";
import { GetCurrentPlan } from "../../app/usecases/GetCurrentPlan";
import { GetTodo } from "../../app/usecases/GetTodo";
import { ListTodos } from "../../app/usecases/ListTodos";
import { UpdateTodo } from "../../app/usecases/UpdateTodo";
import { auth } from "../../infra/better-auth/auth";
import { getConnection } from "../../infra/drizzle/connection";
import { getAIProvider } from "../../infra/factories/AIProviderFactory";
import { getAICallLogDAO, getTodoDAO } from "../../infra/factories/DAOFactory";
import { getEntitlementProvider } from "../../infra/factories/EntitlementProviderFactory";
import type { AppEnv } from "./AppContext";
import { BillingCheckoutController } from "./controllers/BillingCheckout";
import { BillingPortalController } from "./controllers/BillingPortal";
import { CreateTodoController } from "./controllers/CreateTodo";
import { DeleteAccountController } from "./controllers/DeleteAccount";
import { DeleteTodoController } from "./controllers/DeleteTodo";
import { EnhanceTodoDescriptionController } from "./controllers/EnhanceTodoDescription";
import { GetCurrentPlanController } from "./controllers/GetCurrentPlan";
import { GetTodoController } from "./controllers/GetTodo";
import { ListTodosController } from "./controllers/ListTodos";
import { UpdateTodoController } from "./controllers/UpdateTodo";

export const apiRouter = new Hono<AppEnv>()
	.post(
		BillingCheckoutController.path,
		sValidator("json", BillingCheckoutController.schema.json),
		(c) => {
			const useCase = new CreateBillingCheckout(getEntitlementProvider(c.env));
			return new BillingCheckoutController(useCase).handle(c);
		},
	)
	.get(BillingPortalController.path, (c) => {
		const useCase = new GetBillingPortal(getEntitlementProvider(c.env));
		return new BillingPortalController(useCase).handle(c);
	})
	.get(GetCurrentPlanController.path, (c) => {
		const useCase = new GetCurrentPlan(getEntitlementProvider(c.env));
		return new GetCurrentPlanController(useCase).handle(c);
	})
	.delete(DeleteAccountController.path, (c) => {
		const authProvider = {
			removeUser: async (userId: string) => {
				await auth(c.env).api.removeUser({ body: { userId } });
			},
		};
		const useCase = new DeleteAccount(authProvider);
		return new DeleteAccountController(useCase).handle(c);
	})
	.get(
		ListTodosController.path,
		sValidator("query", ListTodosController.schema.query),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new ListTodos(getTodoDAO(db));
			return new ListTodosController(useCase).handle(c);
		},
	)
	.post(
		CreateTodoController.path,
		sValidator("json", CreateTodoController.schema.json),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new CreateTodo(getTodoDAO(db));
			return new CreateTodoController(useCase).handle(c);
		},
	)
	.get(
		GetTodoController.path,
		sValidator("param", GetTodoController.schema.param),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new GetTodo(getTodoDAO(db));
			return new GetTodoController(useCase).handle(c);
		},
	)
	.patch(
		UpdateTodoController.path,
		sValidator("param", UpdateTodoController.schema.param),
		sValidator("json", UpdateTodoController.schema.json),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new UpdateTodo(getTodoDAO(db));
			return new UpdateTodoController(useCase).handle(c);
		},
	)
	.delete(
		DeleteTodoController.path,
		sValidator("param", DeleteTodoController.schema.param),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new DeleteTodo(getTodoDAO(db));
			return new DeleteTodoController(useCase).handle(c);
		},
	)
	.post(
		EnhanceTodoDescriptionController.path,
		sValidator("param", EnhanceTodoDescriptionController.schema.param),
		(c) => {
			const db = getConnection(c.env);
			const useCase = new EnhanceTodoDescription(
				getTodoDAO(db),
				getAIProvider(c.env),
				getEntitlementProvider(c.env),
				getAICallLogDAO(db),
			);
			return new EnhanceTodoDescriptionController(useCase).handle(c);
		},
	);
