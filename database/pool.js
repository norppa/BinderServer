require('dotenv').config()
const mysql = require('mysql2/promise')

const dbConfig = {
    connectionLimit : 10,
    host: process.env.BINDER_DB_HOST,
    port: process.env.BINDER_DB_PORT,
    user: process.env.BINDER_DB_USERNAME,
    password: process.env.BINDER_DB_PASSWORD,
    database: process.env.BINDER_DB_DATABASE,
}

const pool = mysql.createPool(dbConfig)

module.exports = pool