const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var promoCodeModelSchema = new Schema({
    promoCode: {
        type: String,
        index: true
    },
    minimumBookingPrice: {
        type: Number,
        default: 0
    },
    cashback: {
        type: Number
    },
    percentage: {
        type: Number
    },
    individualUserPromoAttempt: {
        type: Number,
        default: 1
    },
    noOfPromoUsers: {
        type: Number,
        required: true,
        default: 1
    },
    promoAttempt: {
        type: Number,
        required: true,
        default: 1
    },
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    isExpireDateAdded: {
        type: Boolean,
        default: false
    },
    expireDate: {
        type: Date
    },
    isCash: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

promoCodeModelSchema.set('toObject', { virtuals: true });
promoCodeModelSchema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('promoCode', promoCodeModelSchema);