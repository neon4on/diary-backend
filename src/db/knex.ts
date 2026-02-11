import knex, { Knex } from 'knex';
import { env } from '../config/env';

export const db: Knex = knex({
  client: 'mysql2',
  connection: {
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    port: 3306,
  },
  pool: {
    min: 2,
    max: 10,
  },
});