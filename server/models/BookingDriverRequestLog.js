const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encrypt = require('bcrypt-nodejs');
const BookingDriverRequestLogModel = new Schema({
    bookingId:{type: Schema.Types.ObjectId,ref: 'Booking'},
    driverId:  { type: Schema.ObjectId, ref: 'Driver' },
    coDriverId:  { type: Schema.ObjectId, ref: 'Driver' },
    bookingStatus:{type: String,
        enum: ['PENDING','COMPLETED','ARRIVED','STARTED','ONGOING','CANCELED','ACCEPTED','IGNORE'],
        default: 'PENDING'
    },
    statusMoveByDriver : {
        type : Boolean,
        default :false
    },
    statusMoveByCoDriver : {
        type : Boolean,
        default :false
    },
    statusMoveByUser : {
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
BookingDriverRequestLogModel.set('toJSON', {
    virtuals: true,
    transform: function (doc,ret,options) {
        delete ret.password;
        delete ret.__v;
    }
});
const BookingDriverRequestLog = mongoose.model('BookingDriverRequestLog', BookingDriverRequestLogModel);
module.exports = BookingDriverRequestLog;
