const { check } = require('express-validator/check')
const { sanitize } = require('express-validator/filter')

const { currencyList } = require('../constants/currencies')

exports.add = [
  check('orderPhone')
    .exists().withMessage('Phone Number cannot be empty')
    .isMobilePhone('any').withMessage('Enter a valid phone number'),
  check('amount')
    .exists().withMessage('Amount cannot be empty')
    .isFloat({ min: 0 }).withMessage('Amount should be more than 0'),
  check('amountCurrency')
    .exists().withMessage('Currency code cannot be empty')
    .isIn(currencyList).withMessage('Invalid Currency code'),
  sanitize(['phone', 'amount', 'amountCurrency']).trim(),
  sanitize(['amount']).toFloat()
]
