require('dotenv').config()
const mysql = require('mysql2/promise')

const dbConfig = {
    connectionLimit : 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

const pool = mysql.createPool(dbConfig)

module.exports = pool