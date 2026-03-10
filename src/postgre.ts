import { Config, Effect, Layer } from "effect";
import { PgClient } from "@effect/sql-pg";
import { migrate } from "drizzle-orm/effect-postgres/migrator";
import * as path from "node:path";
import { DrizzleDB, DrizzleDBLive } from "./db/index";

const PgClientLive = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT"),
  database: Config.string("POSTGRES_DB"),
  username: Config.string("POSTGRES_USER"),
  password: Config.redacted("POSTGRES_PASSWORD"),
});

// DrizzleDB layer fully self-contained (PgClientLive bundled)
const DrizzleLayer = DrizzleDBLive.pipe(Layer.provide(PgClientLive));

// Runs drizzle SQL migrations on startup, requires DrizzleDB in context
const DrizzleMigratorLive = Layer.effectDiscard(
  Effect.gen(function* () {
    const db = yield* DrizzleDB;
    yield* migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
  }),
);

// PgLive: runs migrations + provides DrizzleDB — replaces old @effect/sql PgLive
export const PgLive = DrizzleMigratorLive.pipe(
  Layer.provideMerge(DrizzleLayer),
);
