const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const logger = require('morgan')
const cors = require('cors')
const errorhandler = require('errorhandler')

require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'
const mongoURI = isProduction ? process.env.DB : process.env.LOCAL_DB

mongoose.Promise = global.Promise

connectDB()
  .on('error', console.log)
  .on('disconnected', connectDB)
  .once('open', listen)

const app = express()

// TODO: CORS settings
app.use(cors())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.use(logger('dev'))

if (!isProduction) {
  app.use(errorhandler())
}

// passport
require('./config/passport')

app.use(require('./routes'))

app.use((err, req, res, next) => {
  if (isProduction) {
    return res.status(err.status || 500).json({
      errors: {
        message: err.message || 'Something went wrong',
        details: err.details || 'No details specified'
      }
    })
  }
  console.log(err)
  return res.status(err.statusCode || 500).json({
    errors: {
      message: err.message || 'Something went wrong',
      details: err
    }
  })
})

function connectDB () {
  const options = {server: {socketOptions: {keepAlive: 1}}}
  return mongoose.connect(mongoURI, options).connection
}

function listen () {
  app.listen(process.env.PORT)
  console.log('App is running')
}
