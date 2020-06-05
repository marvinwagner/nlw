import { Request, Response } from 'express'
import knex from '../database/connection'

export default class PointsController {

  async index(req: Request, res: Response) {
    const items = await knex('items').select('*')

    const serializedItems = items.map(item => {
      return { 
        id: item.id,
        title: item.title,
        image_url: `${process.env.API_URL}/assets/${item.image}`
      }
    })

    return res.json(serializedItems)
  }

}