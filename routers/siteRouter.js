const router = require('express').Router()
const passport = require('../auth/passport')


const siteUtils = require('../utils/siteUtils')

router.post('/register', async (req, res, next) => {
    const { site, password } = req.body
    if (!site) return res.status(400).send('Site name required')
    if (!password) return res.status(400).send('Password required')
    const result = await siteUtils.register(site, password)
    if (result.error) {
        switch (result.error) {
            case 'SITE_EXISTS': return res.send('Site already exists')
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

router.post('/changePassword', passport.authenticate, async (req, res) => {
    if (!req.body.password) return res.status(400).send('Password required')
    const result = await siteUtils.changePassword(req.user.site, req.body.password)
    if (result.error) res.status(500).send(result.error)
    res.send(JSON.stringify(result))
})

router.delete('/remove', passport.authenticate, async (req, res) => {
    await siteUtils.remove(req.user.site)
    res.send('Site removed: ' + req.user.site)
})

router.get('/exists/:site', async (req, res) => {
    const site = req.params.site
    const result = await siteUtils.exists(site)
    res.send({ [site]: result })
})

module.exports = router