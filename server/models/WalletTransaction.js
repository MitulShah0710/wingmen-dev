const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var walletTransactionModelSchema = new Schema({  
  userId:  { type: Schema.ObjectId, ref: 'User' },
  cardId:{ type: Schema.ObjectId, ref: 'Card' },
  trxId: { type: String, unique: true, required: true },
  paymentStatus:{
    type: String,
    enum: ['PENDING','COMPLETED'],
    default: 'PENDING'
  },
  captureMethod:{ type: String },
  stripeCustomerId:{ type: String },
  amount: { type: Number, default: 0 },
  isBlocked : {type : Boolean,default : false},
  isDeleted : {type : Boolean,default : false},  
}, { timestamps: true })
walletTransactionModelSchema.set('toObject', { virtuals: true });
walletTransactionModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionModelSchema);