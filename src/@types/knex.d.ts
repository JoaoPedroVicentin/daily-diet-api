// eslint-disable-next-line
import { Knex } from 'knex'
// ou faça apenas:
// import 'knex'
declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      dateTime: number
      onDiet: boolean
      user_id: string
      created_at: string
      updated_at: string
    }
  }
}
