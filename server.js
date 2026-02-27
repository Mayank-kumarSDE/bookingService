import express from 'express'
import {serverConfig} from './src/config/index.js'
import pingRouter from './src/router/pingRouter.js'
import genricError from './src/middleware/error.middleware.js';
import logger from './src/config/logger.config.js';
import { attachCorrelationIdMiddleware} from './src/middleware/corelation.middleware.js'
import  sequelize from './src/db/models/index.js'; 
import Router from './src/router/index.js';
const app = express();
app.use(express.json());
app.use(attachCorrelationIdMiddleware)
app.use(pingRouter)
app.use(Router);
app.use(genricError);
app.listen(serverConfig.port, async() => {
  logger.info(`Example app listening on localhost ${serverConfig.port} `)
  await sequelize.authenticate;
  logger.info('Connection has been established successfully.');
})
