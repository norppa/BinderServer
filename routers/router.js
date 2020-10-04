const router = require('express').Router()
const { users } = require('../database/level')

router.get('/add', (req, res) => {
    users.put({username: 'foo', salt: 'salt', hash: 'hash'})
    res.send('added')
})
router.get('/get', async (req, res) => {
    res.send(await users.all())
})
router.get('/del', (req, res) => {
    users.del('foo')
    res.send('deleted')
})

router.get('/', (req, res) => {
    res.send('OK')
})

module.exports = router