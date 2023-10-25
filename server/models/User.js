const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt-nodejs');
const UserModel = new Schema({
    firstName: {
        type: String, default: ''
    },
    lastName: {
        type: String, default: ''
    },
    email: {
        type: String, index: true, default: ''
    },
    facebookId: {
        type: String, index: true, default: ''
    },
    googleId: {
        type: String, index: true, default: ''
    },
    twitterId: {
        type: String, index: true, default: ''
    },
    linkdinId: {
        type: String, index: true, default: ''
    },
    phone: {
        type: String, index: true, default: ''
    },
    password: {
        type: String, default: ''
    },
    country: {
        type: String, default: ''
    },
    state: {
        type: String, default: ''
    },
    zipCode: {
        type: String, default: ''
    },
    gender: {
        type: String, default: ''
    },
    genderType: {
        type: String,
        enum: ['MALE', 'FEMALE', 'NO_PREFRENCE'],
        default: 'NO_PREFRENCE'
    },
    city: {
        type: String, default: ''
    },
    image: {
        type: String, default: ''
    },
    referralUserId: { type: Schema.ObjectId, ref: 'User' },
    referralUserCode: { type: String, default: "" },
    referralCode: { type: String, default: "" },
    isReferralCodeUsed: {
        type: Boolean,
        default: false
    },
    rating: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalRatedBooking: { type: Number, default: 0 },
    totalBooking: { type: Number, default: 0 },
    totalCompletedBooking: { type: Number, default: 0 },
    totalCanceledBooking: { type: Number, default: 0 },
    address: {
        type: String, default: ''
    },
    location: {
        type: {
            type: String, enum: ['Point'], default: "Point"
        },

        coordinates: { type: [Number], default: [0, 0] }
    },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    walletAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    isVerified: {
        type: Boolean,
        default: true
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    countryCode: {
        type: String, index: true, default: ''
    },
    isNotification: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    providerId: { type: String, index: true, default: '' },
    provider: { type: String, default: '' },
    isSocialLogin: {
        type: Boolean,
        default: false
    },
    profileStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED'],
        default: 'PENDING'
    },
    guestUser: {
        type: Boolean,
        default: false 
    },
    singUpType: {
        type: String,
        enum: ['MOBILE', 'EMAIL'],
        default: ''
    },
    token: {
        type: String, default: null
    },
    passwordResetToken: { type: String, default: '' },
    passwordResetTokenDate: { type: Date },
    userCard: [{ type: Schema.ObjectId, ref: 'Card' }],
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
UserModel.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, option) {
        delete ret.password;
        delete ret.__v;
    }
});
UserModel.pre('save', function (next) {
    encrypt.genSalt(10, (error, salt) => {
        if (error)
            return console.log(error);
        else if (this.password) {
            encrypt.hash(this.password, salt, null, (err, hash) => {
                if (err) return console.log(err);
                this.password = hash;
                console.log(this.password, hash)
                next();
            });
        }
        else {
            next();
        }
    });
});
UserModel.methods.comparePassword = function (password, cb) {
    encrypt.compare(password, this.password, (error, match) => {
        if (error) return cb(false);
        if (match) return cb(true);
        return cb(false);
    });
};
UserModel.methods.updatePassword = function (password) {
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
const User = mongoose.model('User', UserModel);
module.exports = User;
