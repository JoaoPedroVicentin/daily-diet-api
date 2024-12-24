import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/meals', async () => {
  const meals = await knex('meals').select('*')

  return meals
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Servidor rodando')
  })
