
const invalidDataError = (statusCode, details) => {
  const err = new Error('Invalid Data')
  err.statusCode = statusCode
  err.details = details
  return err
}

const notFoundError = (details) => {
  let err = new Error('Page not found')
  err.statusCode = 404
  err.details = details || null
  return err
}

exports.invalidDataError = invalidDataError
exports.notFoundError = notFoundError
