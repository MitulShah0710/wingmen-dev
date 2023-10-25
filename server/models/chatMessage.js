const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const chatMessageModel = new Schema({
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
    isUserNotification: { type: Boolean, default: false },
    isDriverNotification: { type: Boolean, default: false },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});
const chatMessage = mongoose.model('chatMessage', chatMessageModel);
module.exports = chatMessage;
