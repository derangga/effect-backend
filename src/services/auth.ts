import { Effect, Option, pipe, Schema } from "effect";
import { UserRepository } from "../repositories/users-repo";
import { SessionError, ValidationError } from "../errors";
import bcrypt from "bcrypt";
import { Jwt } from "./jwt";
import { Email } from "../models/email";
import { Password } from "../models/password";
import { AppConfig } from "../configs/env";

export class Authentication extends Effect.Service<Authentication>()(
  "services/Authentication",
  {
    effect: Effect.gen(function* () {
      const config = yield* AppConfig;
      const jwtService = yield* Jwt;
      const userRepo = yield* UserRepository;
      const hash = (password: Password) =>
        Effect.tryPromise({
          try: () => bcrypt.hash(password, config.saltRounds),
          catch: () =>
            new ValidationError({ message: "Failed to hash password" }),
        });

      const compare = (password: string, hash: string) =>
        Effect.tryPromise({
          try: () => bcrypt.compare(password, hash),
          catch: () =>
            new ValidationError({ message: "Failed to compare password" }),
        });

      const validateStrength = (password: string) =>
        Effect.gen(function* () {
          const strongPasswordRegex =
            /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
          if (!strongPasswordRegex.test(password)) {
            return yield* new ValidationError({
              message:
                "weak password, use combination uppercase, number, and special character",
            });
          }
        });

      const login = (email: Email, password: Password) =>
        Effect.gen(function* () {
          const result = yield* userRepo.findByEmail(email);
          const user = Option.getOrNull(result);

          if (!user) {
            return yield* new ValidationError({
              message: "wrong email or password",
            });
          }

          const isValid = yield* compare(password, user.password);

          if (!isValid) {
            return yield* new ValidationError({
              message: "wrong email or password",
            });
          }

          const token = yield* pipe(
            jwtService.signJwt({
              userId: user.id,
            }),
            Effect.mapError(
              () =>
                new SessionError({
                  message: "session generation failed, please try again later",
                }),
            ),
          );

          return token;
        });

      const register = (name: string, email: Email, password: Password) =>
        Effect.gen(function* () {
          yield* validateStrength(password);

          const result = yield* userRepo.findByEmail(email);
          const user = Option.getOrNull(result);
          if (user) {
            return yield* new ValidationError({
              message: "you cannot register, please try again later",
            });
          }

          const hashedPassword = yield* hash(password);
          const passwordBrand = yield* pipe(
            Schema.decode(Password)(hashedPassword),
            Effect.mapError(
              () =>
                new ValidationError({ message: "failed transform password" }),
            ),
          );

          yield* userRepo.insert({ name, email, password: passwordBrand });

          return "register successfully";
        });
      return {
        login,
        register,
      };
    }),
    dependencies: [AppConfig.Default, Jwt.Default, UserRepository.Default],
  },
) {}
