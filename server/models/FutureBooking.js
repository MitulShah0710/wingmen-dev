const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const Schema = mongoose.Schema;

var FuturebookingModelSchema = new Schema({
  bookingNo: { type: Number, default: 1000 },
  driverId: { type: Schema.ObjectId, ref: 'ScheduledDriver' },
  vehicleId: { type: Schema.ObjectId, ref: 'vehicle' },
  vehicleTypeId: { type: Schema.ObjectId, ref: 'vehicleType' },
  seviceTypeId: { type: Schema.ObjectId, ref: 'ServiceType' },
  transmissionTypeId: { type: Schema.ObjectId, ref: 'transmissionType' },
  userVehicleId: { type: Schema.ObjectId, ref: 'vehicle' },
  userVehicleTypeId: { type: Schema.ObjectId, ref: 'vehicleType' },
  userTransmissionTypeId: { type: Schema.ObjectId, ref: 'transmissionType' },
  teamId: { type: Schema.ObjectId, ref: 'Team' },
  eventTypeId: { type: Schema.ObjectId, ref: 'EventType' },
  userId: { type: Schema.ObjectId, ref: 'User' },
  driverId: { type: Schema.ObjectId, ref: 'Driver' },
  coDriverId: { type: Schema.ObjectId, ref: 'Driver' },
  promoId: { type: Schema.ObjectId, ref: 'promoCode' },
  transactionId: { type: Schema.ObjectId, ref: 'Transaction' },
  referralUserId: { type: Schema.ObjectId, ref: 'User' },
  referralCode: { type: String, default: "" },
  isReferralCodeUsed: { type: Boolean, default: false },
  trxId: { type: String, default: "" },
  isPayementOnStrip: { type: Boolean, default: false },
  passengerNo: { type: String, default: '' },
  eventName: { type: String, default: '' },
  eventDescription: { type: String, default: '' },
  block: { type: String, default: '' },
  eventLocaltionLatitude: { type: Number, default: 0 },
  eventLocaltionLongitude: { type: Number, default: 0 },
  eventLocaltion: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  eventAddress: { type: String, default: '' },
  dropUplatitudeFirst: { type: Number, default: 0 },
  dropUplongitudeFirst: { type: Number, default: 0 },
  droupUpLocationFirst: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  dropUpAddressFirst: { type: String, default: '' },
  dropUplatitudeSecond: { type: Number, default: 0 },
  dropUplongitudeSecond: { type: Number, default: 0 },
  droupUpLocationSecond: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  dropUpAddressSecond: { type: String, default: '' },
  dropUplatitudeThird: { type: Number, default: 0 },
  dropUplongitudeThird: { type: Number, default: 0 },
  droupUpLocationThird: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  dropUpAddressThird: { type: String, default: '' },
  dropUplatitudeFour: { type: Number, default: 0 },
  dropUplongitudeFour: { type: Number, default: 0 },
  droupUpLocationFour: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  dropUpAddressFour: { type: String, default: '' },
  pickUplatitude: { type: Number, default: 0 },
  pickUplongitude: { type: Number, default: 0 },
  pickUpLocation: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  pickUpAddress: { type: String, default: '' },
  dropUplatitude: { type: Number, default: 0 },
  dropUplongitude: { type: Number, default: 0 },
  droupUpLocation: {
    type: {
      type: String, default: "Point"
    },
    coordinates: { type: [Number], default: [0, 0] }
  },
  dropUpAddress: { type: String, default: '' },
  bookingDate: { type: Date },
  bookingLocalDate: { type: Date },
  bookingStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'ARRIVED', 'STARTED', 'ONGOING', 'CANCELED', 'ACCEPTED'],
    default: 'PENDING'
  },
  assignBy: {
    type: String,
    enum: ['AUTOASSIGN', 'ADMIN'],
    default: 'AUTOASSIGN'
  },
  tripType: {
    type: String,
    enum: ['ROUNDTRIP', 'SINGLETRIP', 'NO_TRIP'],
    default: 'NO_TRIP'
  },
  isRoundTrip: { type: Boolean, default: false },
  isSingleTrip: { type: Boolean, default: false },
  isCoDriverRequired: { type: Boolean, default: false },
  isDriverRequired: { type: Boolean, default: false },
  paymentMode: {
    type: String,
    enum: ['CASH', 'CARD', 'NO_PAYEMENT', 'WALLET'],
    default: 'NO_PAYEMENT'
  },
  genderType: {
    type: String,
    enum: ['MALE', 'FEMALE', 'NO_PREFRENCE'],
    default: 'NO_PREFRENCE'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'REFUND'],
    default: 'PENDING'
  },
  note: { type: String, default: '' },
  isCompleteByCustomer: { type: Boolean, default: false },
  isEventBooking: { type: Boolean, default: false },
  isadminAccept: { type: Boolean, default: false },
  isCanceledByAdmin: { type: Boolean, default: false },
  isCanceledByCron: { type: Boolean, default: false },
  isCashMode: { type: Boolean, default: false },
  isPromoApply: { type: Boolean, default: false },
  isTripAllocated: { type: Boolean, default: false },
  isSheduledBooking: { type: Boolean, default: false },
  isCanceledByDriver: { type: Boolean, default: false },
  isCanceledByCustomer: { type: Boolean, default: false },
  isCanceledByAdmin: { type: Boolean, default: false },
  isDriverRated: { type: Boolean, default: false },
  isCustomerRated: { type: Boolean, default: false },
  driverRating: { type: Number, default: 0 },
  customerRating: { type: Number, default: 0 },
  driverReview: { type: String, default: '' },
  customerReview: { type: String, default: '' },
  isDriverReviewed: { type: Boolean, default: false },
  isCustomerReviewed: { type: Boolean, default: false },
  totalDistance: { type: Number, default: 0 },
  totalDistanceInKm: { type: Number, default: 0 },
  eta: { type: Number, default: 0 },
  perKmCharge: { type: Number, default: 0 },
  booKingAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  cancelAmount: { type: Number, default: 0 },
  booKingDriverAmount: { type: Number, default: 0 },
  booKingCoDriverAmount: { type: Number, default: 0 },
  isWalletUsed: { type: Boolean, default: false },
  walletAmount: { type: Number, default: 0 },
  promoAmount: { type: Number, default: 0 },
  actualAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  driverJobCompletedImage: {
    type: String, default: ''
  },
  isTip: {
    type: Boolean,
    default: false
  },
  driverEarningAmount: {
    type: Number,
    default: 0
  },
  timezone: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

FuturebookingModelSchema.plugin(autoIncrement.plugin, {
  model: 'FutureBooking',
  field: 'bookingNo',
  startAt: 1000,
  incrementBy: 1
});
FuturebookingModelSchema.set('toObject', { virtuals: true });
FuturebookingModelSchema.set('toJSON', { virtuals: true });
FuturebookingModelSchema.index({ cordinates: "2dsphere" });
FuturebookingModelSchema.index({ pickUpLocation: "2dsphere" });
FuturebookingModelSchema.index({ droupUpLocation: "2dsphere" });
FuturebookingModelSchema.index({ droupUpLocationFirst: "2dsphere" });
FuturebookingModelSchema.index({ droupUpLocationSecond: "2dsphere" });
FuturebookingModelSchema.index({ droupUpLocationThird: "2dsphere" });
FuturebookingModelSchema.index({ droupUpLocationFour: "2dsphere" });
module.exports = mongoose.model('FutureBooking', FuturebookingModelSchema);
