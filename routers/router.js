const router = require('express').Router()
const passport = require('../auth/passport')

router.use(passport.initialize())

router.use('/sites', require('./siteRouter'))

router.get('/regular', (req, res) => {
    res.send('regular endpoint')
})
router.get('/authenticated', passport.authenticate, async (req, res) => {
    res.send('authenticated endpoint')
})

router.get('/', (req, res) => {
    res.send('OK')
})

module.exports = router