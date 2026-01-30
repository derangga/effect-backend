import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import {
  UserNotFound,
  DatabaseError,
  Unauthorized,
  ValidationError,
  SessionError,
} from "./errors";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "./models/auth";
import { UserPublic } from "./models/users";
import { AuthMiddleware } from "./middleware";

export class AuthApi extends HttpApi.make("AuthApi").add(
  HttpApiGroup.make("Auth")
    .add(
      HttpApiEndpoint.post("register", "/api/register")
        .addError(ValidationError)
        .addError(DatabaseError)
        .setPayload(RegisterRequest)
        .addSuccess(RegisterResponse),
    )
    .add(
      HttpApiEndpoint.post("login", "/api/login")
        .addError(ValidationError)
        .addError(SessionError)
        .addError(DatabaseError)
        .setPayload(LoginRequest)
        .addSuccess(LoginResponse),
    )
    .add(
      HttpApiEndpoint.get("getProfile", "/api/me")
        .addError(Unauthorized)
        .addError(UserNotFound)
        .addError(DatabaseError)
        .addSuccess(UserPublic)
        .middleware(AuthMiddleware),
    ),
) {}
