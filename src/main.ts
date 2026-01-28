import { Effect, Layer, Logger, LogLevel } from "effect";
import { HttpLive } from "./http";
import { NodeRuntime } from "@effect/platform-node";
import { AppConfig } from "./configs/env";

const AppLive = Layer.mergeAll(AppConfig.Default).pipe(
  Layer.provideMerge(HttpLive),
);
const program = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.log(`Server started on port ${config.port}`);
  return yield* Effect.never;
}).pipe(Effect.provide(AppLive), Logger.withMinimumLogLevel(LogLevel.Info));

program.pipe(NodeRuntime.runMain);
