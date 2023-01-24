const express = require('express')
const routers = require('./routers/routes')

const app = express()

app.use(express.json())
app.use(routers)

app.listen(3000)