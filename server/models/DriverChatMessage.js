const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const driverChatMessageModel = new Schema({
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    coDriverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    message: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true
});
const driverChatMessage = mongoose.model('driverChatMessage', driverChatMessageModel);
module.exports = driverChatMessage;
