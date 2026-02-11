import knex, { Knex } from 'knex';
import { env } from '../config/env';

export const db: Knex = knex({
  client: 'pg',
  connection: {
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  },
  pool: {
    min: 2,
    max: 10,
  },
  searchPath: ['public'],
});