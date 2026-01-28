import { Effect, Redacted, Schema } from "effect";
import jwt from "jsonwebtoken";
import { TokenError } from "../errors";
import { AppConfig } from "../configs/env";

export class JwtPayload extends Schema.Class<JwtPayload>("services/JwtPayload")(
  {
    userId: Schema.Number,
  },
) {}

const decodeJwt = Schema.decodeUnknown(JwtPayload);

export class Jwt extends Effect.Service<Jwt>()("Jwt", {
  effect: Effect.gen(function* () {
    const config = yield* AppConfig;

    const signJwt = (payload: JwtPayload) =>
      Effect.try({
        try: () =>
          jwt.sign(payload, Redacted.value(config.jwtSecret), {
            expiresIn: "24h",
          }),
        catch: () => new TokenError({ message: "Failed to sign token" }),
      });

    const verifyJwt = (token: string) =>
      Effect.gen(function* () {
        const decoded = yield* Effect.try({
          try: () => jwt.verify(token, Redacted.value(config.jwtSecret)),
          catch: () => new TokenError({ message: "Invalid or expired token" }),
        });

        return yield* decodeJwt(decoded).pipe(
          Effect.mapError(
            () => new TokenError({ message: "Invalid token payload" }),
          ),
        );
      });
    return {
      signJwt,
      verifyJwt,
    };
  }),
  dependencies: [AppConfig.Default],
}) {}
