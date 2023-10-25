const Model = require('../../../../models/index');
const Service = require('../../../../services/index');
const Constant = require('../../../../Constant');
const Validation = require('../../../Validations/index');
const mongoose = require('mongoose');
const stripePay = require('stripe');
const config = require('../../../../config/config');
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);



//GET ACTIVE DRIVER ONLY FOR MAP
let getDriversOnMap = async (req, res) => {
    const { page, limit } = req.query;
    //FILTER
    const query = { isDeleted: false, activeStatus: true }
    try {
        const activeDriver = await Model.Driver.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Model.Driver.countDocuments(query);
        const result = {

            activeDriver,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
        let apiResponse = Service.generate.generate(true, "Success", 200, result);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}


//GET COMPLETED BOOKING ONLY FOR MAP
let getBookingOnMap = async (req, res) => {
    const { page, limit } = req.query;
    //FILTER
    const query = { isDeleted: false, bookingStatus: 'COMPLETED' }
    try {
        const completeBooking = await Model.Booking.find(query)
            .populate([{ path: 'seviceTypeId' }, { path: 'userId' }, { path: 'userVehicleId' }, { path: 'driverId' }, { path: 'vehicleId' }, { path: 'promoId' }, { path: 'coDriverId' }])
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Model.Booking.countDocuments(query);
        const result = {
            completeBooking,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
        let apiResponse = Service.generate.generate(true, "Success", 200, result);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}


//GET PAIRED DRIVER ONLY FOR MAP
let getPairedDriverOnMap = async (req, res) => {
    const { page, limit } = req.query;
    //FILTER
    const query = { isDeleted: false, isPilot: true, isPairedDriver: true }
    try {
        const pairedDriver = await Model.Driver.find(query)
            .populate({ path: 'coDriverId' })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Model.Driver.countDocuments(query);
        const result = {
            pairedDriver,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
        let apiResponse = Service.generate.generate(true, "Success", 200, result);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}


//GET ACTIVE DRIVER ONLY LOCATION AND DETAILS
let getActiveDriverLocation = async (req, res) => {
    //FILTER
    const query = { isDeleted: false, activeStatus: true }
    try {
        const result = [];
        const activeDriver = await Model.Driver.find(query)
        for (let i = 0; i < activeDriver.length; i++) {
            const element = activeDriver[i];
            const data = {
                id: element._id,
                name: `${element.firstName} ${element.lastName}`,
                position: { lat: element.latitude, lng: element.longitude }
            }
            result.push(data)
        }

        let apiResponse = Service.generate.generate(true, "Success", 200, result);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}



//EXPORT ALL FUNCTIONS
module.exports = {
    getDriversOnMap: getDriversOnMap,
    getBookingOnMap: getBookingOnMap,
    getPairedDriverOnMap: getPairedDriverOnMap,
    getActiveDriverLocation: getActiveDriverLocation
}