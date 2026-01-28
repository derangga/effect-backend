import { Model } from "@effect/sql";
import { Schema } from "effect";
import { Email } from "./email";
import { Password } from "./password";

export const UserId = Schema.Number.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const UserIdFromString = Schema.NumberFromString.pipe(
  Schema.compose(UserId),
);

export class User extends Model.Class<User>("User")({
  id: Model.Generated(UserId),
  name: Schema.NonEmptyString,
  email: Email,
  password: Password,
  created_at: Model.DateTimeInsert,
  updated_at: Model.DateTimeUpdate,
  deleted_at: Schema.optional(Schema.Date),
}) {}

export class UserPublic extends Model.Class<UserPublic>("UserPublic")({
  id: UserId,
  name: Schema.NonEmptyString,
  email: Email,
  created_at: Model.DateTimeInsert,
  updated_at: Model.DateTimeUpdate,
}) {}

export class UserRegisterPayload extends Model.Class<UserRegisterPayload>(
  "UserRegisterPayload",
)({
  name: Schema.String,
  email: Schema.String,
  password: Schema.String,
}) {}

export const InsertUser = User.json.omit(
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
);
