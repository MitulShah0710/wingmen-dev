const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressModel = new Schema({
    address1: {
        type: String
    },
    address2: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    postalCode: {
        type: String
    },
    landmark: {
        type: String
    },
    name: {
        type: String
    },
    phone: {
        type: String
    },
    alternatePhone: {
        type: String
    },
    addressType: {
        type: String,
        enum: ['Home','Office','Other']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
const Address = mongoose.model('Address', AddressModel);
module.exports = Address;
