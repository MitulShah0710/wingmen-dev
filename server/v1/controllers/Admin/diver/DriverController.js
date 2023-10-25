const Model = require('../../../../models/index');
const Service = require('../../../../services/index');
const Constant = require('../../../../Constant');
const Validation = require('../../../Validations/index');
const mongoose = require('mongoose');
const stripePay = require('stripe');
const config = require('../../../../config/config');
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);


//DRIVERS LIST
let getDrivers = async (req, res) => {
    const { page, limit, search, copilot, pilot } = req.query;
    const query = { isDeleted: false }
    if (copilot != undefined) {
        query.isCopilot = copilot
    }
    if (pilot != undefined) {
        query.isPilot = pilot
    }
    //SEARCH USER
    if (search != undefined) {
        query.$or = [
            {
                firstName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                lastName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                email: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    try {
        if (search) {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec()

            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        } else {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }

}

let getEventDrivers = async (req, res) => {
    const { page, limit, search, copilot, pilot } = req.query;
    const query = { isDeleted: false , available: true, activeStatus: true, isPilot: true}
    if (copilot != undefined) {
        query.isCopilot = copilot
    }
    if (pilot != undefined) {
        query.isPilot = pilot
    }
    //SEARCH USER
    if (search != undefined) {
        query.$or = [
            {
                firstName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                lastName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                email: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    try {
        if (search) {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec()

            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        } else {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }

}

let getEventCoDrivers = async (req, res) => {
    const { page, limit, search, copilot, pilot } = req.query;
    const query = { isDeleted: false , available: true, activeStatus: true, isCopilot: true}
    if (copilot != undefined) {
        // query.isCopilot = copilot
    }
    if (pilot != undefined) {
        // query.isPilot = pilot
    }
    //SEARCH USER
    if (search != undefined) {
        query.$or = [
            {
                firstName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                lastName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                email: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    try {
        if (search) {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec()
            console.log(driverList);
            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        } else {
            const driverList = await Model.Driver.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Model.Driver.countDocuments(query);
            const result = {
                driverList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
 
}

//DRIVER VIEW BY ID
let getDriverById = (req, res) => {
    Model.Driver.findById({ _id: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No Driver Found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'coDriverId' })
}

//DRIVER RIDE BOOKING LIST
let getDriverBookingList = (req, res) => {
    Model.Booking.find({ driverId: mongoose.Types.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No driver booking found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate([{ path: 'seviceTypeId' }, { path: 'userId' }, { path: 'userVehicleId' }, { path: 'coDriverId' }, { path: 'vehicleId' }, { path: 'promoId' }])
}


//GET DRIVER ALL TIME PAYMENT RECEVED LOG
let getDriverPaymentList = async (req, res) => {
    Model.DriverEaring.find({ driverId: mongoose.Types.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No driver earnings found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate([{ path: 'bookingId' }, { path: 'driverId' }, { path: 'userId' }])
}

//GET VEHICLE BY Driver
let getDriverVehicle = (req, res) => {
    Model.Vehicle.find({ driverId: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No card found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate([{ path: 'transmissionTypeId' }, { path: 'vehicleTypeId' }])
}

//DRIVER DEVICE TYPE VIEW
let getDriverDevice = (req, res) => {
    Model.Device.find({ driverId: mongoose.Types.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No device found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'driverId' })
}

//DRIVER STRIPE ACCOUNT DETAIL
let getDriverBankDetail = async (req, res) => {
    try {
        const account = await stripe.accounts.retrieve(
            req.body.stripeDriverId
        );
        const bankDetail = account.external_accounts.data

        let apiResponse = Service.generate.generate(true, "Success", 200, bankDetail);
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}


//UNPAIRED DRIVER AND CODRIVER
let unpairedDriver = async (req, res) => {
    try {
        if (req.body.driver === '' || req.body.coDriver === '') {
            let apiResponse = Service.generate.generate(true, Constant.required, 500);
            res.send(apiResponse);
        } else {
            const driverId = req.body.driver;
            const coDriverId = req.body.coDriver;

            const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverId) });
            if (!driverData) {
                res.ok(false, Constant.driverNotFound, {})
            }
            if (driverData && !driverData.isPairedDriver) {
                res.ok(false, Constant.driverAlreadyUnPaired, {})
            }
            const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(coDriverId) });
            if (!coDriverData) {
                res.ok(false, Constant.driverNotFound, {})
            }
            if (coDriverData && !coDriverData.isPairedDriver) {
                res.ok(false, Constant.driverAlreadyUnPaired, {})
            }
            const bookingData = await Model.Booking.find({
                $or: [
                    {
                        driverId: {
                            $in: [mongoose.Types.ObjectId(driverId),
                            mongoose.Types.ObjectId(coDriverId)]
                        }
                    },
                    {
                        coDriverId: {
                            $in: [mongoose.Types.ObjectId(driverId),
                            mongoose.Types.ObjectId(coDriverId)]
                        }
                    }],
                bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
            });
            if (bookingData && bookingData.length) {
                return res.ok(false, Constant.driverHasBusyOnBooking, {})
            }
            setObj = {
                isPairedDriver: false,
                coDriverId: null
            }
            await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(driverId) }, { $set: setObj }, { lean: true });
            setObj = {
                isPairedDriver: false,
                coDriverId: null
            }
            await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(coDriverId) }, { $set: setObj }, { lean: true });

            let apiResponse = Service.generate.generate(true, "Sucess", 200);
            res.send(apiResponse);
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}




//EXPORT ALL FUNCTIONS
module.exports = {
    getDrivers: getDrivers,
    getEventDrivers: getEventDrivers,
    getDriverById: getDriverById,
    getDriverBookingList: getDriverBookingList,
    getDriverVehicle: getDriverVehicle,
    getDriverPaymentList: getDriverPaymentList,
    getDriverDevice: getDriverDevice,
    getDriverBankDetail: getDriverBankDetail,
    unpairedDriver: unpairedDriver,
    getEventCoDrivers:getEventCoDrivers
}