const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var driverEarningModelSchema = new Schema({
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  bookingId: {
    type: Schema.ObjectId,
    ref: 'booking'
  },
  driverId: {
    type: Schema.ObjectId,
    ref: 'Driver'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED'],
    default: 'PENDING'
  },
  bookingStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'ARRIVED', 'STARTED', 'ONGOING', 'CANCELED', 'ACCEPTED'],
    default: 'PENDING'
  },
  paymentMode: {
    type: String,
    enum: ['CASH', 'CARD', 'NO_PAYEMENT', 'WALLET'],
    default: 'NO_PAYEMENT'
  },
  bookingDate: {
    type: Date
  },
  bookingCreatedDate: {
    type: Date
  },
  bookingLocalDate: {
    type: Date
  },
  driverEarningAmount: {
    type: Number,
    default: 0
  },
  isDriver: {
    type: Boolean,
    default: false
  },
  isCoDriver: {
    type: Boolean,
    default: false
  },
  // isTip: {
  //   type: Boolean,
  //   default: false
  // },
  isTipPr: {
    type: Number,
    default: 0
  },
  isTipAmount: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true })
driverEarningModelSchema.set('toObject', { virtuals: true });
driverEarningModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DriverEarning', driverEarningModelSchema);