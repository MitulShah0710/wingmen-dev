const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var refundModelSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    bookingId: {
        type: Schema.ObjectId,
        ref: 'Booking'
    },
    cardId: {
        type: Schema.ObjectId,
        ref: 'Card'
    },
    chargeId: {
        type: String,
        unique: true,
        required: true
    },
    refundId: {
        type: String,
        unique: true,
        required: true
    },
    paymentIntent: {
        type: String
    },
    amount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })
refundModelSchema.set('toObject', { virtuals: true });
refundModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Refund', refundModelSchema);