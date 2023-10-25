const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var serviceTypeModelSchema = new Schema({
  baseFare: Number,
  perMileCost: Number,
  perMinuteCost: Number,
  serviceName: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  serviceDescription: {
    type: String
  },
  image: {
    type: String,
    default: ""
  },
  isNoteShow: { type: Boolean, default: false },
  isEventService: { type: Boolean, default: false },
  isSingleTrip: { type: Boolean, default: false },
  isRoundTrip: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true })
serviceTypeModelSchema.set('toObject', { virtuals: true });
serviceTypeModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ServiceType', serviceTypeModelSchema);