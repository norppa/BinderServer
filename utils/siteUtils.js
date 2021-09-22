const pool = require('../database/pool')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const { PRIVATE_KEY } = require('../auth/keys/keys')

const iterations = 10000
const keylen = 64
const digest = 'sha512'

const exists = async (site) => {
    const [rows, fields] = await pool.query('SELECT * FROM binder_sites WHERE name = ?', [site])
    return rows.length === 1
}

const generateToken = (site) => jwt.sign({ site }, PRIVATE_KEY, { algorithm: 'PS512' })

const register = async (site, password) => {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')
    try {
        await pool.query('INSERT INTO binder_sites (name, hash, salt) VALUES (?,?,?)', [site, hash, salt])
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: 'SITE_EXISTS' }
        } else {
            return { error }
        }
    }

    return { token: generateToken(site) }
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

    return { token: generateToken(site) }
}

const changePassword = async (site, newPassword) => {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(newPassword, salt, iterations, keylen, digest).toString('hex')
    try {
        await pool.query('UPDATE binder_sites SET hash = ?, salt = ? WHERE name = ?', [hash, salt, site])
    } catch (error) {
        return { error }
    }

    return { token: generateToken(site) }

}

const remove = async (site) => {
    console.log('remove', site)
    const connection = await pool.getConnection()
    try {
        await connection.query('START TRANSACTION')
        await connection.query('DELETE FROM binder_files WHERE owner = ?', [site])
        await connection.query('DELETE FROM binder_sites WHERE name = ?', [site])
        await connection.query('COMMIT')
        return {}
    } catch (error) {
        connection.query('ROLLBACK')
        console.error('ROLLBACK', error)
        return { error }
    } finally {
        connection.release()
        connection.destroy()
    }
}

module.exports = { exists, register, login, remove, changePassword }