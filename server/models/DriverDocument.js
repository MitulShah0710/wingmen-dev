const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DriverDocumentModel = new Schema({
    driverId: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
    },
    license: {
        type: String
    },
    numberPlace: {
        type: String
    },
    documentThree: {
        type: String
    },
    carLicense : {
        type: String
    },
    InsuranceDocuments : {
        type : String
    },
    taxiPermit : {
        type : String
    },
    vehicalRegistration : {
        type : String
    },
    drivingCertificate : {
        type : String
    }
}, {
    timestamps: true
});
const DriverDocument = mongoose.model('DriverDocument', DriverDocumentModel);
module.exports = DriverDocument;
