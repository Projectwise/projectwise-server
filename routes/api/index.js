const router = require('express').Router()

router.use('/', require('./auth'))
router.use('/', require('./users'))
router.use('/projects', require('./projects'))
router.use('/categories', require('./categories'))

module.exports = router
