require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/binder', require('./routers/router'))

app.listen(process.env.PORT, () => console.log('BinderServer running on port ' + process.env.PORT))