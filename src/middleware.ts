import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform";
import { Effect, Layer, Redacted, Schema } from "effect";
import { Unauthorized } from "./errors";
import { Jwt } from "./services/jwt";
import { UserId } from "./models/users";

export class AuthenticatedUser extends Schema.Class<AuthenticatedUser>(
  "AuthenticatedUser",
)({
  userId: UserId,
}) {}

export class CurrentUser extends Effect.Tag("CurrentUser")<
  CurrentUser,
  AuthenticatedUser
>() {}

export class AuthMiddleware extends HttpApiMiddleware.Tag<AuthMiddleware>()(
  "AuthMiddleware",
  {
    failure: Unauthorized,
    provides: CurrentUser,
    security: {
      bearer: HttpApiSecurity.bearer,
    },
  },
) {}

export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const jwtService = yield* Jwt;

    return {
      bearer: (token) =>
        Effect.gen(function* () {
          const payload = yield* jwtService
            .verifyJwt(Redacted.value(token))
            .pipe(
              Effect.mapError(
                (error) => new Unauthorized({ message: error.message }),
              ),
            );
          return new AuthenticatedUser({
            userId: UserId.make(payload.userId),
          });
        }),
    };
  }),
);
