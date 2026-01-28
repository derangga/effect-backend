import { Schema } from "effect";

export class RegisterRequest extends Schema.Class<RegisterRequest>(
  "RegisterRequest",
)({
  name: Schema.String,
  email: Schema.String,
  password: Schema.String,
}) {}

export class RegisterResponse extends Schema.Class<RegisterResponse>(
  "RegisterResponse",
)({
  message: Schema.String,
}) {}

export class LoginRequest extends Schema.Class<LoginRequest>("LoginRequest")({
  email: Schema.String,
  password: Schema.String,
}) {}

export class LoginResponse extends Schema.Class<LoginResponse>("LoginResponse")(
  {
    token: Schema.String,
  },
) {}
