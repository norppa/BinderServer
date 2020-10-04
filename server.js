require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(morgan('tiny'))
app.use(express.json())

app.use('/binder', require('./routers/router'))

app.listen(process.env.PORT)