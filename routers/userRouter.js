const router = require('express').Router()
const { users } = require('../database/level')
const { signToken, generateSaltAndHash, passwordMatchesHash, authenticate, isAdmin } = require('../auth/authUtils')

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username) {
        return res.status(400).json({ error: 'missing username' })
    }
    if (!password) {
        return res.status(400).json({ error: 'missing password' })
    }
    const user = await users.get(username)
    if (!user) {
        return res.status(401).json({ error: 'Username not found' })
    }

    const { hash, salt, isAdmin } = user
    if (!passwordMatchesHash(password, salt, hash)) {
        return res.status(401).json({ error: 'Incorrect password' })
    }

    const token = signToken({ username, isAdmin, iat: Date.now() })
    res.send(JSON.stringify({ token }))
})

router.post('/register', async (req, res) => {
    const { username, password } = req.body
    if (!username) {
        return res.status(400).json({ error: 'missing username' })
    }
    if (!password) {
        return res.status(400).json({ error: 'missing password' })
    }
    const userInfo = await users.get(username)
    if (userInfo) {
        return res.send({ error: 'Username taken' })
    }

    const { salt, hash } = generateSaltAndHash(password)
    await users.put({ username, hash, salt })

    const token = signToken({ username, iat: Date.now() })
    res.send(JSON.stringify({ token }))
})

router.get('/all', authenticate, isAdmin, async (req, res) => {
    const allUsers = await users.all()
    res.send(allUsers)
})

module.exports = router