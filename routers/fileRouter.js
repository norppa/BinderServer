const router = require('express').Router()

const fileUtils = require('../utils/fileUtils')

router.post('/', async (req, res) => {
    const result = await fileUtils.persist(req.body, req.user.site)
    if (result.error) {
        return res.status(400).send({ errors: result.error})
    }
    res.send(result)
})


// ADMIN ENDPOINTS FOR TESTING ONLY

router.get('/all', async (req, res) => {
    res.send(await fileUtils.getAllFiles())
})

router.get('/deleteall', (req, res) => res.send(fileUtils.deleteAllFiles()))

///

module.exports = router