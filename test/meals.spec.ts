import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:latest')
  })

  afterEach(() => {
    execSync('npm run knex migrate:rollback --all')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)
  })

  it('should be able to get a list of meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    const specificMealResponse = await request(app.server)
      .get(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', cookies!)
      .expect(200)

    expect(specificMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
      }),
    )
  })

  it('should be able to get a metrics of user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Salada',
        description: 'Salada de frango e folhas',
        dateTime: '2024-12-20T18:50:00.000Z',
        onDiet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'X Burguer',
        description: 'Hamburguer',
        dateTime: '2024-12-20T18:55:00.000Z',
        onDiet: false,
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!)
      .expect(200)

    expect(metricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 3,
        mealsOnDiet: 2,
        mealsOffDiet: 1,
        bestStreak: 2,
      }),
    )
  })

  it('should be able to update a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    await request(app.server)
      .put(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', cookies!)
      .send({
        name: 'Pizza',
        description: 'Pizza de calabresa',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: false,
      })
      .expect(200)
  })

  it('should be able to delete a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'johndoe@gmail.com',
      })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        name: 'Panqueca proteica',
        description: 'Panqueca de batata doce',
        dateTime: '2024-12-20T18:45:00.000Z',
        onDiet: true,
      })
      .expect(201)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    await request(app.server)
      .delete(`/meals/${listMealsResponse.body.meals[0].id}`)
      .set('Cookie', cookies!)
      .expect(200)
  })
})
