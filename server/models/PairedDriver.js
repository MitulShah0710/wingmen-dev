const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PairedDriverModel = new Schema({
    driverId:  { type: Schema.ObjectId, ref: 'Driver' },
    pairedDriverId:  { type: Schema.ObjectId, ref: 'Driver' },
    isActivePaired: {
        type : Boolean,
        default :false
    },
    isBlocked : {
        type : Boolean,
        default :false
    },
    isDeleted : {
        type : Boolean,
        default :false
    }
}, {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});
PairedDriverModel.set('toJSON', {
    virtuals: true,
    transform: function (doc,ret,options) {
        delete ret.password;
        delete ret.__v;
    }
});

const PairedDriver = mongoose.model('PairedDriver', PairedDriverModel);
module.exports = PairedDriver;
