const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CityModelSchema = new Schema({
  zipCode: {
    type: String,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  // isBlocked: {
  //   type: Boolean,
  //   default: false
  // },
  isDeleted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true })

module.exports = mongoose.model('City', CityModelSchema);
