import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { Layer } from "effect";
import { NodeHttpServer } from "@effect/platform-node";
import { createServer } from "http";
import { AuthApi } from "./api";
import { AuthHandlersLive } from "./handlers";
import { AuthMiddlewareLive } from "./middleware";
import { Authentication } from "./services/auth";
import { Jwt } from "./services/jwt";
import { User } from "./services/user";

const ApiLive = HttpApiBuilder.api(AuthApi).pipe(
  Layer.provide(AuthHandlersLive),
  Layer.provide(AuthMiddlewareLive),
  Layer.provide(Authentication.Default),
  Layer.provide(Jwt.Default),
  Layer.provide(User.Default),
);

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);
