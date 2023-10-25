const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var cardModelSchema = new Schema({  
  userId:  { type: Schema.ObjectId, ref: 'User' },
  stripeCustomerId: { type: String, required: true },
  stripePaymentMethod: { type: String },
  brand: { type: String },
  last4Digits: { type: String },
  expiryDate: { type: String },
  isDefault : {type : Boolean,default : false},
  isBlocked : {type : Boolean,default : false},
  isDeleted : {type : Boolean,default : false},  
}, { timestamps: true })
cardModelSchema.set('toObject', { virtuals: true });
cardModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Card', cardModelSchema);