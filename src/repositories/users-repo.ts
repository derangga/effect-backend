import { Model, SqlClient, SqlSchema } from "@effect/sql";
import { Effect, pipe } from "effect";
import { DatabaseError } from "../errors";
import { User } from "../models/users";
import { Email } from "../models/email";
import { PgLive } from "../postgre";

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const repo = yield* Model.makeRepository(User, {
        tableName: "users",
        spanPrefix: "UsersRepository",
        idColumn: "id",
      });

      const findByEmail = (email: Email) => {
        const findByEmailSchema = SqlSchema.findOne({
          Request: Email,
          Result: User,
          execute: (
            key,
          ) => sql`SELECT id, name, email, password, created_at, updated_at, deleted_at
          FROM users
          WHERE email = ${key} AND deleted_at IS NULL`,
        });

        return pipe(
          findByEmailSchema(email),
          Effect.mapError((e) => {
            console.log(e);
            return new DatabaseError({
              message: "failed to find user by email",
            });
          }),
        );
      };

      return {
        ...repo,
        findByEmail,
      };
    }),
    dependencies: [PgLive],
  },
) {}
