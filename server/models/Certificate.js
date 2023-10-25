const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CertificateModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
const Certificate = mongoose.model('Certificate', CertificateModel);
module.exports = Certificate;
