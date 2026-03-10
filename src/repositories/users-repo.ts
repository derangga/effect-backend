import { Effect, Option } from "effect";
import { eq, and, isNull } from "drizzle-orm";
import { DrizzleDB } from "../db/index";
import { users } from "../db/schema";
import { DatabaseError } from "../errors";
import { User, UserId } from "../models/users";
import { Email } from "../models/email";
import { Password } from "../models/password";
import { PgLive } from "../postgre";

const mapRow = (row: typeof users.$inferSelect): User =>
  User.make({
    id: UserId.make(row.id),
    name: row.name as User["name"],
    email: row.email as Email,
    password: row.password as Password,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at ?? undefined,
  });

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      const db = yield* DrizzleDB;

      const findById = (id: UserId) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select()
            .from(users)
            .where(and(eq(users.id, id), isNull(users.deleted_at)))
            .limit(1);
          return Option.fromNullable(rows[0] ?? null).pipe(Option.map(mapRow));
        }).pipe(
          Effect.mapError(
            () => new DatabaseError({ message: "failed to find user" }),
          ),
        );

      const findByEmail = (email: Email) =>
        Effect.gen(function* () {
          const rows = yield* db
            .select()
            .from(users)
            .where(and(eq(users.email, email), isNull(users.deleted_at)))
            .limit(1);
          return Option.fromNullable(rows[0] ?? null).pipe(Option.map(mapRow));
        }).pipe(
          Effect.mapError(
            () =>
              new DatabaseError({ message: "failed to find user by email" }),
          ),
        );

      const insert = (data: {
        name: string;
        email: Email;
        password: Password;
      }) =>
        db
          .insert(users)
          .values(data)
          .pipe(
            Effect.mapError(
              () => new DatabaseError({ message: "failed to insert user" }),
            ),
          );

      return { findById, findByEmail, insert };
    }),
    dependencies: [PgLive],
  },
) {}
