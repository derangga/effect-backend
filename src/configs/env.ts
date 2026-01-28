import { Effect, Config } from "effect";

export class AppConfig extends Effect.Service<AppConfig>()("AppConfig", {
  effect: Effect.gen(function* () {
    const jwtSecret = yield* Config.redacted("JWT_SECRET");
    const saltRounds = yield* Config.integer("PASSWORD_SALT_ROUNDS").pipe(
      Config.withDefault(12),
    );
    const port = yield* Config.integer("PORT").pipe(Config.withDefault(3000));

    return { jwtSecret, saltRounds, port };
  }).pipe(Effect.orDie),
}) {}
