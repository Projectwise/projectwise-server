const mongoose = require('mongoose')
const moment = require('moment')

const { currencyList } = require('../constants/currencies')

const OrderSchema = new mongoose.Schema({
  orderPhone: {type: String, required: true, index: true},
  amount: {type: Number, required: true, min: 0},
  amountCurrency: {type: String, required: true, enum: currencyList, default: 'INR'},
  orderStatus: {type: String},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true})

OrderSchema.pre('save', function (next) {
  this.orderStatus = 'success'
  next()
})

OrderSchema.methods.toOrderJSON = function () {
  return ({
    id: this._id,
    order_phone: this.orderPhone,
    amount: this.amount,
    amount_currency: this.amountCurrency,
    order_status: this.orderStatus,
    order_date: moment(this.created_at).format('Do MMMM YYYY'),
    order_time: moment(this.created_at).format('h:mm:ss a')
  })
}

module.exports = mongoose.model('Order', OrderSchema)
