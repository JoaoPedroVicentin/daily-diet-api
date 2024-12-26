import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (request, reply) => {
    const meals = await knex('meals')
      .where({ user_id: request.user?.id })
      .orderBy('dateTime', 'desc')

    return reply.send({ meals })
  })

  app.get('/:id', async (request, reply) => {
    const getMealsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealsParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    if (!meal) {
      return reply.status(404).send({ message: 'Refeição não encontrada' })
    }

    if (meal.user_id !== request.user?.id) {
      return reply.status(401).send({ error: 'Não autorizado' })
    }

    return reply.send({ meal })
  })

  app.get('/metrics', async (request, reply) => {
    const meals = await knex('meals')
      .where({ user_id: request.user?.id })
      .orderBy('dateTime', 'desc')

    const bestStreak = meals.reduce(
      (acc, meal) => {
        if (meal.onDiet) {
          acc.currentStreak += 1
          acc.bestStreak = Math.max(acc.bestStreak, acc.currentStreak)
        } else {
          acc.currentStreak = 0
        }
        return acc
      },
      { bestStreak: 0, currentStreak: 0 },
    ).bestStreak

    return reply.send({
      totalMeals: meals.length,
      mealsOnDiet: meals.filter((meal) => meal.onDiet).length,
      mealsOffDiet: meals.filter((meal) => !meal.onDiet).length,
      bestStreak,
    })
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
      user_id: request.user?.id,
    })

    return reply
      .status(201)
      .send({ message: 'Refeição cadastrada com sucesso' })
  })

  app.put('/:id', async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      dateTime: z.coerce.date().optional(),
      onDiet: z.boolean().optional(),
    })

    const { id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(request.params)

    const { name, description, dateTime, onDiet } = updateMealBodySchema.parse(
      request.body,
    )

    const existingMeal = await knex('meals').where('id', id).first()

    if (!existingMeal) {
      return reply.status(404).send({ message: 'Refeição não encontrada.' })
    }

    if (existingMeal.user_id !== request.user?.id) {
      return reply.status(401).send({ error: 'Não autorizado' })
    }

    await knex('meals')
      .where('id', id)
      .update({
        name: name ?? existingMeal.name,
        description: description ?? existingMeal.description,
        dateTime: dateTime?.getTime() ?? existingMeal.dateTime,
        onDiet: onDiet ?? existingMeal.onDiet,
        updated_at: knex.fn.now(),
      })

    return reply
      .status(200)
      .send({ message: 'Refeição atualizada com sucesso.' })
  })

  app.delete('/:id', async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    if (!meal) {
      return reply.status(404).send({ message: 'Refeição não encontrada' })
    }

    if (meal.user_id !== request.user?.id) {
      return reply.status(401).send({ error: 'Não autorizado' })
    }

    await knex('meals').where('id', id).delete()

    return reply.status(200).send({ message: 'Refeição deletada com sucesso' })
  })
}
