import * as PgDrizzle from 'drizzle-orm/effect-postgres';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as schema from './schema';

const dbEffect = PgDrizzle.makeWithDefaults({ schema });

export class DrizzleDB extends Context.Tag('DrizzleDB')<
  DrizzleDB,
  Effect.Effect.Success<typeof dbEffect>
>() {}

export const DrizzleDBLive = Layer.effect(DrizzleDB, dbEffect);
