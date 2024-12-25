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
      created_at: string
      session_id?: string
    }
  }
}
