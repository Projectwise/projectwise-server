const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

const { currencyList } = require('../constants/currencies')

exports.add = [
  check('phone')
    .exists().withMessage('Phone Number cannot be empty')
    .isMobilePhone('any').withMessage('Enter a valid phone number'),
  check('description').optional(),
  check('amount')
    .exists().withMessage('Amount cannot be empty')
    .isFloat({ min: 0 }).withMessage('Amount should be more than 0'),
  check('amountCurrency')
    .exists().withMessage('Currency code cannot be empty')
    .isIn(currencyList).withMessage('Invalid Currency code'),
  check('interval')
    .exists().withMessage('Interval cannot be empty')
    .isInt({min: 1, max: 30}).withMessage('Interval must be between 1 day and 30 days'),
  sanitize(['phone', 'description', 'amount', 'amountCurrency', 'interval', 'nextDate']).trim(),
  sanitize(['amount']).toFloat(),
  sanitize(['interval']).toInt()
]
