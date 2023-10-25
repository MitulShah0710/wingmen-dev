const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserNotificationModel = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    isAdminNotification: { type: Boolean, default: false },
    isUserNotification: { type: Boolean, default: false },
    isDriverNotification: { type: Boolean, default: false },
    eventID: { type: String },
    eventType: { type: String },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});
const UserNotification = mongoose.model('UserNotification', UserNotificationModel);
module.exports = UserNotification;
