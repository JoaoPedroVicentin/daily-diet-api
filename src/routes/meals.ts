import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const meals = await knex('meals').select()
    return { meals }
  })

  app.get('/:id', async (request) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params)
    const meal = await knex('meals').where('id', id).first()
    return {
      meal,
    }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateTime: z.coerce.date(),
      onDiet: z.boolean(),
    })

    const { name, dateTime, description, onDiet } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      name,
      dateTime: dateTime.getTime(),
      description,
      onDiet,
    })

    return reply.status(201).send()
  })
}
