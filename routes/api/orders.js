const HttpStatus = require('http-status-codes')
const router = require('express').Router()
const { validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')

const Order = require('../../models/Order')
const validate = require('../../validators/order')
const jwt = require('../../config/jwt')

router.get('/', jwt.isAuthenticated, async (req, res, next) => {
  const limit = typeof req.query.limit !== 'undefined' ? req.query.limit : 20
  const offset = typeof req.query.offset !== 'undefined' ? req.query.offset : 0

  const query = { user: req.user._id }
  try {
    const orders = await Order.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({created_at: 'desc'})
      .exec()

    const ordersCount = await Order.count(query).exec()

    return res.status(HttpStatus.OK).json({
      orders: orders.map((subscription) => subscription.toOrderJSON()),
      count: ordersCount
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
    const order = await new Order(data).save()
    return res.status(HttpStatus.OK).json({
      subscription: order.toOrderJSON()
    })
  } catch (err) {
    return next(err)
  }
})

router.get('/:orderId', jwt.isAuthenticated, async (req, res, next) => {
  try {
    const orderId = req.params.orderId
    const order = await Order.findById(orderId)
    if (!order) {
      return next({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Order not found',
        details: {
          subscriptionId: `No subscription found for ${orderId}`
        }
      })
    }
    return res.status(HttpStatus.OK).json({
      subscription: order.toOrderJSON()
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
