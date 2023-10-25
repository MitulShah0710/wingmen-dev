const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventDriverModel = new Schema(
  {
    bookingDate: {
      type: Date,
    },
    bookingLocalDate: {
      type: Date,
    },
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
    eventManagerId: {
      type: Schema.ObjectId,
      ref: "managerId",
    },
    eventId: {
        type: Schema.ObjectId,
        ref: "EventDriver"
    },
    driverTeam: [{ type: Schema.ObjectId, ref: "Card", default: null }],
    CodriverTeam: [{ type: Schema.ObjectId, ref: "Card", default: null }],
  },
  {
    timestamps: true,
  }
);

const EventDriver = mongoose.model('EventDriver', EventDriverModel);
module.exports = EventDriver;