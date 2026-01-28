import { HttpApiSchema } from "@effect/platform";
import { Data, Schema } from "effect";

export class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 422 }),
) {}

export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  "UserNotFound",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 404 }),
) {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 403 }),
) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "DatabaseError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({ status: 500 }),
) {}

export class TokenError extends Data.TaggedError("TokenError")<{
  message: string;
}> {}
