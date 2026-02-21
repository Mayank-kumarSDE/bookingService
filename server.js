import express from 'express'
import serverConfig from './src/config/index.js'
import pingRouter from './src/router/pingRouter.js'
const port = process.env.PORT;
const app = express();
app.use(express.json());


app.use(pingRouter)
app.listen(port, () => {
  console.log(`Example app listening `)
})
