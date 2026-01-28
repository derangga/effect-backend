import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  yield* sql.onDialectOrElse({
    pg: () =>
      sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL
        )
      `,
    orElse: () =>
      sql`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL
        )
      `,
  });

  yield* sql.onDialectOrElse({
    pg: () =>
      sql`
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users(email) 
        WHERE deleted_at IS NULL
      `,
    orElse: () =>
      sql`
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users(email)
      `,
  });
});
