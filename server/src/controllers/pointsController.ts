import { Request, Response } from 'express'
import knex from '../database/connection'

export default class PointsController {
  
  async index(req: Request, res: Response) {
    const { city, uf, items } = req.query
    const parsedItems = String(items).split(',').map(item => Number(item.trim()))

    const points = await knex('points')
      .join('pointitem', 'points.id', '=', 'pointitem.point_id')
      .whereIn('pointitem.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .select('points.*')
      .distinct()

    if (!points)
      return res.json({ message: 'No points found in this city' })

    const serializedPoints = points.map(point => {
      return { 
        ...point,
        image_url: `${process.env.API_URL}/assets/points/${point.image}`
      }
    })

    return res.json(serializedPoints)
  }

  async show(req: Request, res: Response) {
    const id = req.params.id

    const point = await knex('points').where('id', id).first()
    if (!point)
      return res.json({ message: 'Point not found' })

    const items = await knex('items').join('pointitem', 'items.id', '=', 'pointitem.item_id').where('pointitem.point_id', id).select('items.title')

    const serializedPoint = {
      ...point,
      items,
      image_url: `${process.env.API_URL}/assets/points/${point.image}`
    }

    return res.json(serializedPoint)
  }

  async create(req: Request, res: Response) {
    const { 
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body
  
    const point = { name, email, whatsapp, latitude, longitude, city, uf, image: req.file.filename };
    const trx = await knex.transaction();
    console.log(point)
  
    const insertedIds = await trx('points').insert(point)
    const point_id = insertedIds[0]
  
    const pointitems = items.split(',').map((item:string) => Number(item.trim())).map((item_id: number) => {
      return {
        item_id,
        point_id
      }
    })
    await trx('pointitem').insert(pointitems)
  
    await trx.commit()

    return res.json({ 
      ...point,
      id: point_id 
     })
  }
}