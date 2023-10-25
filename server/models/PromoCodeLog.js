const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var promoLogModelSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    bookingId: {
        type: Schema.ObjectId,
        ref: 'booking'
    },
    promoId: {
        type: Schema.ObjectId,
        ref: 'promoCode'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('promoLog', promoLogModelSchema);