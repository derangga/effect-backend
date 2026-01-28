import { Config, Layer } from "effect";
import { PgClient, PgMigrator } from "@effect/sql-pg";
import { fileURLToPath } from "node:url";

const PgClientLive = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT"),
  database: Config.string("POSTGRES_DB"),
  username: Config.string("POSTGRES_USER"),
  password: Config.redacted("POSTGRES_PASSWORD"),
});

const MigratorLive = PgMigrator.layer({
  loader: PgMigrator.fromFileSystem(
    fileURLToPath(new URL("./migrations", import.meta.url)),
  ),
  schemaDirectory: "src/migrations",
}).pipe(Layer.provide(PgClientLive));

export const PgLive = MigratorLive.pipe(Layer.provideMerge(PgClientLive));
