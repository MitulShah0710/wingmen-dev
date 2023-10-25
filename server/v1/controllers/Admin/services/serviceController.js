const Model = require('../../../../models/index');
const Service = require('../../../../services/index');
const Constant = require('../../../../Constant');
const Validation = require('../../../Validations/index');
const mongoose = require('mongoose');
const stripePay = require('stripe');
const config = require('../../../../config/config');
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);



//VEHICLE VIEW BY ID
let getVehicleTypeById = (req, res) => {
    Model.VehicleType.findById({ _id: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No vehicle Found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    })
}

//ADD SERVICE TYPE
let addServicesType = (req, res) => {
    try {
        if (Validation.isAdminValidate.isValidAddServiceType(req.body)) {
            let apiResponse = Service.generate.generate(true, Constant.required, 500)
            res.send(apiResponse)
        } else {
            const newServiceType = new Model.ServiceType({
                image: req.body.image,
                serviceName: req.body.serviceName,
                modelName: req.body.modelName,
                baseFare: req.body.baseFare,
                perMileCost: req.body.perMileCost,
                perMinuteCost: req.body.perMinuteCost,
                note: req.body.note,
                isNoteShow: req.body.isNoteShow,
                isEventService: req.body.isEventService,
                isRoundTrip: req.body.isRoundTrip,
                isSingleTrip: req.body.isSingleTrip
            })
            newServiceType.save((error, result) => {
                if (error) {
                    let apiResponse = Service.generate.generate(true, "Error..", 500, error)
                    res.send(apiResponse)
                } else {
                    let apiResponse = Service.generate.generate(true, 'Success', 200, result)
                    res.send(apiResponse)
                }
            })
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error..", 500, error)
        res.send(apiResponse)
    }
}

//GET ADMIN VEHICLE
let getAdminVehicle = (req, res) => {
    try {
        const query = { isAdminVehicle: true }
        Model.Vehicle.find(query, (err, result) => {
            if (err) {
                let apiResponse = Service.generate.generate(true, 'Error', 500, err)
                res.send(apiResponse)
            } else if (result == undefined || result == null || result == '') {
                let apiResponse = Service.generate.generate(true, 'No vehicle Found', 500, null)
                res.send(apiResponse)
            } else {
                let apiResponse = Service.generate.generate(true, 'Success', 200, result)
                res.send(apiResponse)
            }
        })
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error..", 500, error)
        res.send(apiResponse)
    }
}


//EXPORT ALL FUNCTIONS
module.exports = {
    getVehicleTypeById: getVehicleTypeById,
    addServicesType: addServicesType,
    getAdminVehicle: getAdminVehicle
}