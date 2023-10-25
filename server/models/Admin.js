const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt-nodejs');
const AdminModel = new Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  contactUsEmail: {
    type: String
  },
  password: {
    type: String
  },
  phone: {
    type: String
  },
  referralAmountSender: { type: Number, default: 0 },
  referralAmountReceiver: { type: Number, default: 0 },
  cancelAmountInPercentage: { type: Number, default: 0 },
  rideCancleAccepted: { type: Number, default: 0 },
  rideCancleArrived: { type: Number, default: 0 },
  mileFee: { type: Number, default: 0 },
  taxInPercentage: { type: Number, default: 0 },
  driverPerKmCharge: { type: Number, default: 0 },
  coDriverPerKmCharge: { type: Number, default: 0 },
  baseFare: { type: Number, default: 0 },
  overflowFee: { type: Number, default: 0 },
  sharePercentage: { type: Number, default: 0 },
  timeToScheduled: { type: Number, default: 0 },
  driverSharePercentage: { type: Number, default: 0 },
  coDriverSharePercentage: { type: Number, default: 0 },
  area: { type: Number, default: 0 },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  address: { type: String, default: null },
  notesOfTripType: { type: String, default: null },
  notesOfPassengers: { type: String, default: null },
  access: {
    read: {
      type: Boolean,
      default: true
    },
    write: {
      type: Boolean,
      default: true
    },
    edit: {
      type: Boolean,
      default: true
    },
    delete: {
      type: Boolean,
      default: true
    }
  },
  rate: {
    type: Number,
    default: 15,
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'SubAdmin']
  },
  token: {
    type: String, default: null
  },
  passwordResetToken: { type: String, default: '' },
  passwordResetTokenDate: { type: Date, default: '' },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
AdminModel.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.__v;
  }
});
AdminModel.pre('save', function (next) {
  encrypt.genSalt(10, (error, salt) => {
    if (error) return console.log(error);
    encrypt.hash(this.password, salt, (err, hash) => {
      this.password = hash;
      next();
    });
  });
});
AdminModel.methods.comparePassword = function (password, cb) {
  encrypt.compare(password, this.password, (error, match) => {
    if (error) return cb(false);
    if (match) return cb(true);
    return cb(false);
  });
};
AdminModel.methods.updatePass = function (password) {
  return new Promise((resolve, reject) => {
    encrypt.genSalt(10, (error, salt) => {
      if (error) return console.log(error);
      encrypt.hash(password, salt, (err, hash) => {
        if (err) return console.log(err);
        return resolve(hash);
      });
    });
  });
};
const Admin = mongoose.model('Admin', AdminModel);
module.exports = Admin;
