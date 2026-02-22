import express from 'express'
import serverConfig from './src/config/index.js'
import pingRouter from './src/router/pingRouter.js'
import genricError from './src/middleware/error.middleware.js';
import logger from './src/config/logger.config.js';
import { attachCorrelationIdMiddleware} from './src/middleware/corelation.middleware.js'
const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(attachCorrelationIdMiddleware)
app.use(pingRouter)

app.use(genricError);
app.listen(port, () => {
  logger.info(`Example app listening `)
})
