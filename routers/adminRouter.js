const router = require('express').Router()
const fileUtils = require('../utils/fileUtils')

router.get('/all', async (req, res) => {
    res.send(await fileUtils.getAllFiles())
})

router.get('/deleteall', (req, res) => res.send(fileUtils.deleteAllFiles()))

module.exports = router