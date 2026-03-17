import knex, { Knex } from 'knex';
import { env } from '../config/env';

export const ssoDb: Knex = knex({
  client: 'mysql2',
  connection: {
    host: env.ssoDb.host,
    user: env.ssoDb.user,
    password: env.ssoDb.password,
    database: env.ssoDb.name,
    port: 3306,
  },
  pool: {
    min: 2,
    max: 10,
  },
});