import type { Context } from "hono";
import type * as v from "valibot";

type Variables = {
	userId: string;
};

type Scm = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

type Validator<P extends Scm, Q extends Scm, J extends Scm, F extends Scm> = {
	param?: P;
	query?: Q;
	json?: J;
	form?: F;
};

type In<V extends Validator<Scm, Scm, Scm, Scm>> = {
	param: V["param"] extends Scm ? v.InferInput<V["param"]> : never;
	query: V["query"] extends Scm ? v.InferInput<V["query"]> : never;
	json: V["json"] extends Scm ? v.InferInput<V["json"]> : never;
	form: V["form"] extends Scm ? v.InferInput<V["form"]> : never;
};

type Out<V extends Validator<Scm, Scm, Scm, Scm>> = {
	param: V["param"] extends Scm ? v.InferOutput<V["param"]> : never;
	query: V["query"] extends Scm ? v.InferOutput<V["query"]> : never;
	json: V["json"] extends Scm ? v.InferOutput<V["json"]> : never;
	form: V["form"] extends Scm ? v.InferOutput<V["form"]> : never;
};

type AppBindings = Env;
export type AppEnv = { Variables: Variables; Bindings: AppBindings };
export type AppContext<
	P extends string = string,
	V extends Validator<Scm, Scm, Scm, Scm> = object,
> = Context<AppEnv, `${P}`, { in: In<V>; out: Out<V> }>;
