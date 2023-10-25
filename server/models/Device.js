const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DeviceModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    deviceType: {
        type: String
    },
    isDriver:{type:Boolean,default:false},
    isUser:{type:Boolean,default:false},
    deviceToken: {
        type: String
    }
}, {
    timestamps: true
});
const Device = mongoose.model('Device', DeviceModel);
module.exports = Device;
