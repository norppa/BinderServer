const router = require('express').Router()

const siteUtils = require('../utils/siteUtils')

router.post('/register', async (req, res, next) => {
    const { site, password } = req.body
    if (!site) return res.status(400).send('Site name required')
    if (!password) return res.status(400).send('Password required')
    const result = await siteUtils.register(site, password)
    if (result.error) {
        switch (result.error) {
            case 'USERNAME_EXISTS': return res.send('Username already exists')
            default: res.status(500).send(result.error)
        }
    }

    res.send(JSON.stringify(result))
})

router.post('/login', async (req, res) => {
    const { site, password } = req.body
    if (!site) return res.status(400).send('Site name required')
    if (!password) return res.status(400).send('Password required')
    const result = await siteUtils.login(site, password)
    if (result.error) {
        switch (result.error) {
            case 'INCORRECT_PASSWORD': return res.status(401).send('Username and password do not match.')
            default: res.status(500).send(result.error)
        }
    }

    res.send(JSON.stringify(result))
})

module.exports = router