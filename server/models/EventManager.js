const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt-nodejs');

const EventManagerModelSchema = new Schema({
    name: {
        type: String,
        ref: 'EventManagerName'
    },
    eventManagerId: {
        type: Schema.ObjectId,
        ref: 'eventManagerId'
    },
    email: {
        type: String,
        ref: 'email'
    },
    phone: {
        type: Number,
        ref: 'phoneNo'
    },
    countryCode: {type: String, index: true, default: ''},
    role: {
        type: String,
        enum: ['manager', 'team']
    },
    password: {
        type: String
    },
    token: {
        type: String, default: null
    },
    eventManager: {
        type: Boolean,
        default: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
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
}, {
    timestamps: true
});
EventManagerModelSchema.pre('save', function (next) {
    encrypt.genSalt(10, (error, salt) => {
      if (error) return console.log(error);
      encrypt.hash(this.password, salt, null, (err, hash) => {
        this.password = hash;
        next();
      });
    });
});
EventManagerModelSchema.methods.comparePassword = function (password, cb) {
encrypt.compare(password, this.password, (error, match) => {
        if (error) return cb(false);
        if (match) return cb(true);
        return cb(false);
    });
};

const EventManager = mongoose.model('EventManager', EventManagerModelSchema);
module.exports = EventManager;