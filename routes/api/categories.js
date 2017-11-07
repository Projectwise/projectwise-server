const HttpStatus = require('http-status-codes')
const router = require('express').Router()

const Project = require('../../models/Project')
const jwt = require('../../config/jwt')

router.get('/', async (req, res, next) => {
  try {
    const categories = await Project.find().distinct('categories')
    return res.status(HttpStatus.OK).json({ categories })
  } catch (e) {
    next(e)
  }
})

router.get('/:category', jwt.optional, async (req, res, next) => {
  const limit = typeof req.query.limit !== 'undefined' ? req.query.limit : 20
  const offset = typeof req.query.offset !== 'undefined' ? req.query.offset : 0
  const query = {
    categories: {'$in': [req.params.category]}
  }
  try {
    const count = await Project.count(query).exec()
    if (count === 0) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found',
        details: {
          project: `No category found with name ${req.params.category}`
        }
      })
    }
    const projects = await Project.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({createdAt: 'desc'})
      .populate('addedBy')
      .exec()
    return res.status(HttpStatus.OK).json({
      projects: projects.map(project => project.toProjectJSON(req.user || null)),
      projectsCount: count
    })
  } catch (e) { return next(e) }
})

module.exports = router
