const level = require('level')
const path = require('path')

const database = {
    'users': level(path.join(__dirname, './db/UsersDB'), { valueEncoding: 'json' })
}

const getUser = async (username) => {
    try {
        return await database.users.get(username)
    } catch (error) {
        if (error.notFound) {
            return null
        }
    }
}

const putUser = async (userInfo) => {
    const { username, salt, hash } = userInfo
    if (!username || !salt || !hash) {
        console.log('Can not store user with missing information')
        return false
    }

    await database.users.put(username, { username, salt, hash })
    return true
}

const delUser = async (username) => {
    await database.users.del(username)
    return true
}

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const values = []
        database.users.createKeyStream()
            .on('data', (data) => {
                values.push(data)
            })
            .on('close', () => resolve(values))
            .on('error', (error) => {
                console.log('error', error)
                reject(error)
            })
    })
}

module.exports = {
    'users': {
        get: getUser,
        put: putUser,
        del: delUser,
        all: getAllUsers
    }
}