const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const EventBookingModel = new Schema(
  {
    firstName: {
      type: String,
      ref: "firstName",
    },
    lastName: {
      type: String,
      ref: "lastName",
    },
    eventName: {
      type: String,
      ref: "eventName",
    },
    email: {
      type: String,
      ref: "email",
    },
    eventAddress: {
      type: String,
      ref: "eventAddress",
    },
    pickUplatitude: { type: Number, default: 0 },
    pickUplongitude: { type: Number, default: 0 },
    pickUpLocation: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] },
    },
    pickUpAddress: { type: String, default: "" },
    phone: {
      type: Number,
      ref: "phone",
    },
    altPhone: {
      type: Number,
      ref: "altPhone",
    },
    countryCode: {
      type: Number,
      ref: "countryCode",
    },
    altCountryCode: {
      type: Number,
      ref: "altCountryCode",
    },
    driver: {
      type: Number,
      ref: "drivers",
    },
    bookingDate: {
      type: Date,
    },
    bookingLocalDate: {
      type: Date,
    },
    coDriver: {
      type: Number,
    },
    noOfHours:{
      type: Number,
      default: 1
    },
    totalAmount: {
      type: Number,
    },
    bookingNo: { type: Number, default: 1000 },
    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "COMPLETED",
        "ARRIVED",
        "STARTED",
        "ONGOING",
        "CANCELED",
        "ACCEPTED",
      ],
      default: "PENDING",
    },
    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "COMPLETED",
        "PARTIAL"
      ],
      default: "PENDING",
    },
    token: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    eventManagerId: {
      type: Schema.ObjectId,
      ref: "managerId",
    },
    extraHours: {
      type: Number,
      default: 0
    },
    extraAmount: {
      type: Number,
      default: 0
    },
    isAcceptedByAdmin: {
      type: Boolean,
      default: false
    },
    driverTeam: [{ type: Schema.ObjectId, ref: "Card", default: null }],
    CodriverTeam: [{ type: Schema.ObjectId, ref: "Card", default: null }],
    userCard: [{ type: Schema.ObjectId, ref: "Card" }],
  },
  {
    timestamps: true,
  }
);

EventBookingModel.plugin(autoIncrement.plugin, {
  model: 'eventbookings',
  field: 'bookingNo',
  startAt: 1000,
  incrementBy: 1
});

const EventBooking = mongoose.model('EventBooking', EventBookingModel);
module.exports = EventBooking;