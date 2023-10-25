const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ContactUsModel = new Schema({
    name: {
        type: String
    },
    message: {
        type: String
    },
    phone: {
        type: String
    },
    event: {
        type: String
    },
    email: {
        type: String
    },
    subject: {
        type: String
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

const ContactUs = mongoose.model('ContactUs', ContactUsModel);
module.exports = ContactUs;
