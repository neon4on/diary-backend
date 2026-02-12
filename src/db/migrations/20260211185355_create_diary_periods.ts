import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diary_periods', (table) => {
    table.increments('id').primary();

    table.string('name', 100).notNullable();

    table.date('date_from').notNullable();
    table.date('date_to').notNullable();

    table.boolean('is_locked')
      .notNullable()
      .defaultTo(false);

    table.timestamp('locked_at').nullable();
    table.integer('locked_by').nullable();

    table.timestamp('created_at')
      .defaultTo(knex.fn.now());

    table.timestamp('updated_at')
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('diary_periods');
}