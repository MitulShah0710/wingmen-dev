const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var driverPayoutModelSchema = new Schema({
    driverId: {
        type: Schema.ObjectId, ref: 'Driver'
    },
    driverAllTimeWallet: {
        type: Number,
        default: 0
    },
    driverAvailableBalance: {
        type: Number,
        default: 0
    },
    driverPayout: {
        type: Number,
        default: 0
    },
    withdrawHistory: [Object],
}, { timestamps: true })



driverPayoutModelSchema.set('toObject', { virtuals: true });
driverPayoutModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('DriverPayout', driverPayoutModelSchema);