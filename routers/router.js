const router = require('express').Router()
const passport = require('../auth/passport')
const fileUtils = require('../utils/fileUtils')

router.use(passport.initialize())

router.use('/sites', require('./siteRouter'))
router.use('/admin', passport.authenticate, require('./adminRouter'))

router.post('/files', passport.authenticate, async (req, res) => {
    // console.log('updating site', req.body)
    const result = await fileUtils.persist(req.body, req.user.site)
    if (result.errors) {
        return res.status(400).send({ errors: result.errors})
    }
    res.send(result)
})

router.get('/files', passport.authenticate, async (req, res) => {
    const result = await fileUtils.getFiles(req.user.site)
    if (result.error) {
        return res.status(400).send({ errors: result.error})
    }
    res.send(result)
})

router.get('/files/:id', passport.authenticate, async (req, res) => {
    const result = await fileUtils.getFileContents(req.params.id, req.user.site)
    if (result.error) {
        return res.status(400).send({ errors: result.error})
    }
    res.send(result)
})

router.get('/', (req, res) => {
    res.send('Binder Server')
})

module.exports = router