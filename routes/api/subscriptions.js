const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const Subscription = require('../../models/Subscription')
const validate = require('../../validators/subscription')
const jwt = require('../../config/jwt')

router.get('/', jwt.isAuthenticated, async (req, res, next) => {
  const limit = typeof req.query.limit !== 'undefined' ? req.query.limit : 20
  const offset = typeof req.query.offset !== 'undefined' ? req.query.offset : 0

  const query = { user: req.user._id }
  try {
    const subscriptions = await Subscription.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({nextDate: 'desc'})
      .exec()

    const subscriptionsCount = await Subscription.count(query).exec()

    return res.status(HttpStatus.OK).json({
      subscriptions: subscriptions.map((subscription) => subscription.toSubscriptionJSON()),
      count: subscriptionsCount
    })
  } catch (err) {
    return next(err)
  }
})

router.post('/', jwt.isAuthenticated, validate.add, async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: errors.mapped()
    })
  }
  try {
    const data = { ...matchedData(req), user: req.user._id }
    const subscription = await new Subscription(data).save()
    return res.status(HttpStatus.OK).json({
      subscription: subscription.toSubscriptionJSON()
    })
  } catch (err) {
    return next(err)
  }
})

router.get('/:subscriptionId', jwt.isAuthenticated, async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId
    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Subscription not found',
        details: {
          subscriptionId: `No subscription found for ${subscriptionId}`
        }
      })
    }
    return res.status(HttpStatus.OK).json({
      subscription: subscription.toSubscriptionJSON()
    })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:subscriptionId', jwt.isAuthenticated, async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId
    const subscription = await Subscription.findById(subscriptionId)
    if (!subscription) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Subscription not found',
        details: {
          subscriptionId: `No subscription found for ${subscriptionId}`
        }
      })
    }
    await subscription.remove()
    return res.status(HttpStatus.NO_CONTENT)
  } catch (err) {
    return next(err)
  }
})

module.exports = router
