const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminNotificationModel = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Booking'
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
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
const AdminNotification = mongoose.model('AdminNotification', AdminNotificationModel);
module.exports = AdminNotification;
