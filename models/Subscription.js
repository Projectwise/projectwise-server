const mongoose = require('mongoose')
const moment = require('moment')

const { currencyList } = require('../constants/currencies')

const SubscriptionSchema = new mongoose.Schema({
  phone: {type: String, required: true, index: true},
  description: {type: String},
  amount: {type: Number, required: true, min: 0},
  amountCurrency: {type: String, required: true, enum: currencyList, default: 'INR'},
  interval: {type: Number, required: true, min: 1, max: 30},
  nextDate: {type: Date, default: Date.now},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true})

SubscriptionSchema.pre('save', function (next) {
  this.nextDate = moment.add(this.created_at).add(this.interval, 'd')
  next()
})

SubscriptionSchema.methods.updateNextDate = function () {
  this.nextDate = moment(this.nextDate).add(this.interval, 'd').toDate()
  this.save()
}

SubscriptionSchema.methods.toSubscriptionJSON = function () {
  return {
    phone: this.phone,
    amount: this.amount,
    amount_currency: this.amountCurrency,
    interval: `Every ${this.interval} days`,
    next_due_date: moment(this.nextDate).format('Do MMMM YYYY')
  }
}

module.exports = mongoose.model('Subscription', SubscriptionSchema)
