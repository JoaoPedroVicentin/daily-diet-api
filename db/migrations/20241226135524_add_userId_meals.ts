import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('meals')

  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('onDiet').notNullable()
    table.dateTime('dateTime').notNullable()
    table.string('user_id').references('users.id').notNullable()
    table.timestamps(true, true)
  })
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
