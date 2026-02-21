import express from 'express'
import { pingController } from '../controller/pingController.js'
import pingSchema from '../validators/pingSchema.js'
import { validateRequestBody } from '../validators/index.js'
const pingRouter = express.Router()
pingRouter.post('/ping', validateRequestBody(pingSchema),pingController);
export default pingRouter