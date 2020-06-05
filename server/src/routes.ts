import express from 'express'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'

import ItemsController from './controllers/itemsController'
import PointsController from './controllers/pointsController'

const itemsController = new ItemsController()
const pointsController = new PointsController()

const upload = multer(multerConfig)
const routes = express.Router()

routes.get('/', (req, res) => {
  return res.json({message: 'Running...'})
}) 

routes.get('/items', itemsController.index) 
routes.get('/points', pointsController.index)
routes.get('/points/:id', 
  celebrate({
    params: Joi.object().keys({
      id: Joi.number().required()
    })
  }),
  pointsController.show)

routes.post('/points', 
  upload.single('image'), 
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, { 
    abortEarly: false
  }), 
  pointsController.create)

export default routes