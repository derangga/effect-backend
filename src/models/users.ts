import { Schema } from "effect";
import { Email } from "./email";
import { Password } from "./password";

export const UserId = Schema.Number.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const UserIdFromString = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
);

export class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.NonEmptyString,
  email: Email,
  password: Password,
  created_at: Schema.Date,
  updated_at: Schema.Date,
  deleted_at: Schema.NullOr(Schema.Date).pipe(Schema.optional),
}) {}

export class UserPublic extends Schema.Class<UserPublic>("UserPublic")({
  id: UserId,
  name: Schema.NonEmptyString,
  email: Email,
  created_at: Schema.Date,
  updated_at: Schema.Date,
}) {}
