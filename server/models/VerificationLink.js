const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LinkModel = new Schema({
    passwordResetToken:{type:String,default:null},
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Admin'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String
    }
}, {
    timestamps: true
});
const VerificationLink = mongoose.model('VerificationLink', LinkModel);
module.exports = VerificationLink;
