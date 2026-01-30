import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { AuthApi } from "./api";
import { Authentication } from "./services/auth";
import { User } from "./services/user";
import { CurrentUser } from "./middleware";
import { ValidationError } from "./errors";
import { Email } from "./models/email";
import { Password } from "./models/password";

export const AuthHandlersLive = HttpApiBuilder.group(
  AuthApi,
  "Auth",
  (handlers) =>
    handlers
      .handle("register", ({ payload }) =>
        Effect.gen(function* () {
          const auth = yield* Authentication;
          const message = yield* auth
            .register(
              payload.name,
              Email.make(payload.email),
              Password.make(payload.password),
            )
            .pipe(
              Effect.mapError(
                (e) => new ValidationError({ message: `${e.message}` }),
              ),
            );
          return { message };
        }),
      )
      .handle("login", ({ payload }) =>
        Effect.gen(function* () {
          const authService = yield* Authentication;
          const token = yield* authService.login(
            Email.make(payload.email),
            Password.make(payload.password),
          );
          return { token };
        }),
      )
      .handle("getProfile", () =>
        Effect.gen(function* () {
          const userService = yield* User;
          const currentUser = yield* CurrentUser;
          const profile = yield* userService.getProfile(currentUser.userId);
          return profile;
        }),
      ),
);
