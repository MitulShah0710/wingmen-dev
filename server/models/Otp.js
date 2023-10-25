const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OtpModel = new Schema({
    otp: {
        type: String
    },
    user: {
        type: String
    },
    userId:  { type: Schema.ObjectId, ref: 'User' },
    driverId:  { type: Schema.ObjectId, ref: 'Driver' },
    type: {
        type: String
    },
    phoneNo : {
        type : String
    },
    countryCode:{
        type : String
    }
}, {
    timestamps: true
});
const Otp = mongoose.model('Otp', OtpModel);
module.exports = Otp;
