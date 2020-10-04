const pool = require('../database/pool')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const { PRIVATE_KEY } = require('../auth/keys/keys')

const iterations = 10000
const keylen = 64
const digest = 'sha512'

const register = async (site, password) => {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
    try {
        const result = await pool.query('INSERT INTO binder_sites (name, hash, salt) VALUES (?,?,?)', [site, hash, salt])
    } catch (error) {
        if (error.code === 'ERR_DUP_ENTRY') {
            return { error: 'USERNAME_EXISTS' }
        } else {
            return { error }
        }
    }

    return { token: jwt.sign({ site }, PRIVATE_KEY, { expiresIn: '1d', algorithm: 'PS512' }) }
}

const login = async (site, password) => {
    let siteInfo
    try {
        const [rows, fields] = await pool.query('SELECT * FROM binder_sites WHERE name = ?', [site])
        if (rows.length === 0) {
            return { error: 'INCORRECT_PASSWORD' }
        }
        siteInfo = rows[0]
    } catch (error) {
        return { error }
    }

    const { name, hash, salt } = siteInfo
    const hashedPassword = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
    if (hash !== hashedPassword) {
        return { error: 'INCORRECT_PASSWORD' }
    }

    return { token: jwt.sign({ site }, PRIVATE_KEY, { expiresIn: '1d', algorithm: 'PS512' }) }
}

module.exports = { register, login }