const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt-nodejs');
const DriverModel = new Schema({
    documents: { type: Schema.ObjectId, ref: 'DriverDocument' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'vehicle' },
    coDriverId: { type: Schema.ObjectId, ref: 'Driver' },
    dob: {
        type: String, default: ''
    },
    licenceNumber: {
        type: String, default: ''
    },
    issuingDate: {
        type: String, default: ''
    },
    firstName: {
        type: String, default: ''
    },
    lastName: {
        type: String, default: ''
    },
    email: {
        type: String, index: true, default: ''
    },
    phone: {
        type: String, index: true, default: ''
    },
    address: {
        type: String, default: ''
    },
    city: {
        type: String, default: ''
    },
    zipCode: {
        type: String, default: ''
    },
    stripeDriverId: {
        type: String,
        default: null
    },
    image: {
        type: String, default: ''
    },
    password: {
        type: String, default: ''
    },
    countryCode: {
        type: String, index: true, default: ''
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    driverLocation: {
        type: {
            type: String, enum: ['Point'], default: "Point"
        },
        coordinates: { type: [Number], default: [0, 0] }
    },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    profileStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED'],
        default: 'PENDING'
    },
    carStatus: { type: String, default: '' },
    token: {
        type: String, default: null
    },
    gender: {
        type: String, default: ''
    },
    genderType: {
        type: String,
        enum: ['MALE', 'FEMALE', 'NO_PREFRENCE'],
        default: 'NO_PREFRENCE'
    },
    available: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    activeStatus: {
        type: Boolean,
        default: false
    },
    isNotification: {
        type: Boolean,
        default: true
    },
    driverLisence: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    totalRatedBooking: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalBooking: { type: Number, default: 0 },
    totalAmountEaring: { type: Number, default: 0 },
    totalCompletedBooking: { type: Number, default: 0 },
    totalCanceledBooking: { type: Number, default: 0 },
    ssn: { type: String, default: '' },
    isTransmissionType: {
        type: Boolean,
        default: false
    },
    isCopilot: {
        type: Boolean,
        default: false
    },
    isPilot: {
        type: Boolean,
        default: false
    },
    isPairedDriver: {
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
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
DriverModel.index({ driverLocation: "2dsphere" });
DriverModel.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.__v;
    }
});
DriverModel.pre('save', function (next) {
    encrypt.genSalt(10, (error, salt) => {
        console.log(this.password)
        if (error)
            return console.log(error);
        encrypt.hash(this.password, salt, null, (err, hash) => {
            if (err) return console.log(err);
            this.password = hash;
            console.log(this.password, hash)
            next();
        });
    });
});
DriverModel.methods.comparePassword = function (password, cb) {
    encrypt.compare(password, this.password, (error, match) => {
        if (error) return cb(false);
        if (match) return cb(true);
        return cb(false);
    });
};
DriverModel.methods.getHash = function (password) {
    return new Promise((resolve, reject) => {
        encrypt.genSalt(10, (error, salt) => {
            if (error) return console.log(error);
            encrypt.hash(password, salt, null, (err, hash) => {
                if (err) return console.log(err);
                return resolve(hash)
            });
        });
    });
};
DriverModel.methods.updatePassword = function (password) {
    return new Promise((resolve, reject) => {
        encrypt.genSalt(10, (error, salt) => {
            if (error)
                return console.log(error);
            encrypt.hash(password, salt, null, (err, hash) => {
                if (err) return console.log(err);
                return resolve(hash);
            });
        });
    });
};
const Driver = mongoose.model('Driver', DriverModel);

module.exports = Driver;
