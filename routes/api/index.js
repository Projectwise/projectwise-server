const router = require('express').Router()

router.use('/projects', require('./projects'))
router.use('/categories', require('./categories'))
router.use('/', require('./auth'))
router.use('/', require('./users'))

module.exports = router
