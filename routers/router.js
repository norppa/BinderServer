const router = require('express').Router()
const passport = require('passport')

const { authenticate, isAdmin } = require('../auth/authUtils')

require('../auth/passport')(passport)
router.use(passport.initialize())

router.use('/users', require('./userRouter'))

router.get('/regular', (req, res) => {
    res.send('regular endpoint')
})
router.get('/authenticated', authenticate, async (req, res) => {
    res.send('authenticated endpoint')
})
router.get('/admin', authenticate, isAdmin, (req, res) => {
    res.send('admin endpoint')
})

router.get('/', (req, res) => {
    res.send('OK')
})

module.exports = router