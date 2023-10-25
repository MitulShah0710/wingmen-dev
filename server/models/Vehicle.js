const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var vehicleModelSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    driverId: {
        type: Schema.ObjectId,
        ref: 'Driver'
    },
    vehicleTypeId: {
        type: Schema.ObjectId,
        ref: 'VehicleType'
    },
    transmissionTypeId: {
        type: Schema.ObjectId,
        ref: 'TransmissionType'
    },
    vehicleName: {
        type: String,
        default: ''
    },
    vehicleMake: {
        type: String,
        default: ''
    },
    vehicleModel: {
        type: String
        , default: ''
    },
    vehicleImage: {
        type: String,
        default: ''
    },
    license: {
        type: String,
        default: ''
    },
    // numberPlate: {type: String,default: ''},
    documentThree: {
        type: String,
        default: ''
    },
    carLicense: {
        type: String,
        default: ''
    },
    insuranceDocuments: {
        type: String,
        default: ''
    },
    taxiPermit: {
        type: String,
        default: ''
    },
    vehicalRegistration: {
        type: String,
        default: ''
    },
    drivingCertificate: {
        type: String,
        default: ''
    },
    carFrontImage: {
        type: String,
        default: ''
    },
    carBackImage: {
        type: String,
        default: ''
    },
    carLeftImage: {
        type: String,
        default: ''
    },
    carRightImage: {
        type: String,
        default: ''
    },
    isCarFrontImageUploaded: {
        type: Boolean,
        default: false
    },
    isCarBackImageUploaded: {
        type: Boolean,
        default: false
    },
    isCarLeftImageUploaded: {
        type: Boolean,
        default: false
    },
    isCarRightImageUploaded: {
        type: Boolean,
        default: false
    },
    isLicenseUploaded: {
        type: Boolean,
        default: false
    },
    isNumberPlateUploaded: {
        type: Boolean,
        default: false
    },
    isCarLicenseUploaded: {
        type: Boolean,
        default: false
    },
    isInsuranceDocumentsUploaded: {
        type: Boolean,
        default: false
    },
    isTaxiPermitUploaded: {
        type: Boolean,
        default: false
    },
    isVehicalRegistrationUploaded: {
        type: Boolean,
        default: false
    },
    isDrivingCertificateUploaded: {
        type: Boolean,
        default: false
    },
    aboutCar: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    },
    plateNumber: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    chassis: {
        type: String,
        default: ''
    },
    engine: {
        type: String,
        default: ''
    },
    steering: {
        type: String,
        default: ''
    },
    speed: {
        type: String,
        default: ''
    },
    passenger: {
        type: Number,
        default: 0
    },
    transmission: {
        type: String
    },
    hourlyRate: {
        type: Number
    },
    dayRate: {
        type: Number
    },
    date: {
        type: Number
    },
    isDriverVehicle: {
        type: Boolean,
        default: false
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    place: {
        type: String
    },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: [Number]
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdminVehicle: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

vehicleModelSchema.set('toObject', { virtuals: true });
vehicleModelSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('vehicle', vehicleModelSchema);