const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const Project = require('../../models/Project')
const User = require('../../models/User')
const validate = require('../../validators/project')
const jwt = require('../../config/jwt')

router.param('project', async (req, res, next, slug) => {
  try {
    const project = await Project.findOne({ slug }).populate('addedBy')
    if (!project) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Project not found',
        details: {
          project: `No project found for ${slug}`
        }
      })
    }
    req.project = project
    return next()
  } catch (err) {
    return next(err)
  }
})

router.get('/', jwt.optional, async (req, res, next) => {
  const limit = typeof req.query.limit !== 'undefined' ? req.query.limit : 20
  const offset = typeof req.query.offset !== 'undefined' ? req.query.offset : 0

  const query = {}
  if (typeof req.query.category !== 'undefined') {
    query.categories = {'$in': [req.query.category]}
  }
  try {
    if (req.query.addedBy) {
      query.addedBy = await User.findOne({ username: req.query.author })._id
    }

    const projects = await Promise.all([
      Project.find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('addedBy')
        .exec(),
      Project.count(query).exec()
    ])
    return res.status(HttpStatus.OK).json({
      projects: projects[0].map(project => project.toProjectJSON(req.user || null)),
      projectsCount: projects[1]
    })
  } catch (e) { return next(e) }
})

router.post('/', jwt.authenticated, validate.add, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    const data = { ...matchedData(req), addedBy: req.user }
    const project = await new Project(data).save()
    return res.status(HttpStatus.OK).json({
      project: project.toProjectJSON(req.user)
    })
  } catch (err) {
    return next(err)
  }
})

router.get('/:project', jwt.optional, async (req, res, next) => {
  try {
    req.project = await req.project.populate('addedBy').execPopulate()
    return res.status(HttpStatus.OK).json({
      project: req.project.toProjectJSON(req.user || null)
    })
  } catch (e) {
    next(e)
  }
})

router.put('/:project', jwt.authenticated, validate.update, async (req, res, next) => {
  if (req.article.addedBy._id.toString() === req.user._id.toString()) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: errors.mapped()
      })
    }
    try {
      const updatedData = matchedData(req)
      Object.keys(updatedData).forEach((field) => {
        req.project[field] = updatedData[field]
      })
      const updatedProject = await req.article.save()
      return res.status(HttpStatus.OK).json({
        project: updatedProject.toProjectJSON(req.user || null)
      })
    } catch (e) {
      return next(e)
    }
  }
})

router.delete('/:project', jwt.authenticated, async (req, res, next) => {
  if (req.project.addedBy._id.toString() === req.user._id.toString()) {
    await req.article.remove()
    return res.status(HttpStatus.NO_CONTENT).json({
      message: 'Project deleted successfully'
    })
  }
})

module.exports = router
