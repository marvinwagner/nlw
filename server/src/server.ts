import express from 'express'
import cors from 'cors'
import routes from './routes'
import { errors } from 'celebrate'
require('dotenv/config');

const app = express()

app.use(cors())
app.use(express.json());
app.use(routes)

app.use('/assets', express.static('./assets'))

app.use(errors())

app.listen(3333)