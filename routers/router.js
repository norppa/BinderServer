const router = require('express').Router()
const passport = require('../auth/passport')

router.use(passport.initialize())

router.use('/sites', require('./siteRouter'))
router.use('/files', passport.authenticate, require('./fileRouter'))

router.get('/', (req, res) => {
    res.send('Binder Server')
})

module.exports = router