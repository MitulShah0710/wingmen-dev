const Model = require('../../models/index');
const Service = require('../../services/index');
const Constant = require('../../Constant');
const Validation = require('../Validations/index');
const mongoose = require('mongoose');
const _ = require('lodash');
const randomstring = require('randomstring');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const driverController = require('./DriverController');
var { Parser } = require('json2csv');
const { model } = require('../../models/Otp');
const config = require('../../config/config');
const stripePay = require('stripe');
const { search } = require('../routes/userRotues');
const { deleted, FALSE } = require('../../Constant');
const { query } = require('express');
const { MobileList } = require('twilio/lib/rest/api/v2010/account/availablePhoneNumber/mobile');
const Booking = require('../../models/Booking');
const { Message } = require('twilio/lib/twiml/MessagingResponse');
const stripe = stripePay(config.stripKey);
// const stripeTest = stripePay(config.stripKeyTest);
// const stripe = stripePay(config.stripKeyTest);


exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateAdminProfile = updateAdminProfile;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.uploadFile = uploadFile;
exports.forgotChangePassword = forgotChangePassword;
exports.getDashboardCount = getDashboardCount;
exports.registerUser = registerUser;
exports.upadateUser = upadateUser;
exports.getAllUsers = getAllUsers;
exports.verifyBlockUnBlockDeltedUser = verifyBlockUnBlockDeltedUser;
exports.getAllVehicle = getAllVehicle;
exports.getAllVehicleUser = getAllVehicleUser;
exports.addVehicleType = addVehicleType;
exports.editVehicleType = editVehicleType;
exports.blockUnblockDeleteVehicleType = blockUnblockDeleteVehicleType;
exports.getVehicleType = getVehicleType;
exports.addServiceType = addServiceType;
exports.editServiceType = editServiceType;
exports.blockUnblockDeleteServiceType = blockUnblockDeleteServiceType;
exports.getServiceType = getServiceType;
exports.getAllBooking = getAllBooking;
exports.editBooking = editBooking;
exports.getBookingDetails = getBookingDetails;
exports.acceptedBookingStatus = acceptedBookingStatus;
exports.acceptedCancelCompleteEventBookingStatus = acceptedCancelCompleteEventBookingStatus;
exports.getAllNotification = getAllNotification;
exports.clearNotification = clearNotification;
exports.clearAllNotification = clearAllNotification;
exports.addPromo = addPromo;
exports.editPromoCode = editPromoCode;
exports.deleteBlockPromoCode = deleteBlockPromoCode;
exports.getAllPromo = getAllPromo;
exports.getRevenue = getRevenue;
exports.getAllDrivers = getAllDrivers;
exports.driverRegister = driverRegister;
exports.updateDriverProfile = updateDriverProfile;
exports.updateDocuments = updateDocuments;
exports.verifyBlockUnBlockDeltedDriver = verifyBlockUnBlockDeltedDriver;
exports.getAllVehicleDriver = getAllVehicleDriver;
exports.getAllAvailableDriver = getAllAvailableDriver;
exports.addVehicle = addVehicle;
exports.addTransmissionType = addTransmissionType;
exports.editTransmissionType = editTransmissionType;
exports.blockUnblockDeleteTransmissionType = blockUnblockDeleteTransmissionType;
exports.getTransmissionType = getTransmissionType;
exports.setAppVersion = setAppVersion;
exports.getAppVersion = getAppVersion;
exports.addTeam = addTeam;
exports.editTeam = editTeam;
exports.blockUnblockDeleteTeam = blockUnblockDeleteTeam;
exports.getTeam = getTeam;
exports.addEventType = addEventType;
exports.editEventType = editEventType;
exports.blockUnblockDeleteEventType = blockUnblockDeleteEventType;
exports.getEventType = getEventType;
// exports.addState = addState;
// exports.editState = editState;
// exports.blockUnblockDeleteState = blockUnblockDeleteState;
// exports.getState = getState;
exports.getContactUs = getContactUs;
exports.sendBulkNotification = sendBulkNotification;
exports.exportDriverCsv = exportDriverCsv;
exports.exportBookingCsv = exportBookingCsv;
exports.assignCoDriver = assignCoDriver;
exports.createBooking = createBooking;
exports.addZipCode = addZipCode;
exports.editZipCode = editZipCode;
exports.blockUnblockDeleteCity = blockUnblockDeleteCity;
exports.getZipCode = getZipCode;
exports.cancelBooking = cancelBooking;
exports.getAllDriverPaymentHistory = getAllDriverPaymentHistory
exports.getPayoutDriver = getPayoutDriver;
exports.createUserCard = createUserCard;
exports.deleteCardFromAdmin = deleteCardFromAdmin;
exports.getDriverPaymentHistoryById = getDriverPaymentHistoryById;
exports.getAllDriverPaymentHistoryByChoice = getAllDriverPaymentHistoryByChoice;
exports.createEventManager = createEventManager;
exports.getAllEventManager = getAllEventManager;
exports.editEventManager = editEventManager;
exports.deleteEventManager = deleteEventManager;
exports.getEventManagerById = getEventManagerById;
exports.getAllEventBooking = getAllEventBooking;
exports.getEventBookingById = getEventBookingById;
exports.editEventBooking = editEventBooking;
exports.getEventBookingList = getEventBookingList
exports.assignEventManager = assignEventManager;
exports.cancelEventBooking = cancelEventBooking;
exports.removeEventManager = removeEventManager;
exports.createTeam = createTeam;
exports.getTeamList = getTeamList;
exports.createTeamBooking = createTeamBooking;
exports.editTeamBooking = editTeamBooking;
exports.getAllTeamBookings = getAllTeamBookings;
exports.getTeamBookingById = getTeamBookingById;
exports.deleteTeamBooking = deleteTeamBooking;
exports.eventDriverRate = eventDriverRate;
exports.getDriverRate = getDriverRate;
exports.createCoDriverTeam = createCoDriverTeam;
exports.getCoDriverTeamList = getCoDriverTeamList;
exports.endEventBooking = endEventBooking;
exports.confirmEventBooking = confirmEventBooking;
exports.assignRideByAdmin = assignRideByAdmin;
exports.getAllEventManagerList = getAllEventManagerList;
exports.completeTeamBooking = completeTeamBooking;
exports.extraHoursAdded = extraHoursAdded;

async function exportDriverCsv(req, res) {
  try {
    let query = {};
    query.isDeleted = false;
    // query.profileStatus = 1;
    let pipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          driverType: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [{ $eq: ['$isPilot', false] },
                    { $eq: ['$isCopilot', false] }]
                  },
                  then: "Process"
                },
                { case: { $eq: ['$isPilot', true] }, then: "Pilot" },
                { case: { $eq: ['$isPilot', false] }, then: "Co-Pilot" },
              ],
              default: "Process"
            }
          }
        }
      }
    ]
    let users = await Model.Driver.aggregate(pipeline)
    // console.log({ users })
    const fields = [
      // {
      //     label: '_id',
      //     value: '_id'
      // },
      {
        label: 'First Name',
        value: 'firstName'
      },
      {
        label: 'Last Name',
        value: 'lastName'
      },
      {
        label: 'DOB',
        value: 'dob'
      },
      {
        label: 'License Number',
        value: 'licenceNumber'
      },
      {
        label: 'Issuing Date',
        value: 'issuingDate'
      },
      {
        label: 'Social Security Number',
        value: 'ssn'
      },
      {
        label: 'Country Code',
        value: 'countryCode'
      },
      {
        label: 'Phone',
        value: 'phone'
      },
      {
        label: 'Email',
        value: 'email'
      },
      {
        label: 'Gender',
        value: 'gender'
      },
      {
        label: 'Address',
        value: 'address'
      },
      {
        label: 'Driver Type',
        value: 'driverType'
      },
      {
        label: 'Average Rating',
        value: 'avgRating'
      },
      {
        label: 'Total Completed Booking',
        value: 'totalCompletedBooking'
      },
      {
        label: 'Is Approved',
        value: 'isApproved'
      }
    ]
    const json2csv = new Parser({ fields: fields })
    const csv = json2csv.parse(users)
    // res.attachment('users.csv')
    // res.status(200).send(csv)
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (e) {
    console.log({ e })
    return res.serverError(constant.SERVERERR);
  }
};
async function assignCoDriver(req, res) {
  try {
    let setObj = {};
    let driverId = null;
    let coDriverId = null;
    let { driverr, codriverr } = req.body;
    let criteria = {
      $or: [{ driverId: driverr }, { receiverId: codriverr }]
    }
    Model.PairedDriverRequest.deleteMany(criteria);
    const driver = await Model.Driver.findOne({ _id: driverr });
    if (!driver) {
      return res.ok(false, Constant.driverNotFound, {})
    }
    if (driver.isPilot) {
      driverId = driver._id;
      coDriverId = req.body.codriverr;
    } else {
      driverId = req.body.codriverr;
      coDriverId = driver._id;
    }
    const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverId) });
    if (!driverData) {
      return res.ok(false, Constant.driverNotFound, {})
    }
    if (driverData && driverData.isPairedDriver) {
      return res.ok(false, Constant.driverAlreadyPaired, {})
    }
    const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(coDriverId) });
    if (!coDriverData) {
      return res.ok(false, Constant.driverNotFound, {})
    }
    if (coDriverData && coDriverData.isPairedDriver) {
      return res.ok(false, Constant.driverAlreadyPaired, {})
    }
    if (driverData.isPilot == coDriverData.isPilot) {
      return res.ok(false, Constant.bothDriverPilot, {})
    }
    if (driverData.isCopilot == coDriverData.isCopilot) {
      return res.ok(false, Constant.bothDriverCopilot, {})
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
      isPairedDriver: true,
      coDriverId: coDriverId
    }
    await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(driverId) }, { $set: setObj }, { lean: true });
    setObj = {
      isPairedDriver: true,
      coDriverId: driverId
    }
    await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(coDriverId) }, { $set: setObj }, { lean: true });
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(driverr) })
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(codriverr) })
    // const isFavorite = await Model.FavoriteDriver.countDocuments({
    //     $or: [{ driverId: mongoose.Types.ObjectId(bookingData.firstName), favoriteDriverId: mongoose.Types.ObjectId(req.body.pairedDriverId) },
    //     { favoriteDriverId: mongoose.Types.ObjectId(req.user._id), driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) }]
    // })
    // let payload = {
    //     title: 'You are paired successfully.',
    //     message: Constant.bookingMessages.pired,
    //     eventType: Constant.eventType.pairedSuccessfullyNotification,
    //     driverId: req.user._id,
    //     driverData: driverData,
    //     coDriverData: coDriverData,
    //     receiverId: req.body.pairedDriverId,
    //     isDriverNotification: true,
    //     isNotificationSave: false,
    //     isFavorite: isFavorite ? true : false
    // };
    // if (coDriverData && coDriverData.isNotification) {
    //     const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) });
    //     if (coDriverDeviceData && coDriverDeviceData.length) {
    //         for (let i = 0; i < coDriverDeviceData.length; i++) {
    //             payload.token = coDriverDeviceData[i].deviceToken;
    //             if (coDriverDeviceData[i].deviceType == 'IOS') {
    //                 Service.PushNotificationService.sendIosPushNotification(payload);
    //             } else if (coDriverDeviceData[i].deviceType == 'ANDROID') {
    //                 Service.PushNotificationService.sendAndroidPushNotifiction(payload);
    //             }
    //         }
    //     }

    // }
    // payload.isNotificationSave = true;
    // payload.socketType = Constant.socketType.driver;
    // process.emit("sendNotificationToDriver", payload);
    return res.ok(true, null, {});
  } catch (error) {
    console.log({ error })
    return res.serverError(Constant.serverError);
  }
}
async function exportBookingCsv(req, res) {
  try {
    let pipeline = [
      {
        $sort: {
          "_id": -1
        }
      },
      {
        $lookup: {
          from: 'transmissiontypes',
          localField: 'transmissionTypeId',
          foreignField: '_id',
          as: 'transmissionTypeData'
        }
      },
      {
        $lookup: {
          from: 'eventtypes',
          localField: 'eventTypeId',
          foreignField: '_id',
          as: 'eventTypeData'
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'teamData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'coDriverId',
          foreignField: '_id',
          as: 'coDriverData'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleData'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'userVehicleId',
          foreignField: '_id',
          as: 'userVehicleData'
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'seviceTypeId',
          foreignField: '_id',
          as: 'seviceTypeData'
        }
      },
      {
        $project: {
          vehicleId: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          bookingNo: 1,
          adminId: 1,
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          seviceTypeId: 1,
          coDriverId: 1,
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          eventTypeData: { $arrayElemAt: ["$eventTypeData", 0] },
          teamData: { $arrayElemAt: ["$teamData", 0] },
          booKingAmount: 1,
          promoAmount: 1,
          totalDistance: 1,
          tripType: 1,
          note: 1,
          transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          dropUpAddressFirst: 1,
          isCompleteByCustomer: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          dropUpAddressFour: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          dropUplongitude: 1,
          pickUpAddress: 1,
          dropUpAddress: 1,
          bookingDate: 1,
          sheduledDate: 1,
          bookingStatus: 1,
          isAutoAllocated: 1,
          assignBy: 1,
          isSheduledBooking: 1,
          isCanceledByDriver: 1,
          isCanceledByCustomer: 1,
          isCanceledByAdmin: 1,
          isDriverRated: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          pendingAmount: 1,
          promoAmount: 1,
          booKingAmount: 1,
          promoAmount: 1,
          timezone: 1,
          eventName: 1,
          eventDescription: 1,
          block: 1,
          eventLocaltionLatitude: 1,
          eventLocaltionLongitude: 1,
          eventAddress: 1,
          isEventBooking: 1,
          isadminAccept: 1,
          isCanceledByAdmin: 1,
          eta: 1,
          totalDistanceInKm: 1,
          totalDistanceMiles: { $divide: ['$totalDistance', 1609] },
          paymentStatus: 1
          // totalDistanceMiles: { $multiply: [{ $divide: ['$totalDistance', 1609] }, 1000] },
          // totalDistanceMiles: { $divide: [{ $multiply: [{ $divide: ['$totalDistance', 1609] }, 1000] }, 1609] }
        }
      }
    ]
    let users = await Model.Booking.aggregate(pipeline)
    // console.log({ users })
    const fields = [
      // {
      //     label: '_id',
      //     value: '_id'
      // },
      {
        label: 'Source',
        value: 'pickUpAddress'
      },
      {
        label: 'Destination',
        value: 'dropUpAddress'
      },
      {
        label: 'Booking No',
        value: 'bookingNo'
      },
      {
        label: 'Booking Date',
        value: 'bookingDate'
      },
      {
        label: 'Booking Time',
        value: 'bookingDate'
      },
      {
        label: 'Total Amount ($)',
        value: 'totalAmount'
      },
      {
        label: 'Service Type',
        value: 'seviceTypeData.serviceName'
      },
      {
        label: 'User',
        value: 'userData.firstName'
      },
      {
        label: 'User Phone No.',
        value: 'userData.phone'
      },
      {
        label: 'Total Distance(Miles)',
        value: 'totalDistanceMiles'
      },
      {
        label: 'Passenger No',
        value: 'passengerNo'
      },
      {
        label: 'Total Duration (Minutes)',
        value: 'eta'
      }
    ]
    const json2csv = new Parser({ fields: fields })
    const csv = json2csv.parse(users)
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  } catch (e) {
    console.log({ e })
    return res.serverError(constant.SERVERERR);
  }
};
/*
ADMIN API'S
*/
async function generateRandomString(noOfChars) {
  return randomstring.generate(noOfChars);
};
async function register(req, res) {
  try {
    if (Validation.isAdminValidate.isAdminRegValid(req.body))
      return res.ok(false, Constant.required, null);
    const adminData = await Model.Admin.findOne({ $or: [{ email: req.body.email }] });
    if (adminData)
      return res.ok(false, Constant.userAlreadyExist, null);
    const encryptKey = await generateRandomString(5);
    let admin = await Model.Admin(req.body).save();
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(admin._id)
      , encryptKey: encryptKey
    });
    admin.set('token', 'SEA ' + tokenKey, { strict: false });
    await Model.Admin.findOneAndUpdate({ _id: admin._id }, { $set: { token: tokenKey || null } })

    return res.ok(true, null, admin);
  } catch (error) {
    console.log({ error });
    return res.serverError(Constant.serverError);
  }
};
async function login(req, res) {
  try {
    if (Validation.isAdminValidate.isLoginValid(req.body))
      return res.ok(false, Constant.required, null);
    const eventManagerData = await Model.EventManager.findOne({
      $or: [{ email: req.body.email, isDeleted: false  }],
    });
    const encryptKey = await generateRandomString(5);
    if (eventManagerData) 
    {
      bcrypt.compare(req.body.password, eventManagerData.password, async(error, match) => {
        if (error) {
          console.log("err",error);
        };
        if (!match)
        { 
          return res.ok(false, Constant.invalidPassword, null); 
        } 
          let tokenKey = Service.JwtService.issue({
            _id: Service.HashService.encrypt(eventManagerData._id),
            encryptKey: encryptKey,
          });
          eventManagerData.set("token", "SEM " + tokenKey, { strict: false });
          await Model.EventManager.findOneAndUpdate(
            { _id: eventManagerData._id },
            { $set: { token: tokenKey || null } }
          );
          return res.status(200).send({success: true, message:'SUCCESS', data: eventManagerData});
      });
    }else{
      const admin = await Model.Admin.findOne({ email: req.body.email });
      if (!admin) return res.ok(false, Constant.userNotFound, null);
      admin.comparePassword(req.body.password, async (match) => {
        if (!match) return res.ok(false, Constant.invalidPassword, null);
        let tokenKey = Service.JwtService.issue({
          _id: Service.HashService.encrypt(admin._id),
          encryptKey: encryptKey,
        });
        admin.set("token", "SEA " + tokenKey, { strict: false });
        await Model.Admin.findOneAndUpdate(
          { _id: admin._id },
          { $set: { token: tokenKey || null } }
        );
        return res.ok(true, null, admin);
      });
    }
  } 
  catch (error) {
    // console.log("catch");
    // console.log(error);
    // return res.ok(false, Constant.error, error);
  }
};
async function logout(req, res) {
  const encryptKey = await generateRandomString(5);
  let tokenKey = Service.JwtService.issue({
    _id: Service.HashService.encrypt(req.user._id), encryptKey: encryptKey
  })

  await Model.Admin.findOneAndUpdate({ _id: req.user._id }, { tokenKey: tokenKey }, {});
  return res.ok(true, null, {});
};
async function getProfile(req, res) {
  try {
    return res.ok(true, null, await Model.Admin.findOne({ _id: req.user._id }));
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function updateAdminProfile(req, res) {
  try {
    let setObj = {};
    if (req.body.cancelAmountInPercentage != undefined && req.body.cancelAmountInPercentage != null) {
      setObj.cancelAmountInPercentage = req.body.cancelAmountInPercentage || 0;
    }

    if (req.body.contactUsEmail != undefined && req.body.contactUsEmail != null) {
      setObj.contactUsEmail = req.body.contactUsEmail;
    }
    if (req.body.taxInPercentage != undefined && req.body.taxInPercentage != null) {
      setObj.taxInPercentage = req.body.taxInPercentage || 0;
    }
    if (req.body.timeToScheduled != undefined && req.body.timeToScheduled != null) {
      setObj.timeToScheduled = req.body.timeToScheduled || 0;
    }
    if (req.body.sharePercentage != undefined && req.body.sharePercentage != null) {
      setObj.sharePercentage = req.body.sharePercentage || 0;
    }
    if (req.body.driverSharePercentage != undefined && req.body.driverSharePercentage != null) {
      setObj.driverSharePercentage = req.body.driverSharePercentage || 0;
    }

    if (req.body.coDriverSharePercentage != undefined && req.body.coDriverSharePercentage != null) {
      setObj.coDriverSharePercentage = req.body.coDriverSharePercentage || 0;
    }
    if (req.body.driverPerKmCharge != undefined && req.body.driverPerKmCharge != null) {
      setObj.driverPerKmCharge = req.body.driverPerKmCharge || 0;
    }
    if (req.body.coDriverPerKmCharge != undefined && req.body.coDriverPerKmCharge != null) {
      setObj.coDriverPerKmCharge = req.body.coDriverPerKmCharge || 0;
    }
    if (req.body.baseFare != undefined && req.body.baseFare != null) {
      setObj.baseFare = req.body.baseFare || 0;
    }
    if (req.body.overflowFee !== undefined && req.body.overflowFee !== null) {
      setObj.overflowFee = req.body.overflowFee || 0;
    }
    if (req.body.name != undefined && req.body.name != null) {
      setObj.name = req.body.name || '';
    }
    if (req.body.area != undefined && req.body.area != null) {
      setObj.area = req.body.area || 0;
    }
    if (req.body.phone != undefined && req.body.phone != null) {
      setObj.phone = req.body.phone || 0;
    }
    if (req.body.address != undefined && req.body.address != null) {
      setObj.address = req.body.address || 0;
    }
    if (req.body.latitude && req.body.longitude) {
      setObj.latitude = req.body.latitude || 0;
      setObj.longitude = req.body.longitude || 0;
    }
    if (req.body.notesOfTripType != undefined && req.body.notesOfTripType != null) {
      setObj.notesOfTripType = req.body.notesOfTripType || '';
    }
    if (req.body.notesOfPassengers != undefined && req.body.notesOfPassengers != null) {
      setObj.notesOfPassengers = req.body.notesOfPassengers || '';
    }
    if (req.body.rideCancleAccepted != undefined && req.body.rideCancleAccepted != null) {
      setObj.rideCancleAccepted = req.body.rideCancleAccepted || '';
    }
    if (req.body.rideCancleArrived != undefined && req.body.rideCancleArrived != null) {
      setObj.rideCancleArrived = req.body.rideCancleArrived || '';
    }
    await Model.Admin.findOneAndUpdate({ _id: req.user._id }, { $set: setObj });
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function changePassword(req, res) {
  try {
    const admin = await Model.Admin.findOne({ _id: req.user._id });
    if (!admin) return res.ok(false, Constant.userNotFound, null);
    admin.comparePassword(req.body.password, match => {

      if (!match) return res.ok(false, 'You have entered an wrong old password.', null);
      admin.updatePass(req.body.newPassword).then(hash => {
        Model.Admin.updateOne({ _id: admin._id }, { password: hash }).then(() => {
          return res.ok(true, null, null);
        }).catch(error => {
          console.log(error);
          return res.serverError(Constant.serverError);
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getAllVehicle(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    let limit = parseInt(req.body.limit || 10);
    let skip = parseInt(req.body.skip || 0);
    if (req.body.isDriverVehicle != undefined) {
      query.isDriverVehicle = req.body.isDriverVehicle
    }
    if (req.body.search != undefined) {
      query.$or = [
        {
          vehicleName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleMake: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleModel: {
            $regex: req.body.search,
            $options: 'i',
          },
        }
      ];
    }
    const count = await Model.Vehicle.countDocuments(query);
    let pipeline = [];
    if (req.body._id && req.body._id.length == 24) {
      pipeline.push({ $match: { _id: mongoose.Types.ObjectId(req.body._id) } })
    }
    if (req.body.isDriverVehicle != undefined) {
      pipeline.push({ $match: { isDriverVehicle: req.body.isDriverVehicle } })
    }
    pipeline.push(
      { $match: { isDeleted: false } });
    if (req.body.search != undefined) {
      pipeline.push({
        $match: {
          '$or': [
            { 'vehicleName': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleMake': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleModel': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } }]
        }
      })
    }
    pipeline.push({
      $sort: {
        "createdAt": -1
      }
    },
      {
        "$skip": skip
      },
      {
        "$limit": limit
      },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleTypeData'
        }
      },
      {
        $lookup: {
          from: 'transmissiontypes',
          localField: 'transmissionTypeId',
          foreignField: '_id',
          as: 'transmissionTypeData'
        }
      },
      {
        $project: {
          "id": 1,
          "location": 1,
          "vehicleName": 1,
          "vehicleMake": 1,
          "vehicleModel": 1,
          "vehicleImage": 1,
          "license": 1,
          // "numberPlate":1,
          "documentThree": 1,
          "carLicense": 1,
          "insuranceDocuments": 1,
          "taxiPermit": 1,
          "vehicalRegistration": 1,
          "drivingCertificate": 1,
          "isLicenseUploaded": 1,
          "isNumberPlateUploaded": 1,
          "isCarLicenseUploaded": 1,
          "isInsuranceDocumentsUploaded": 1,
          "isTaxiPermitUploaded": 1,
          "isVehicalRegistrationUploaded": 1,
          "isDrivingCertificateUploaded": 1,
          "aboutCar": 1,
          "color": 1,
          "chassis": 1,
          "engine": 1,
          "steering": 1,
          "speed": 1,
          "passenger": 1,
          "isDriverVehicle": 1,
          "isDeleted": 1,
          "vehicleTypeId": 1,
          "userId": 1,
          "driverId": 1,
          "createdAt": 1,
          "vehicleTypeData": 1,
          "transmissionTypeData": 1,
          "transmissionTypeId": 1,
          "carFrontImage": 1,
          "carBackImage": 1,
          "carLeftImage": 1,
          "carRightImage": 1,
          "isCarFrontImageUploaded": 1,
          "isCarBackImageUploaded": 1,
          "isCarLeftImageUploaded": 1,
          "isCarRightImageUploaded": 1,
          "plateNumber": 1,
          "state": 1
        }
      });
    return res.success(true, null, await Model.Vehicle.aggregate(pipeline), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function forgotPassword(req, res) {
  try {
    if (Validation.isAdminValidate.isValidForgotPassword(req.body))
      return res.ok(false, Constant.required, {});
    const admin = await Model.Admin.findOne({ email: req.body.email, isDeleted: false, isBlocked: false });
    if (!admin)
      return res.ok(false, Constant.emailNotFound, {});
    const passwordResetToken = await generateRandomString(20);
    await Model.Admin.findOneAndUpdate({ _id: admin._id }, {
      $set: {
        passwordResetToken: passwordResetToken,
        passwordResetTokenDate: new Date()
      }
    });
    const payloadData = {
      email: req.body.email,
      passwordResetToken: passwordResetToken
    }
    Service.EmailService.AdminForgotEmail(payloadData);
    return res.ok(true, Constant.passwordResetLinkSendInYourEmail, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }

};
async function forgotChangePassword(req, res) {
  try {
    if (Validation.isAdminValidate.isValidForgotChangePassword(req.body))
      return res.ok(false, Constant.required, {});
    const admin = await Model.Admin.findOne({ passwordResetToken: req.body.passwordResetToken });
    if (!admin)
      return res.ok(false, Constant.invalidPasswordResetToken, null);
    const passwordResetToken = await generateRandomString(20);
    admin.updatePass(req.body.password).then(hash => {
      Model.Admin.updateOne({ _id: admin._id }, {
        password: hash,
        passwordResetToken: passwordResetToken
      }).then(() => {
        return res.ok(true, Constant.passwordChanged, null);
      }).catch(error => {
        console.log(error);
        return res.serverError(Constant.serverError);
      });
    });
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function uploadFile(req, res) {
  try {
    let data = {};
    if (req.file && req.file.filename) {
      data.orignal = `${Constant.driverDocumentImage}/${req.file.filename}`;
      data.thumbNail = `${Constant.driverDocumentImage}/${req.file.filename}`;
    }
    return res.ok(true, null, data);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};
/*
DASHBOARD COUNT API'S
*/
async function getDashboardCount(req, res) {
  try {
    let criteria = { isDeleted: false };
    let dataToSend = {
      countUser: 0,
      driverCount: 0,
      serviceTypeCount: 0,
      vehicleCount: 0,
      vehicleTypeCount: 0,
      totalEventBookingCount: 0,
      completedEventBookingCount: 0,
      cancelEventBookingCount: 0,
      totalTripBookingCount: 0,
      completedTripBookingCount: 0,
      cancelTripBookingCount: 0

    }
    criteria.isDeleted = false;
    const countUser = await Model.User.countDocuments(criteria);
    const driverCount = await Model.Driver.countDocuments(criteria);
    const serviceTypeCount = await Model.ServiceType.countDocuments(criteria);
    const vehicleCount = await Model.Vehicle.countDocuments(criteria);
    const vehicleTypeCount = await Model.VehicleType.countDocuments(criteria);

    criteria = { isDeleted: false, isEventBooking: true };
    const totalEventBookingCount = await Model.Booking.countDocuments(criteria);
    criteria.bookingStatus = Constant.bookingStatus.COMPLETED;
    const completedEventBookingCount = await Model.Booking.countDocuments(criteria);
    criteria.bookingStatus = Constant.bookingStatus.CANCELED;
    const cancelEventBookingCount = await Model.Booking.countDocuments(criteria);

    criteria = { isDeleted: false, isEventBooking: false };
    const totalTripBookingCount = await Model.Booking.countDocuments(criteria);
    criteria.bookingStatus = Constant.bookingStatus.COMPLETED;
    const completedTripBookingCount = await Model.Booking.countDocuments(criteria);
    criteria.bookingStatus = Constant.bookingStatus.CANCELED;
    const cancelTripBookingCount = await Model.Booking.countDocuments(criteria);

    dataToSend.countUser = countUser || 0;
    dataToSend.driverCount = driverCount || 0;
    dataToSend.serviceTypeCount = serviceTypeCount || 0;
    dataToSend.vehicleCount = vehicleCount || 0;
    dataToSend.vehicleTypeCount = vehicleTypeCount || 0;

    dataToSend.totalEventBookingCount = totalEventBookingCount || 0;
    dataToSend.completedEventBookingCount = completedEventBookingCount || 0;
    dataToSend.cancelEventBookingCount = cancelEventBookingCount || 0;

    dataToSend.totalTripBookingCount = totalTripBookingCount || 0;
    dataToSend.completedTripBookingCount = completedTripBookingCount || 0;
    dataToSend.cancelTripBookingCount = cancelTripBookingCount || 0;
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
USER API'S
*/
async function registerUser(req, res) {

  if (Validation.isAdminValidate.isUserSignUpValid(req.body))
    return res.ok(false, Constant.required, {});
  req.body.email = req.body.email.toLowerCase();
  if (req.body.email) {
    const emailUser = await Model.User.findOne({ email: req.body.email, isDeleted: false });
    if (emailUser) {
      return res.ok(false, Constant.emailAlreadyExist, null);
    }
  }

  if (req.body.phone) {
    const phoneUser = await Model.User.findOne({ phone: req.body.phone, isDeleted: false });
    if (phoneUser) {
      return res.ok(false, Constant.phoneAlreadyExist, null);
    }
  }
  req.body.image = '';
  if (req.file && req.file.filename) {
    req.body.image = `${Constant.userImage}/${req.file.filename}`;
  }
  req.body.isApproved = true;
  req.body, isVerified = true;
  req.body.profileStatus = 'COMPLETED';
  req.body.isPhoneVerified = true;
  req.body.singUpType = 'EMAIL';
  let coordinates = []
  let location = {}
  if (req.body.latitude && req.body.longitude) {
    coordinates.push(Number(req.body.longitude))
    coordinates.push(Number(req.body.latitude))
    location.type = "Point";
    location.coordinates = coordinates
  }

  req.body.location = location;

  try {
    const user = await new Model.User(req.body).save();
    return res.ok(true, null, user);
  } catch (error) {
    console.log(error);
  }
};
async function upadateUser(req, res) {
  if (Validation.isAdminValidate.isValidId(req.body))
    return res.ok(false, Constant.required, {});
  let UserData = await Model.User.findOne({
    _id: req.body._id
  });

  req.body.profileStatus = "COMPLETED";
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }
  if (req.file) req.body.image = `${Constant.userImage}/${req.file.filename}`;

  if (req.body.latitude || req.body.longitude) {
    let location = {
      coordinates: [req.body.latitude, req.body.longitude]
    }
    req.body.location = location
  }
  if (req.body.email) {
    const emailUser = await Model.User.findOne({ email: req.body.email, _id: { $nin: [req.body._id] }, isDeleted: false });
    if (emailUser) {
      return res.ok(false, Constant.emailAlreadyExist, null);
    }
  }
  if (req.body.phone) {
    const phoneUser = await Model.User.findOne({
      phone: req.body.phone,
      _id: { $nin: [req.body._id] }, isDeleted: false
    });
    if (phoneUser) {
      return res.ok(false, Constant.phoneAlreadyExist, null);
    }
  }

  await Model.User.findOneAndUpdate({ _id: req.body._id }, req.body);
  return res.ok(true, Constant.updateUser, {});

};
async function getAllUsers(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body.isApproved) query.isApproved = req.body.isApproved;
    if (req.body.isBlocked) query.isBlocked = req.body.isBlocked;
    if (req.body._id) query._id = req.body._id;
    if (req.body.search != undefined) {
      query.$or = [
        {
          firstName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
      ];
    }
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const count = await Model.User.countDocuments(query);
    if (skip === -1) {
      return res.success(true, null, await Model.User.find(query).populate({ path: 'userCard' }).sort({ createdAt: -1 }));
    }

    return res.success(true, null, await Model.User.find(query).limit(limit).skip(skip).populate({ path: 'userCard' }).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function verifyBlockUnBlockDeltedUser(req, res) {
  try {
    if (Validation.isAdminValidate.isValidId(req.body))
      return res.ok(false, Constant.required, null);
    console.log(req.body)
    let setObj = {};
    let message = null;
    if (req.body.isApproved != undefined) {
      setObj.isApproved = req.body.isApproved;
      message = req.body.isApproved ? Constant.aproveDriver : Constant.unAproveDriver;
    }
    if (req.body.isBlocked != undefined) {
      setObj.isBlocked = req.body.isBlocked;
      message = req.body.isBlocked ? Constant.blocked : Constant.UnBlocked;
    }
    if (req.body.isDeleted != undefined) {
      setObj.isDeleted = req.body.isDeleted;
      message = Constant.deleted;
    }
    if (req.body.isVerified != undefined) {
      setObj.isDeleted = req.body.isVerified;
      message = 'Verified Successfully';
    }
    await Model.User.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(req.body._id)
    }, { $set: setObj })
    const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(req.body._id) });
    return res.ok(true, message, userData)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getAllVehicleUser(req, res) {
  try {
    if (Validation.isAdminValidate.isValidUserId(req.body))
      return res.ok(false, Constant.required, null);
    const query = { isDeleted: false };
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    if (req.body.userId && req.body.userId.length == 24)
      query.userId = req.body.userId;
    query.isDriverVehicle = false;
    let limit = parseInt(req.body.limit || 10);
    let skip = parseInt(req.body.skip || 0);
    if (req.body.search != undefined) {
      query.$or = [
        {
          vehicleName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleMake: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleModel: {
            $regex: req.body.search,
            $options: 'i',
          },
        }
      ];
    }
    const count = await Model.Vehicle.countDocuments(query);
    let pipeline = [];
    if (req.body._id && req.body._id.length == 24) {
      pipeline.push({ $match: { _id: req.body._id } })
    }
    pipeline.push(
      { $match: { userId: mongoose.Types.ObjectId(req.body.userId) } },
      { $match: { isDeleted: false } });
    if (req.body.search != undefined) {
      pipeline.push({
        $match: {
          '$or': [
            { 'vehicleName': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleMake': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleModel': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } }]
        }
      })
    }
    pipeline.push(
      {
        $sort: {
          "createdAt": -1
        }
      },
      {
        "$skip": skip
      },
      {
        "$limit": limit
      },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleTypeData'
        }
      },
      {
        $lookup: {
          from: 'transmissiontypes',
          localField: 'transmissionTypeId',
          foreignField: '_id',
          as: 'transmissionTypeData'
        }
      },
      {
        $project: {
          "id": 1,
          "location": 1,
          "vehicleName": 1,
          "vehicleMake": 1,
          "vehicleModel": 1,
          "vehicleImage": 1,
          "license": 1,
          //  "numberPlate":1,
          "documentThree": 1,
          "carLicense": 1,
          "insuranceDocuments": 1,
          "taxiPermit": 1,
          "vehicalRegistration": 1,
          "drivingCertificate": 1,
          "isLicenseUploaded": 1,
          "isNumberPlateUploaded": 1,
          "isCarLicenseUploaded": 1,
          "isInsuranceDocumentsUploaded": 1,
          "isTaxiPermitUploaded": 1,
          "isVehicalRegistrationUploaded": 1,
          "isDrivingCertificateUploaded": 1,
          "aboutCar": 1,
          "color": 1,
          "chassis": 1,
          "engine": 1,
          "steering": 1,
          "speed": 1,
          "passenger": 1,
          "isDriverVehicle": 1,
          "isDeleted": 1,
          "vehicleTypeId": 1,
          "userId": 1,
          "createdAt": 1,
          "vehicleTypeData": 1,
          "transmissionTypeData": 1,
          "transmissionTypeId": 1,
          "carFrontImage": 1,
          "carBackImage": 1,
          "carLeftImage": 1,
          "carRightImage": 1,
          "isCarFrontImageUploaded": 1,
          "isCarBackImageUploaded": 1,
          "isCarLeftImageUploaded": 1,
          "isCarRightImageUploaded": 1,
          "plateNumber": 1,
          "state": 1
        }
      });
    return res.success(true, null, await Model.Vehicle.aggregate(pipeline), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
VEHICLE API'S
*/
async function addVehicleType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidAddVehicleType(req.body))
      return res.ok(false, Constant.required, {});
    let query = {
      vehicleTypeName: req.body.vehicleTypeName,
      isDeleted: false
    }
    const count = await Model.VehicleType.countDocuments(query);
    if (count) {
      return res.ok(false, Constant.vehicleTypeNameAlreadyExists, {});
    }
    const vehicleTypeData = await Model.VehicleType(req.body).save();
    return res.ok(true, null, vehicleTypeData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function editVehicleType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditVehicleType(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.vehicleTypeName != undefined && req.body.vehicleTypeName != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        vehicleTypeName: req.body.vehicleTypeName,
        isDeleted: false
      }
      const count = await Model.VehicleType.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.vehicleTypeNameAlreadyExists, {});
      }
    }
    await Model.VehicleType.findOneAndUpdate({ _id: req.body._id }, req.body);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteVehicleType(req, res) {
  try {
    const query = {};
    if (req.body._id && req.body._id.length == 24)
      query._id = mongoose.Types.ObjectId(req.body._id);
    await Model.VehicleType.findOneAndUpdate(query, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getVehicleType(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.VehicleType.countDocuments(query);
    return res.success(true, null, await Model.VehicleType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
SERVICE TYPE API'S
*/
async function addServiceType(req, res) {
  try {
    req.body.image = '';
    if (req.file && req.file.filename) {
      req.body.image = `${Constant.serviceTypeImage}/${req.file.filename}`;
    }
    if (Validation.isAdminValidate.isValidAddServiceType(req.body))
      return res.ok(false, Constant.required, {});
    let query = {
      serviceName: req.body.serviceName,
      isDeleted: false
    }
    const count = await Model.ServiceType.countDocuments(query);
    if (count) {
      return res.ok(false, Constant.serviceTypeNameAlreadyExists, {});
    }
    const vehicleTypeData = await Model.ServiceType(req.body).save();
    return res.ok(true, null, vehicleTypeData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function editServiceType(req, res) {
  try {

    if (req.file && req.file.filename) {
      req.body.image = `${Constant.serviceTypeImage}/${req.file.filename}`;
    }

    if (Validation.isAdminValidate.isValidEditServiceType(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.serviceName != undefined && req.body.serviceName != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        serviceName: req.body.serviceName,
        isDeleted: false
      }
      const count = await Model.ServiceType.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.serviceTypeNameAlreadyExists, {});
      }
    }
    await Model.ServiceType.findOneAndUpdate({ _id: req.body._id }, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteServiceType(req, res) {
  try {
    const query = {};
    if (!req.body._id || !req.body._id.length == 24)
      return res.ok(false, Constant.required, null);
    query._id = mongoose.Types.ObjectId(req.body._id);
    await Model.ServiceType.findOneAndUpdate(query, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getServiceType(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id)
      query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.ServiceType.countDocuments(query);
    return res.success(true, null, await Model.ServiceType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
BOOKING API'S
*/
async function editBooking(req, res) {
  try {
    let booking = await Model.Booking.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
    return res.ok(true, null, booking);
  } catch (error) {
    console.log({ error });
    return res.serverError(Constant.serverError);
  }
};
async function getAllBooking(req, res) {
  try {
    const query = { isDeleted: false };
    let pipeline = [];
    if (req.body.isBlocked) {
      query.isBlocked = req.body.isBlocked;
      pipeline.push({ $match: { isBlocked: req.body.isBlocked } });
    }
    if (req.body.isUpcommingbookings) {
      query.isSheduledBooking = true;
      query.bookingStatus = { $nin: ['COMPLETED', 'CANCELED'] };
      pipeline.push({ $match: { isSheduledBooking: true } });
      pipeline.push({ $match: { bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] } } });
    }
    if (req.body.isPastbookings) {
      query.bookingStatus = { $in: ['COMPLETED', 'CANCELED'] };
      pipeline.push({ $match: { bookingStatus: { $in: ['COMPLETED', 'CANCELED'] } } });
    }
    if (req.body.paymentStatus) {
      query.paymentStatus = req.body.paymentStatus.toUpperCase()
      pipeline.push({ $match: { paymentStatus: req.body.paymentStatus.toUpperCase() } });
    }
    if (req.body.driverId) {
      query.$or = [{ driverId: mongoose.Types.ObjectId(req.body.driverId) },
      { coDriverId: mongoose.Types.ObjectId(req.body.driverId) }]
      pipeline.push({
        $match: {
          $or: [{ driverId: mongoose.Types.ObjectId(req.body.driverId) },
          { coDriverId: mongoose.Types.ObjectId(req.body.driverId) }]
        }
      })
    }
    if (req.body.userId) {
      query.userId = mongoose.Types.ObjectId(req.body.userId);
      pipeline.push({ $match: { userId: mongoose.Types.ObjectId(req.body.userId) } });
    }
    if (req.body.isEventBooking != undefined && req.body.isEventBooking != null) {
      query.isEventBooking = req.body.isEventBooking ? true : false
      pipeline.push({ $match: { isEventBooking: query.isEventBooking } });
    }
    if (req.body._id && (req.body._id).length == 24) {
      query._id = req.body._id;
      pipeline.push({ $match: { _id: mongoose.Types.ObjectId(req.body._id) } });
    }
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    if (req.body.search != undefined && isNaN(req.body.search)) {
      req.body.search = 0
    }
    if (req.body.search != undefined) {
      query.$or = [
        {
          bookingNo: parseInt(req.body.search)
        }
      ];
    }
    if (req.body.search != undefined) {
      pipeline.push({
        $match: {
          '$or': [
            { 'bookingNo': parseInt(req.body.search) }]
        }
      })
    }
    if (req.body.startDate != undefined && req.body.endDate != undefined) {
      console.log(new Date());
      pipeline.push({
        $match: {
          $or: [
            {
              createdAt: {
                $gte: new Date(req.body.startDate),
                $lte: new Date(req.body.endDate)
              },
            },
          ]
        }
      })
    }

    pipeline.push(
      {
        $sort: {
          "_id": -1
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'transmissiontypes',
          localField: 'transmissionTypeId',
          foreignField: '_id',
          as: 'transmissionTypeData'
        }
      },
      {
        $lookup: {
          from: 'eventtypes',
          localField: 'eventTypeId',
          foreignField: '_id',
          as: 'eventTypeData'
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'teamData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'coDriverId',
          foreignField: '_id',
          as: 'coDriverData'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleData'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'userVehicleId',
          foreignField: '_id',
          as: 'userVehicleData'
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'seviceTypeId',
          foreignField: '_id',
          as: 'seviceTypeData'
        }
      },
      {
        $project: {
          vehicleId: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          bookingNo: 1,
          adminId: 1,
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          seviceTypeId: 1,
          coDriverId: 1,
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          eventTypeData: { $arrayElemAt: ["$eventTypeData", 0] },
          teamData: { $arrayElemAt: ["$teamData", 0] },
          booKingAmount: 1,
          promoAmount: 1,
          totalDistance: 1,
          tripType: 1,
          note: 1,
          transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          dropUpAddressFirst: 1,
          isCompleteByCustomer: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          dropUpAddressFour: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          dropUplongitude: 1,
          pickUpAddress: 1,
          dropUpAddress: 1,
          bookingDate: 1,
          sheduledDate: 1,
          bookingStatus: 1,
          isAutoAllocated: 1,
          assignBy: 1,
          isSheduledBooking: 1,
          isCanceledByDriver: 1,
          isCanceledByCustomer: 1,
          isCanceledByAdmin: 1,
          isDriverRated: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          pendingAmount: 1,
          promoAmount: 1,
          booKingAmount: 1,
          promoAmount: 1,
          timezone: 1,
          eventName: 1,
          eventDescription: 1,
          block: 1,
          eventLocaltionLatitude: 1,
          eventLocaltionLongitude: 1,
          eventAddress: 1,
          isEventBooking: 1,
          isadminAccept: 1,
          isCanceledByAdmin: 1,
          eta: 1,
          totalDistanceInKm: 1,
          paymentStatus: 1,
          createdAt: 1
        }
      }
    );
    const count = await Model.Booking.countDocuments(query);
    const bookingData = await Model.Booking.aggregate(pipeline);

    return res.success(true, null, bookingData, count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getBookingDetails(req, res) {
  try {
    if (Validation.isAdminValidate.isValidBookingDetails(req.body))
      return res.ok(false, Constant.required, null);

    const pipeline = [
      { $match: { _id: mongoose.Types.ObjectId(req.body._id) } },
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'vehicleId',
          foreignField: '_id',
          as: 'vehicleData'
        }
      },
      {
        $lookup: {
          from: 'vehicles',
          localField: 'userVehicleId',
          foreignField: '_id',
          as: 'userVehicleData'
        }
      },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleTypeData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'coDriverId',
          foreignField: '_id',
          as: 'coDriverData'
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'teamData'
        }
      },
      {
        $lookup: {
          from: 'eventtypes',
          localField: 'eventTypeId',
          foreignField: '_id',
          as: 'eventTypeData'
        }
      },
      {
        $lookup: {
          from: 'servicetypes',
          localField: 'seviceTypeId',
          foreignField: '_id',
          as: 'seviceTypeData'
        }
      },
      {
        $project: {
          vehicleId: 1,
          bookingNo: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          adminId: 1,
          seviceTypeId: 1,
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          vehicleTypeData: { $arrayElemAt: ["$vehicleTypeData", 0] },
          eventTypeData: { $arrayElemAt: ["$eventTypeData", 0] },
          teamData: { $arrayElemAt: ["$teamData", 0] },
          coDriverId: 1,
          isCompleteByCustomer: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          note: 1,
          dropUplongitude: 1,
          pickUpAddress: 1,
          dropUpAddress: 1,
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          droupUpLocationFirst: 1,
          dropUpAddressFirst: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          droupUpLocationSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          droupUpLocationThird: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          droupUpLocationFour: 1,
          dropUpAddressFour: 1,
          bookingDate: 1,
          sheduledDate: 1,
          bookingStatus: 1,
          isAutoAllocated: 1,
          assignBy: 1,
          isSheduledBooking: 1,
          isCanceledByDriver: 1,
          isCanceledByCustomer: 1,
          isCanceledByAdmin: 1,
          isDriverRated: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          pendingAmount: 1,
          timezone: 1,
          isDriverRequired: 1,
          isEventBooking: 1,
          eventName: 1,
          eventDescription: 1,
          block: 1,
          eventLocaltionLatitude: 1,
          eventLocaltionLongitude: 1,
          eventLocaltion: 1,
          eventAddress: 1,
          isTripAllocated: 1,
          eta: 1,
          totalDistanceInKm: 1,
          isEventBooking: true
        }
      }
    ];
    const bookingData = await Model.Booking.aggregate(pipeline);
    return res.success(true, null, bookingData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function acceptedBookingStatus(req, res) {
  try {
    let dataToSend = {};
    let setObj = {
      isadminAccept: true
    };
    let earingObj = {};
    let isSharePercentageDriverCoDriver = false;
    let saveObj = {
      bookingStatus: Constant.bookingStatus.ACCEPTED,
      statusMoveByUser: true
    };
    let driverData = null;
    let coDriverData = null;

    if (Validation.isAdminValidate.isValidDriverAcceptBooking(req.body))
      return res.ok(false, Constant.required, null);
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false },
      {
        area: 1,
        sharePercentage: 1,
        driverSharePercentage: 1,
        coDriverSharePercentage: 1
      }, {})
    setObj.bookingStatus = Constant.bookingStatus.ACCEPTED;

    let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus != Constant.bookingStatus.PENDING) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    const bookingDataCount = await Model.Booking.countDocuments({
      _id: { $nin: [mongoose.Types.ObjectId(bookingData._id)] },
      userId: mongoose.Types.ObjectId(bookingData.userId),
      bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] },
      isTripAllocated: true
    });
    if (bookingDataCount) {
      return res.ok(false, Constant.userAlreadyInAnotherTrip, null);
    }
    let criteria = {
      _id: req.body.driverId,
      available: true,
      isApproved: true,
      activeStatus: true,
      isBlocked: false,
      isDeleted: false,
      driverLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [bookingData.pickUplongitude,
            bookingData.pickUplatitude
            ]
          },
          $minDistance: 0,
          $maxDistance: adminData ? adminData.area : 500
        }
      }
    };

    let driverDataCheck = await Model.Driver.find(criteria, { __V: 0, password: 0 }, {})
    if (!driverDataCheck) {
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1885" });
    }
    let driver = await Model.Driver.findOne({ _id: req.body.driverId });
    console.log("--------------")
    console.log(driver)
    if (!driver) {
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1891" });
    }
    //2606
    /*if (driver.isPilot && driver.isPairedDriver) {
      console.log("check1")
      return res.ok(false, Constant.notAllowedAcceptBooking, {"A" : "no driver 1896"});
    }*/
    if (driver.isPilot) {
      driverData = driver;
      coDriverData = await Model.Driver.findOne({ coDriverId: mongoose.Types.ObjectId(driver._id) });
    } else {
      coDriverData = driver;
      if (coDriverData)
        driverData = await Model.Driver.findOne({ coDriverId: mongoose.Types.ObjectId(driver._id) });
    }
    //1806
    // if (bookingData.isDriverRequired && driverData && (!driverData.isPilot || !driverData.isPairedDriver)) {
    if (bookingData.isDriverRequired && driverData && (!driverData.isPilot || driverData.isPairedDriver)) {
      console.log("check2")
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1908" });
    }
    if (bookingData.isCoDriverRequired && !coDriverData.isCopilot) {
      console.log("check3")
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1912" });
    }
    if (bookingData.isDriverRequired && bookingData.isCoDriverRequired &&
      (!coDriverData.isCopilot || !coDriverData.isPairedDriver)) {
      console.log("check4")
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1917" });
    }
    if (driverData) {
      let vehicleData = await Model.Vehicle.findOne({ driverId: mongoose.Types.ObjectId(driverData._id) });
      if (vehicleData) {
        setObj.vehicleId = vehicleData._id;
        setObj.vehicleTypeId = vehicleData.vehicleTypeId;
        setObj.transmissionTypeId = vehicleData.transmissionTypeId;
      }
    }
    if (driverData && coDriverData) {
      setObj.driverId = driverData._id;
      setObj.coDriverId = coDriverData._id;
    } else if (driverData) {
      setObj.driverId = driverData._id;
    } else if (coDriverData) {
      setObj.coDriverId = coDriverData._id;
    }
    if (driverData) {
      let checkAvailabelty = await driverController.driverAvailabelStausCheck(driverData);
      if (!checkAvailabelty) {
        console.log("check5")
        return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1939" });
      }
    }
    if (coDriverData) {
      let checkAvailabelty = await driverController.driverAvailabelStausCheck(coDriverData);
      if (!checkAvailabelty) {
        console.log("check6")
        return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 1946" });
      }
    }
    const userData = await Model.User.findOne({ _id: bookingData.userId });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    if (bookingData.paymentMode == Constant.paymentMode.wallet ||
      bookingData.paymentMode == Constant.paymentMode.cash) {
      //  setObj.paymentStatus=Constant.paymentStatus.completed;
    }
    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    //  if(bookingData.paymentMode==Constant.paymentMode.wallet){
    //      if(bookingData.totalAmount<=userData.walletAmount){
    //         await Model.User.update({_id: mongoose.Types.ObjectId(bookingData.userId)},
    //             {$inc:{walletAmount:-(bookingData.totalAmount)}});
    //      }else{
    //         await Model.User.findOneAndUpdate({_id: bookingData.userId},
    //             {$inc:{pendingAmount:(bookingData.totalAmount)}});
    //      }
    //  }
    if (driverData) {
      await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalBooking: 1 } });
      saveObj.driverId = driverData._id;
      await driverController.driverAvailabelStausUpdate(driverData);
    }
    if (coDriverData) {
      await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalBooking: 1 } });
      saveObj.coDriverId = coDriverData._id;
      await driverController.driverAvailabelStausUpdate(coDriverData);
    }
    saveObj.bookingId = bookingData._id;

    await Model.BookingDriverHistory(saveObj).save();
    await Model.BookingDriverRequestLog(saveObj).save();
    bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    if (bookingData && bookingData.isDriverRequired && bookingData.driverId != null &&
      bookingData && bookingData.isCoDriverRequired && bookingData.coDriverId != null) {
      isSharePercentageDriverCoDriver = true;
    }
    if (bookingData && bookingData.isDriverRequired && bookingData.driverId != null) {
      earingObj = {};
      let driverEarningAmount = 0;
      let driverSharePercentage = adminData.driverSharePercentage || 0;
      if (isSharePercentageDriverCoDriver) {
        driverSharePercentage = adminData.coDriverSharePercentage || 0;
      }
      driverEarningAmount = ((bookingData.actualAmount) * driverSharePercentage) / 100
      earingObj.bookingId = bookingData._id;
      earingObj.driverId = bookingData.driverId;
      earingObj.userId = bookingData.userId;
      earingObj.bookingStatus = bookingData.bookingStatus;
      earingObj.paymentMode = bookingData.paymentMode;
      earingObj.paymentStatus = bookingData.paymentStatus;
      earingObj.bookingDate = bookingData.bookingDate;
      earingObj.bookingCreatedDate = bookingData.createdAt;
      earingObj.driverEarningAmount = parseFloat((driverEarningAmount).toFixed(2));
      earingObj.isDriver = true;
      await Model.DriverEaring(earingObj).save();
    }
    if (bookingData && bookingData.isCoDriverRequired && bookingData.coDriverId != null) {
      earingObj = {};
      let driverEarningAmount = 0;
      let driverSharePercentage = adminData.driverSharePercentage || 0;
      if (isSharePercentageDriverCoDriver) {
        driverSharePercentage = adminData.coDriverSharePercentage || 0;
      }
      driverEarningAmount = ((bookingData.actualAmount) * driverSharePercentage) / 100
      earingObj.bookingId = bookingData._id;
      earingObj.driverId = bookingData.coDriverId;
      earingObj.userId = bookingData.userId;
      earingObj.bookingStatus = bookingData.bookingStatus;
      earingObj.paymentMode = bookingData.paymentMode;
      earingObj.paymentStatus = bookingData.paymentStatus;
      earingObj.bookingDate = bookingData.bookingDate;
      earingObj.bookingCreatedDate = bookingData.createdAt;
      earingObj.driverEarningAmount = parseFloat((driverEarningAmount).toFixed(2));
      earingObj.isCoDriver = true;
      await Model.DriverEaring(earingObj).save();
    }

    let payload = {
      title: Constant.bookingMessages.tripAcceptedByAdmin,
      message: Constant.bookingMessages.tripAcceptedByAdmin,
      eventType: Constant.eventType.driverAcceptBooking,
      driverId: req.user._id,
      driverData: driverData,
      coDriverData: coDriverData,
      userData: userData,
      bookingId: bookingData._id,
      receiverId: userData._id,
      isUserNotification: true,
      isNotificationSave: false
    };
    if (userData && userData.isNotification) {
      const userDeviceData = await Model.Device.find({ userId: mongoose.Types.ObjectId(userData._id) });
      if (userDeviceData && userDeviceData.length) {
        for (let i = 0; i < userDeviceData.length; i++) {
          payload.token = userDeviceData[i].deviceToken;
          if (userDeviceData[i].deviceType == 'IOS') {
            Service.PushNotificationService.sendIosPushNotification(payload);
          } else if (userDeviceData[i].deviceType == 'ANDROID') {
            Service.PushNotificationService.sendAndroidPushNotifiction(payload);
          }
        }
      }

    }
    payload.isNotificationSave = true;
    payload.socketType = Constant.socketType.user;
    payload.bookingData = bookingData;
    process.emit("sendNotificationToUser", payload);
    payload = {
      title: Constant.bookingMessages.tripAcceptedByAdminAssignYou,
      message: Constant.bookingMessages.tripAcceptedByAdminAssignYou,
      eventType: Constant.eventType.tripAcceptedByAdminAssignYou,
      userId: req.user._id,
      driverData: bookingData.driverId ? driverData : {},
      coDriverData: bookingData.coDriverId ? coDriverData : {},
      userData: userData,
      bookingId: bookingData._id,
      isDriverNotification: true,
      isNotificationSave: false
    };
    if (bookingData.driverId) {
      payload.receiverId = bookingData.driverId;
      if (driverData && driverData.isNotification) {
        const driverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.driverId) });
        if (driverDeviceData && driverDeviceData.length) {
          for (let i = 0; i < driverDeviceData.length; i++) {
            payload.token = driverDeviceData[i].deviceToken;
            if (driverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (driverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }

      }
      payload.bookingData = bookingData;
      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }
    if (bookingData.coDriverId) {
      payload.receiverId = bookingData.coDriverId;
      if (coDriverData && coDriverData.isNotification) {
        const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.coDriverId) });
        if (coDriverDeviceData && coDriverDeviceData.length) {
          for (let i = 0; i < coDriverDeviceData.length; i++) {
            payload.token = coDriverDeviceData[i].deviceToken;
            if (coDriverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (coDriverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }
      }
      payload.bookingData = bookingData;
      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function cancelBooking(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let driverData = null;
    let coDriverData = null;
    let saveObj = {};
    let message = Constant.bookingMessages.canceledBookingByUser;
    let eventType = Constant.eventType.default;
    if (Validation.isUserValidate.isValidCancelBooking(req.body))
      return res.ok(false, Constant.required, null);
    let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    // const userData = await Model.User.findOne({ _id: req.user._id });
    // if (!userData) {
    //   return res.ok(false, Constant.userNotFound, null);
    // }
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus == Constant.bookingStatus.CANCELED) {
      return res.ok(false, Constant.alreadyCanceledBookingStatus, null);
    }
    if (!(bookingData.bookingStatus == Constant.bookingStatus.PENDING ||
      bookingData.bookingStatus == Constant.bookingStatus.ACCEPTED)) {
      return res.ok(false, Constant.notAllowedCanceledBookingStatus, null);
    }
    if (bookingData.driverId) {
      driverData = await Model.Driver.findOne({ _id: bookingData.driverId });
      saveObj.driverId = driverData._id;
    }
    if (bookingData.coDriverId) {
      coDriverData = await Model.Driver.findOne({ _id: bookingData.coDriverId });
      saveObj.coDriverId = coDriverData._id;
    }

    if (driverData)
      await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCanceledBooking: 1 } });
    if (coDriverData)
      await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCanceledBooking: 1 } });

    if (bookingData.paymentMode == Constant.paymentMode.wallet ||
      bookingData.paymentMode == Constant.paymentMode.card) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $inc: { walletAmount: ((bookingData.totalAmount - bookingData.cancelAmount)) } });
    }
    if (bookingData.paymentMode == Constant.paymentMode.cash) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $inc: { walletAmount: ((bookingData.walletAmount - bookingData.cancelAmount)) } });
    }
    setObj.bookingStatus = Constant.bookingStatus.CANCELED;
    setObj.isCanceledByAdmin = true;

    saveObj.bookingStatus = setObj.bookingStatus;
    saveObj.statusMoveByUser = true;
    saveObj.bookingId = bookingData._id;

    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    if (driverData || coDriverData) {
      await Model.BookingDriverHistory(saveObj).save();
      await Model.BookingDriverRequestLog(saveObj).save();
    }
    if (bookingData.driverId) {
      await driverController.driverAvailabelStausUpdate(driverData);
    }
    if (bookingData.coDriverId) {
      await driverController.driverAvailabelStausUpdate(coDriverData);
    }

    bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    let earningObj = {
      bookingStatus: bookingData.bookingStatus
    }
    await Model.DriverEaring.update({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) },
      { $set: earningObj }, { lean: true, multi: true });

    await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
    let payload = {
      title: message,
      message: message,
      eventType: Constant.eventType.userCancelBooking,
      // userId: req.user._id,
      driverData: bookingData.driverId ? driverData : {},
      coDriverData: bookingData.coDriverId ? coDriverData : {},
      // userData: userData,
      bookingId: bookingData._id,
      isDriverNotification: true,
      isNotificationSave: false
    };
    if (bookingData.driverId) {
      payload.receiverId = bookingData.driverId;
      if (driverData && driverData.isNotification) {
        const driverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.driverId) });
        if (driverDeviceData && driverDeviceData.length) {
          for (let i = 0; i < driverDeviceData.length; i++) {
            payload.token = driverDeviceData[i].deviceToken;
            if (driverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (driverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }
      }

      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }
    if (bookingData.coDriverId) {
      payload.receiverId = bookingData.coDriverId;
      if (coDriverData && coDriverData.isNotification) {
        const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.coDriverId) });
        if (coDriverDeviceData && coDriverDeviceData.length) {
          for (let i = 0; i < coDriverDeviceData.length; i++) {
            payload.token = coDriverDeviceData[i].deviceToken;
            if (coDriverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (coDriverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }
      }
      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }

    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function acceptedCancelCompleteEventBookingStatus(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let message = '';
    let eventType = Constant.eventType.default;
    if (Validation.isAdminValidate.isValidChangeEventBookingStatus(req.body))
      return res.ok(false, Constant.required, null);
    let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    if (!bookingData) {
      return res.ok(false, Constant.eventNoLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus == req.body.bookingStatus) {
      return res.ok(false, Constant.alreadyChangedEventBookingStatus, null);
    }
    const userData = await Model.User.findOne({ _id: bookingData.userId });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    switch (req.body.bookingStatus) {
      case Constant.bookingStatus.ACCEPTED:
        setObj.bookingStatus = Constant.bookingStatus.ACCEPTED;
        setObj.isadminAccept = true;
        message = Constant.bookingMessages.adminAcceptEventBooking;
        eventType = Constant.eventType.adminAcceptBooking;
        break;
      case Constant.bookingStatus.CANCELED:
        setObj.bookingStatus = Constant.bookingStatus.CANCELED;
        setObj.isCanceledByAdmin = true;
        eventType = Constant.eventType.adminCancelBooking;
        message = Constant.bookingMessages.adminCanceledEventBooking;
        break;
      case Constant.bookingStatus.COMPLETED:
        setObj.bookingStatus = Constant.bookingStatus.COMPLETED;
        eventType = Constant.eventType.adminCompletedBooking;
        message = Constant.bookingMessages.adminCompletedEventBooking;
        break;
      default:
        break;
    }
    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });

    let payload = {
      title: message,
      message: message,
      eventType: eventType,
      adminId: req.user._id,
      userData: userData,
      bookingId: bookingData._id,
      receiverId: userData._id,
      isUserNotification: true,
      isNotificationSave: false
    };
    if (userData && userData.isNotification) {
      const userDeviceData = await Model.Device.find({ userId: mongoose.Types.ObjectId(userData._id) });
      if (userDeviceData && userDeviceData.length) {
        for (let i = 0; i < userDeviceData.length; i++) {
          payload.token = userDeviceData[i].deviceToken;
          if (userDeviceData[i].deviceType == 'IOS') {
            Service.PushNotificationService.sendIosPushNotification(payload);
          } else if (userDeviceData[i].deviceType == 'ANDROID') {
            Service.PushNotificationService.sendAndroidPushNotifiction(payload);
          }
        }
      }
    }

    payload.isNotificationSave = true;
    payload.bookingData = bookingData;
    payload.socketType = Constant.socketType.user;
    process.emit("sendNotificationToUser", payload);
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

/*Create Booking*/

async function createBooking(req, res) {
  try {
    // req.body.userId = req.user._id;
    let promoCodeData = null;
    let promoAmount = 0;
    let isSharePercentageDriverCoDriver = false;
    console.log("createBooking#######", req.body)
    if (Validation.isUserValidate.isValidCreateBooking(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.totalDistance) {
      req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1000;
    } else {
      req.body.totalDistanceInKm = 0;
    }
    if (!req.body.isSheduledBooking) {
      req.body.bookingDate = moment().utc();
    }
    if (req.body.isSheduledBooking &&
      req.body.bookingDate && (new Date(req.body.bookingDate) == "Invalid Date"
        || moment().diff(req.body.bookingDate, 'seconds') > 0)) {
      return res.ok(false, Constant.backDateNotAllowed, {});
    }
    req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone || 330, 'm')
    const userData = await Model.User.findOne({ _id: req.body.userId });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
    if (!adminData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const serviceData = await Model.ServiceType.findOne({ _id: req.body.seviceTypeId, isDeleted: false, isBlocked: false });
    if (!serviceData) {
      return res.ok(false, Constant.serviceTypeNotFound, null);
    }
    let vehicleData = await Model.Vehicle.findOne({
      _id: req.body.vehicleId,
      // userId: req.body.userId,
      isDeleted: false, isBlocked: false
    });
    if (!vehicleData) {
      return res.ok(false, Constant.vehicleNotFound, null);
    }
    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      let referralCodeData = await Model.User.findOne({
        _id: { $nin: [mongoose.Types.ObjectId(req.body.userId)] },
        referralCode: userData.referralUserCode
      });
      if (referralCodeData) {
        // let referralCodeUsedData=await Model.Booking.findOne({_id:req.user._id,
        //     referralCode:req.body.referralCode});
        // if(referralCodeUsedData){
        //     return res.ok(false, Constant.referralCodeUsed, null);
        // }else{
        req.body.referralUserId = referralCodeData._id;
        req.body.referralCode = userData.referralUserCode;
        req.body.isReferralCodeUsed = true;
        //}
      } else {
        return res.ok(false, Constant.invalidReferral, null);
      }
    }
    if (req.body.promoCode) {
      promoCodeData = await Model.PromoCode.findOne({
        promoCode: req.body.promoCode,
        isBlocked: false, isDeleted: false
      });
      if (promoCodeData) {
        if (promoCodeData.noOfPromoUsers && promoCodeData.individualUserPromoAttempt) {
          const promoCountUsed = await Model.Booking.countDocuments({
            promoId: mongoose.Types.ObjectId(promoCodeData._id)
          });
          if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
            return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
          }
          const promoCountUsedByUser = await Model.Booking.countDocuments({
            userId: mongoose.Types.ObjectId(req.body.userId),
            promoId: mongoose.Types.ObjectId(promoCodeData._id)
          });
          if (promoCountUsedByUser >= promoCodeData.individualUserPromoAttempt) {
            return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
          }
        }
        if (promoCodeData.isExpireDateAdded && promoCodeData.expireDate) {
          if (moment(promoCodeData.ui).diff(moment().utc()) < 1) {
            return res.ok(false, Constant.promoCodeExpired, null);
          }
        }
        req.body.isPromoApply = true;
        req.body.promoId = promoCodeData ? promoCodeData._id : null;
      } else {
        return res.ok(false, Constant.inValidPromoCode, null);
      }
    }
    let pickUpCoordinates = [];
    let pickUpLocation = {};
    if (req.body.pickUplatitude && req.body.pickUplongitude) {
      pickUpCoordinates.push(Number(req.body.pickUplongitude))
      pickUpCoordinates.push(Number(req.body.pickUplatitude))
      pickUpLocation.type = "Point";
      pickUpLocation.coordinates = pickUpCoordinates;
      req.body.pickUpLocation = pickUpLocation;
    }
    if (req.body.pickUpAddress) {
      req.body.pickUpAddress = req.body.pickUpAddress;
    }
    let droupUpCoordinates = [];
    let droupUpLocation = {};
    if (req.body.dropUplatitude && req.body.dropUplongitude) {
      droupUpCoordinates.push(Number(req.body.dropUplongitude))
      droupUpCoordinates.push(Number(req.body.dropUplatitude))
      droupUpLocation.type = "Point";
      droupUpLocation.coordinates = droupUpCoordinates;
      req.body.droupUpLocation = droupUpLocation;
    }
    if (req.body.dropUpAddress) {
      req.body.dropUpAddress = req.body.dropUpAddress;
    }
    let droupUpCoordinatesFirst = [];
    let droupUpLocationFirst = {};
    if (req.body.dropUplatitudeFirst && req.body.dropUplongitudeFirst) {
      droupUpCoordinatesFirst.push(Number(req.body.dropUplongitudeFirst))
      droupUpCoordinatesFirst.push(Number(req.body.dropUplatitudeFirst))
      droupUpLocationFirst.type = "Point";
      droupUpLocationFirst.coordinates = droupUpCoordinatesFirst;
      req.body.droupUpLocationFirst = droupUpLocationFirst;
    }
    if (req.body.dropUpAddressFirst) {
      req.body.dropUpAddressFirst = req.body.dropUpAddressFirst;
    }
    let droupUpCoordinateSecond = [];
    let droupUpLocationSecond = {};
    if (req.body.dropUplatitudeSecond && req.body.dropUplongitudeSecond) {
      droupUpCoordinateSecond.push(Number(req.body.dropUplongitudeSecond))
      droupUpCoordinateSecond.push(Number(req.body.dropUplatitudeSecond))
      droupUpLocationSecond.type = "Point";
      droupUpLocationSecond.coordinates = droupUpCoordinateSecond;
      req.body.droupUpLocationSecond = droupUpLocationSecond;
    }
    if (req.body.dropUpAddressSecond) {
      req.body.dropUpAddressSecond = req.body.dropUpAddressSecond;
    }
    let droupUpCoordinateThird = [];
    let droupUpLocationThird = {};
    if (req.body.dropUplatitudeThird && req.body.dropUplongitudeThird) {
      droupUpCoordinateThird.push(Number(req.body.dropUplongitudeThird))
      droupUpCoordinateThird.push(Number(req.body.dropUplatitudeThird))
      droupUpLocationThird.type = "Point";
      droupUpLocationThird.coordinates = droupUpCoordinateThird;
      req.body.droupUpLocationThird = droupUpLocationThird;
    }
    if (req.body.dropUpAddressThird) {
      req.body.dropUpAddressThird = req.body.dropUpAddressThird;
    }
    let droupUpCoordinateFour = [];
    let droupUpLocationFour = {};
    if (req.body.dropUplatitudeFour && req.body.dropUplongitudeFour) {
      droupUpCoordinateFour.push(Number(req.body.dropUplongitudeFour))
      droupUpCoordinateFour.push(Number(req.body.dropUplatitudeFour))
      droupUpLocationFour.type = "Point";
      droupUpLocationFour.coordinates = droupUpCoordinateFour;
      req.body.droupUpLocationFour = droupUpLocationFour;
    }
    if (req.body.dropUpAddressFour) {
      req.body.dropUpAddressFour = req.body.dropUpAddressFour;
    }
    // if (req.body.passengerNo > 0) {
    // if (req.body.passengerNo === 'YES') {
    //   req.body.isCoDriverRequired = true;
    //   req.body.isDriverRequired = true;
    // } else {
    //   req.body.isCoDriverRequired = true;
    // }
    switch (req.body.tripType) {
      case Constant.tripType.roundTrip:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = false;
        req.body.tripType = Constant.tripType.roundTrip;
        req.body.isRoundTrip = true;
        break;
      case Constant.tripType.singleTrip:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = true;
        req.body.tripType = Constant.tripType.singleTrip;
        req.body.isSingleTrip = true;
        break;
      default:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = false;
        req.body.tripType = Constant.tripType.singleTrip;
        req.body.isSingleTrip = true;
        break;
    }
    switch (req.body.paymentMode) {
      case Constant.paymentMode.cash:
        req.body.paymentMode = Constant.paymentMode.cash;
        req.body.isCashMode = true;
        break;
      case Constant.paymentMode.card:
        req.body.paymentMode = Constant.paymentMode.card;
        req.body.isCashMode = false;
        break;
      case Constant.paymentMode.wallet:
        req.body.paymentMode = Constant.paymentMode.wallet;
        req.body.isCashMode = false;
        break;
      default:
        req.body.paymentMode = Constant.paymentMode.cash;
        req.body.isCashMode = true;
        break;
    }

    // if (req.body.passengerNo > 0) {
    // if (req.body.passengerNo === 'YES') {
    if (req.body.tripType === Constant.tripType.singleTrip) {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
        parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat((adminData.baseFare || 0).toFixed(2));
      }
    } else {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat((adminData.baseFare || 0).toFixed(2));
      }
    }
    if (req.body.isPromoApply) {
      if (promoCodeData.isCash) {
        promoAmount = promoCodeData.cashback;
      } else {
        promoAmount = parseFloat((parseFloat(req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
      }
      req.body.promoAmount = parseFloat((promoAmount).toFixed(2));
    }
    if (userData && userData.pendingAmount) {
      req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount - promoAmount);
    } else {
      req.body.totalAmount = parseFloat(req.body.booKingAmount - promoAmount);
    }

    req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
    req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
    req.body.cancelAmount = parseFloat(((req.body.booKingAmount * adminData.cancelAmountInPercentage) / 100).toFixed(2));

    if (req.body.totalAmount < 0) {
      req.body.totalAmount = 0;
    }
    req.body.actualAmount = req.body.totalAmount;
    if (req.body.isDriverRequired && req.body.driverId != null &&
      req.body && req.body.isCoDriverRequired && req.body.coDriverId != null) {
      isSharePercentageDriverCoDriver = true;
    }
    let driverEarningAmount = 0;
    let driverSharePercentage = adminData.driverSharePercentage || 0;
    if (isSharePercentageDriverCoDriver) {
      driverSharePercentage = adminData.coDriverSharePercentage || 0;
    }
    driverEarningAmount = ((req.body.actualAmount) * driverSharePercentage) / 100
    req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
    req.body.driverEarningAmount = driverEarningAmount;
    if (req.body.paymentMode == Constant.paymentMode.wallet &&
      req.body.totalAmount > userData.walletAmount) {
      return res.ok(false, Constant.InsufficientAmount, null);
    }
    if (req.body.vehicleId && (req.body.vehicleId).length == 24) {
      if (vehicleData) {
        req.body.userVehicleId = vehicleData._id;
        req.body.userVehicleTypeId = vehicleData.vehicleTypeId;
        req.body.userTransmissionTypeId = vehicleData.transmissionTypeId;
      }
    }
    if (req.body.vehicleId) {
      delete req.body.vehicleId;
    }
    if (req.body.isSheduledBooking) {
      req.body.isTripAllocated = false;
    }
    if (req.body.isWalletUsed && req.body.totalAmount) {
      req.body.totalAmount;
      if (req.body.totalAmount >= userData.walletAmount) {
        req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
        req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
      } else {
        req.body.actualAmount = 0;
        req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
      }
    }
    req.body.paymentStatus = Constant.paymentStatus.completed;
    if (req.body.paymentMode == Constant.paymentMode.card) {
      if (!req.body.cardId) {
        return res.ok(false, Constant.invalidStripCard, null);
      }
      let cardData = await Model.Card.findOne({
        _id: mongoose.Types.ObjectId(req.body.cardId),
        isDeleted: false, isBlocked: false
      })
      if (!cardData) {
        return res.ok(false, Constant.invalidStripCard, null);
      }
      let paymentObj = {
        amount: req.body.actualAmount,
        stripeCustomerId: cardData.stripeCustomerId,
        stripePaymentMethod: cardData.stripePaymentMethod,
        description: `Payemnt by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
      }
      if (req.body.actualAmount > 0) {
        let paymentData = await chargeStrip(paymentObj)
        if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
          paymentObj.trxId = paymentData.data.paymentId;
          paymentObj.captureMethod = paymentData.data.captureMethod;
          paymentObj.paymentStatus = Constant.paymentStatus.completed;
          paymentObj.userId = userData._id;
          paymentObj.cardId = cardData._id;
          let transactionData = await Model.Transaction(paymentObj).save();
          req.body.transactionId = transactionData._id;
          req.body.trxId = transactionData.trxId;
          req.body.isPayementOnStrip = true;
        } else {
          return res.ok(false, Constant.errorInStripCardChargeAmount, null);
        }
      }

    }
    const bookingData = await new Model.Booking(req.body).save();
    if (req.body.paymentMode == Constant.paymentMode.card && req.body.actualAmount) {
      await Model.Transaction.update({ _id: mongoose.Types.ObjectId(req.body.transactionId) },
        {
          $set: {
            bookingId: mongoose.Types.ObjectId(bookingData._id)
          }
        })
    }
    if (bookingData.paymentMode == Constant.paymentMode.wallet) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $inc: { walletAmount: -(bookingData.totalAmount) } });
    }
    if (req.body.isWalletUsed) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $inc: { walletAmount: -(bookingData.walletAmount) } });
    }
    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $set: { isReferralCodeUsed: true } });
    }
    if (req.body.isTripAllocated) {
      let sendUserData = await userDataSend(userData);
      const sendBookingData = await getCurrentBookingData(bookingData);
      driverController.availableFreeDriver(sendBookingData, sendUserData, {});
    } else if (req.body.isSheduledBooking) {
      process.emit('scheduleBooking', bookingData);
    }
    let dataToSendForSchedule = {
      bookingData: bookingData,
      adminData: adminData
    }
    console.log('===4', dataToSendForSchedule);
    process.emit('scheduleBookingForCancel', dataToSendForSchedule);
    return res.ok(true, null, bookingData);
  } catch (error) {
    console.log(error)
    return res.serverError(Constant.serverError);
  }
};
async function userDataSend(userData) {
  let userDataObj = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    gender: userData.gender,
    rating: userData.rating,
    avgRating: userData.avgRating,
  };
  return userDataObj;
}
async function getCurrentBookingData(bookingData) {
  try {
    if (bookingData && bookingData._id) {
      const pipeline = [
        { $match: { _id: mongoose.Types.ObjectId(bookingData._id) } },
        {
          $sort: {
            "createdAt": -1
          }
        },
        {
          $lookup: {
            from: 'transmissiontypes',
            localField: 'transmissionTypeId',
            foreignField: '_id',
            as: 'transmissionTypeData'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userData'
          }
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'driverId',
            foreignField: '_id',
            as: 'driverData'
          }
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'coDriverId',
            foreignField: '_id',
            as: 'coDriverData'
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicleId',
            foreignField: '_id',
            as: 'vehicleData'
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'userVehicleId',
            foreignField: '_id',
            as: 'userVehicleData'
          }
        },
        {
          $project: {
            vehicleId: 1,
            vehicleTypeId: 1,
            userVehicleId: 1,
            bookingNo: 1,
            adminId: 1,
            userId: 1,
            driverId: 1,
            teamId: 1,
            eventTypeId: 1,
            seviceTypeId: 1,
            note: 1,
            userData: { $arrayElemAt: ["$userData", 0] },
            coDriverId: 1,
            driverData: { $arrayElemAt: ["$driverData", 0] },
            vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
            userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
            coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
            booKingAmount: 1,
            promoAmount: 1,
            totalDistance: 1,
            tripType: 1,
            paymentMode: 1,
            genderType: 1,
            transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
            dropUplatitudeFirst: 1,
            dropUplongitudeFirst: 1,
            dropUpAddressFirst: 1,
            dropUplatitudeSecond: 1,
            dropUplongitudeSecond: 1,
            dropUpAddressSecond: 1,
            dropUplatitudeThird: 1,
            dropUplongitudeThird: 1,
            dropUpAddressThird: 1,
            dropUplatitudeFour: 1,
            dropUplongitudeFour: 1,
            dropUpAddressFour: 1,
            passengerNo: 1,
            isCoDriverRequired: 1,
            isDriverRequired: 1,
            pickUplatitude: 1,
            pickUplongitude: 1,
            dropUplatitude: 1,
            dropUplongitude: 1,
            pickUpAddress: 1,
            dropUpAddress: 1,
            bookingDate: 1,
            sheduledDate: 1,
            bookingStatus: 1,
            isAutoAllocated: 1,
            assignBy: 1,
            isSheduledBooking: 1,
            isCanceledByDriver: 1,
            isCanceledByCustomer: 1,
            isDriverRated: 1,
            isCustomerRated: 1,
            driverRating: 1,
            customerRating: 1,
            driverReview: 1,
            customerReview: 1,
            isDriverReviewed: 1,
            isCustomerReviewed: 1,
            totalAmount: 1,
            actualAmount: 1,
            walletAmount: 1,
            pendingAmount: 1,
            timezone: 1,
            isDriverRequired: 1,
            isEventBooking: 1,
            eventName: 1,
            eventDescription: 1,
            block: 1,
            eventLocaltionLatitude: 1,
            eventLocaltionLongitude: 1,
            eventLocaltion: 1,
            eventAddress: 1,
            isTripAllocated: 1,
            eta: 1,
            taxAmount: 1,
            totalDistanceInKm: 1
          }
        }
      ];
      const bookingDataList = await Model.Booking.aggregate(pipeline);
      return bookingDataList ? bookingDataList[0] : {};
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
NOTIFICATION API'S
*/

async function getAllNotification(req, res) {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const count = await Model.AdminNotification.countDocuments({ receiverId: req.user._id, isDeleted: false });
    let pipeline = [
      { $match: { receiverId: req.user._id } },
      { $match: { isDeleted: false } },
      {
        $sort: {
          "createdAt": -1
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'bookingData'
        }
      },
      {
        $project: {
          adminId: 1,
          userId: 1,
          driverId: 1,
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          adminData: { $arrayElemAt: ["$adminData", 0] },
          bookingData: { $arrayElemAt: ["$bookingData", 0] },
          message: 1,
          isRead: 1
        }
      }
    ];
    if (req.query.isRead != undefined) {
      pipeline.push({ $match: { isRead: false } });
    }
    const notificationData = await Model.AdminNotification.aggregate(pipeline);
    return res.success(true, null, notificationData, count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function clearNotification(req, res) {
  try {
    if (Validation.isAdminValidate.isValidId(req.body))
      return res.ok(false, Constant.required, null);
    // await Model.AdminNotification.findOneAndUpdate({_id: req.body._id},req.body);
    await Model.AdminNotification.deleteMany({ _id: req.body._id });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function clearAllNotification(req, res) {
  try {
    //await Model.AdminNotification.update({receiverId: req.user._id},req.body,{multi:true});
    await Model.AdminNotification.deleteMany({ receiverId: req.user._id });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
PROMO CODE API's
*/
async function addPromo(req, res) {
  try {
    if (req.body.cashback && req.body.percentage) {
      return res.ok(false, Constant.promoOnlyCashbackOrPercentage, {});
    }

    let criteria = {};
    const dataToSave = req.body;
    criteria = {
      isDeleted: false,
      promoCode: req.body.promoCode
    };
    if (req.body.cashback) {
      dataToSave.isCash = true;
    } else {
      dataToSave.isCash = false;
    }
    const count = await Model.PromoCode.countDocuments(criteria);
    if (count > 0) {
      return res.ok(false, Constant.promoAlreadyExist, {});
    }
    if (req.body.expireDate && (new Date(req.body.expireDate) == "Invalid Date"
      || moment().diff(req.body.expireDate, 'seconds') > 0)) {
      return res.ok(false, Constant.backDateNotAllowed, {});
    }
    const result = await Model.PromoCode(dataToSave).save();
    return res.success(true, null, result);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}
async function editPromoCode(req, res) {
  try {
    if (Validation.isAdminValidate.isValidPromoCode(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.cashback && req.body.percentage) {
      return res.ok(false, Constant.promoOnlyCashbackOrPercentage, null);
    }
    if (req.body.expireDate && (new Date(req.body.expireDate) == "Invalid Date"
      || moment().diff(req.body.expireDate, 'seconds') > 0)) {
      return res.ok(false, Constant.backDateNotAllowed, {});
    }
    let criteria = {};
    let dataToSave = req.body;
    criteria = {
      _id: { $nin: [req.body._id] },
      isDeleted: false,
      promoCode: req.body.promoCode
    };
    const count = await Model.PromoCode.countDocuments(criteria);
    if (count > 0) {
      return res.ok(false, Constant.promoAlreadyExist, {});
    }
    if (req.body.cashback) {
      dataToSave.isCash = true;
    } else {
      dataToSave.isCash = false;
    }

    await Model.PromoCode.findOneAndUpdate({ _id: req.body._id }, { $set: dataToSave });
    return res.success(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}
async function deleteBlockPromoCode(req, res) {
  try {
    let setObj = {};
    if (Validation.isAdminValidate.isValidPromoCode(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.isDeleted != undefined && req.body.isDeleted != null) {
      setObj.isDeleted = req.body.isDeleted ? true : false;
    }
    if (req.body.isBlocked != undefined && req.body.isBlocked != null) {
      setObj.isBlocked = req.body.isBlocked ? true : false;
    }
    await Model.PromoCode.findOneAndUpdate({ _id: req.body._id }, { $set: setObj });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}

async function getAllPromo(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.PromoCode.countDocuments(query);
    return res.success(true, null, await Model.PromoCode.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}

/*
REVENUE API'S
*/
async function getRevenue(req, res) {
  try {
    let dataToSend = {};
    let pipeline = [];
    if (req.body.userId) {
      pipeline.push({ $match: { userId: mongoose.Types.ObjectId(req.body.userId) } })
    }
    if (req.body.driverId) {
      pipeline.push({
        $match: {
          $or: [{ driverId: mongoose.Types.ObjectId(req.body.driverId) },
          { coDriverId: mongoose.Types.ObjectId(req.body.driverId) }]
        }
      });
    }
    if (req.body.isEventBooking) {
      pipeline.push({ $match: { isEventBooking: req.body.isEventBooking ? true : false } })
    }
    if (req.body.startDate && req.body.endDate) {
      pipeline.push({
        $match: {
          bookingLocalDate: {
            $gte: new Date(moment(req.body.startDate).startOf('day')),
            $lte: new Date(moment(req.body.endDate).endOf('day')),
          },
        }
      })
    }
    pipeline.push(
      { $match: { bookingStatus: 'COMPLETED' } },
      {
        $group: {
          _id: { date: { "$dateToString": { format: "%m", date: "$bookingLocalDate" } } },
          // date:{$first:{"$dateToString": { format: "%m", date: "$bookingLocalDate" }}},
          date: { $first: "$bookingLocalDate" },
          totalAmount: { "$sum": "$booKingAmount" }
        }
      });
    const bookingData = await Model.Booking.aggregate(pipeline);
    let data = [];
    for (let i = 0; i < bookingData.length; i++) {
      data.push([moment(bookingData[i].date).format("DD-MMM-YY"), parseFloat((bookingData[i].totalAmount).toFixed(2))])
    }
    return res.success(true, null, data);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function createDriver(data, res) {
  let coordinates = [data.body.latitude, data.body.longitude];
  let info = data.body.location
  let driverLocation = {
    coordinates,
    info
  }
  const driver = {
    firstName: data.body.firstName,
    lastName: data.body.lastName,
    email: data.body.email,
    countryCode: data.body.countryCode,
    phone: data.body.phone,
    gender: data.body.gender,
    driverLocation: driverLocation,
    address: data.body.address,
    password: data.body.password,
    latitude: data.body.latitude,
    longitude: data.body.longitude,
    carStatus: data.body.carStatus,
    driverLisence: data.body.driverLisence,
    ssn: data.body.ssn,
    isTransmissionType: data.body.isTransmissionType
  }

  return driver;
};
async function driverRegister(req, res) {
  try {
    let dataToSend = {};
    if (Validation.isAdminValidate.isDriverRegValid(req.body))
      return res.ok(false, Constant.required, null)
    const driverDataCheck = await Model.Driver.findOne({
      $or: [{ phone: req.body.phone, countryCode: req.body.countryCode },
      { email: req.body.email }], isDeleted: false
    });
    if (driverDataCheck) {
      if (driverDataCheck.email == req.body.email) {
        return res.ok(false, Constant.emailAlreadyExist, null);
      } else if (driverDataCheck.phone == req.body.phone) {
        return res.ok(false, Constant.phoneAlreadyExist, null);
      } else {
        return res.ok(false, Constant.driverAlreadyExist, null);
      }
    }
    let driver = await createDriver(req, res);
    if (req.file) {
      driver.image = `${Constant.driverImage}/${req.file.filename}`;
    }
    driver.isApproved = true;
    driver.password = req.body.password;
    let driverData = await Model.Driver(driver).save();
    dataToSend.driverData = driverData || {};
    dataToSend.vehicleData = {};
    return res.ok(true, Constant.driverRegister, dataToSend)
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};
async function updateDriverProfile(req, res) {
  if (Validation.isAdminValidate.isValidId(req.body))
    return res.ok(null, Constant.required, {})

  let driver = await Model.Driver.findOne({
    _id: mongoose.Types.ObjectId(req.body._id),
    isDeleted: false
  });
  if (req.body.phone && !req.body.countryCode) {
    delete req.body.phone;
  }
  if (!req.body.phone && req.body.countryCode) {
    delete req.body.countryCode;
  }
  if (req.body.phone && req.body.countryCode) {
    const driverDataCheck = await Model.Driver.findOne({
      _id: { $nin: [mongoose.Types.ObjectId(req.body._id)] },
      $or: [{ phone: req.body.phone, countryCode: req.body.countryCode }], isDeleted: false
    });
    if (driverDataCheck) {
      if (driverDataCheck.phone == req.body.phone) {
        return res.ok(false, Constant.phoneAlreadyExist, null);
      } else {
        return res.ok(false, Constant.driverAlreadyExist, null);
      }
    }
  }
  if (req.body.email) {
    const driverDataCheck = await Model.Driver.findOne({
      _id: { $nin: [mongoose.Types.ObjectId(req.body._id)] },
      $or: [{ email: req.body.email }], isDeleted: false
    });
    if (driverDataCheck) {
      if (driverDataCheck.email == req.body.email) {
        return res.ok(false, Constant.emailAlreadyExist, null);
      } else {
        return res.ok(false, Constant.driverAlreadyExist, null);
      }
    }
  }

  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
  }
  if (req.body.latitude || req.body.longitude) {
    let location = {
      "type": "Point",
      coordinates: [req.body.longitude, req.body.latitude]
    }
    req.body.driverLocation = location;
  }
  if (req.file) {
    driver.image = `${Constant.driverImage}/${req.file.filename}`;
    req.body.image = driver.image;
  }
  delete req.body._id;
  await Model.Driver.update({ _id: driver._id }, { $set: req.body });
  return res.ok(true, null, {});
};
async function updateDocuments(req, res) {
  if (!req.body.plateNumber &&
    !req.body.insuranceDocuments &&
    !req.body.vehicalRegistration && !req.body.drivingCertificate &&
    !req.body.vehicleId && (req.body.vehicleId).length != 24)
    return res.ok(false, Constant.required, null);
  let document = {};
  if (req.body.license) {
    document.license = req.body.license;
    document.isLicenseUploaded = true;
  }

  if (req.body.plateNumber) {
    document.plateNumber = req.body.plateNumber;
    document.isNumberPlateUploaded = true;
  }

  if (req.body.carLicense) {
    document.carLicense = req.body.carLicense;
    document.isCarLicenseUploaded = true;
  }

  if (req.body.insuranceDocuments) {
    document.insuranceDocuments = req.body.insuranceDocuments;
    document.isInsuranceDocumentsUploaded = true;
  }
  if (req.body.taxiPermit) {
    document.taxiPermit = req.body.taxiPermit;
    document.isTaxiPermitUploaded = true;
  }
  if (req.body.vehicalRegistration) {
    document.vehicalRegistration = req.body.vehicalRegistration;
    document.isVehicalRegistrationUploaded = true;
  }
  if (req.body.drivingCertificate) {
    document.drivingCertificate = req.body.drivingCertificate;
    document.isDrivingCertificateUploaded = true;
  }
  if (req.body.carFrontImage) {
    document.carFrontImage = req.body.carFrontImage;
    document.isCarFrontImageUploaded = true;
  }
  if (req.body.carBackImage) {
    document.carBackImage = req.body.carBackImage;
    document.isCarBackImageUploaded = true;
  }
  if (req.body.carLeftImage) {
    document.carLeftImage = req.body.carLeftImage;
    document.isCarLeftImageUploaded = true;
  }
  if (req.body.carRightImage) {
    document.carRightImage = req.body.carRightImage;
    document.isCarRightImageUploaded = true;
  }
  if (req.body.vehicleName) {
    document.vehicleName = req.body.vehicleName;
  }
  if (req.body.vehicleImage) {
    document.vehicleImage = req.body.vehicleImage;
  }
  let vehicleData = await Model.Vehicle.findOneAndUpdate({ _id: req.body.vehicleId }, { $set: document });
  vehicleData = await Model.Vehicle.findOne({ _id: req.body.vehicleId });
  let dataToSend = {
    vehicleData: vehicleData || {}
  };
  return res.success(true, null, dataToSend);
};
async function getAllDrivers(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body.isApproved) query.isApproved = req.body.isApproved;
    if (req.body.isBlocked) query.isBlocked = req.body.isBlocked;
    if (req.body._id) query._id = mongoose.Types.ObjectId(req.body._id);
    if (req.body.isCopilot != undefined) {
      query.isCopilot = JSON.parse(JSON.stringify(req.body.isCopilot));
    }
    if (req.body.isPilot != undefined) {
      query.isPilot = JSON.parse(JSON.stringify(req.body.isPilot));
    }
    if (req.body.isPairedDriver != undefined) {
      query.isPairedDriver = JSON.parse(JSON.stringify(req.body.isPairedDriver));
    }
    if (req.body.search != undefined) {
      query.$or = [
        {
          firstName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          lastName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          phone: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
      ];
    }

    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const count = await Model.Driver.countDocuments(query);
    if (skip === -1) {
      return res.success(true, null, await Model.Driver.find(query).sort({ createdAt: -1 }));
    }

    return res.success(true, null, await Model.Driver.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function verifyBlockUnBlockDeltedDriver(req, res) {
  try {
    if (Validation.isAdminValidate.isValidId(req.body))
      return res.ok(false, Constant.required, null);
    console.log(req.body)
    let setObj = {};
    let message = null;
    if (req.body.isApproved != undefined) {
      setObj.isApproved = req.body.isApproved;
      message = req.body.isApproved ? Constant.aproveDriver : Constant.unAproveDriver;
    }
    if (req.body.isBlocked != undefined) {
      setObj.isBlocked = req.body.isBlocked;
      message = req.body.isBlocked ? Constant.blocked : Constant.UnBlocked;
    }
    if (req.body.isDeleted != undefined) {
      setObj.isDeleted = req.body.isDeleted;
      message = Constant.deleted;
    }
    await Model.Driver.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(req.body._id)
    }, { $set: setObj })
    const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(req.body._id) });
    return res.ok(true, message, driverData)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getAllVehicleDriver(req, res) {
  try {
    if (Validation.isAdminValidate.isValidDriverId(req.body))
      return res.ok(false, Constant.required, null);
    const query = { isDeleted: false };
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    if (req.body.driverId && req.body.driverId.length == 24)
      query.driverId = req.body.driverId;
    query.isDriverVehicle = true;
    if (req.body.search != undefined) {
      query.$or = [
        {
          vehicleName: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleMake: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          vehicleModel: {
            $regex: req.body.search,
            $options: 'i',
          },
        }
      ];
    }
    let limit = parseInt(req.body.limit || 10);
    let skip = parseInt(req.body.skip || 0);
    const count = await Model.Vehicle.countDocuments(query);
    let pipeline = [];
    if (req.body._id && req.body._id.length == 24) {
      pipeline.push({ $match: { _id: req.body._id } })
    }
    pipeline.push(
      { $match: { driverId: mongoose.Types.ObjectId(req.body.driverId) } },
      { $match: { isDeleted: false } });
    if (req.body.search != undefined) {
      pipeline.push({
        $match: {
          '$or': [
            { 'vehicleName': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleMake': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } },
            { 'vehicleModel': { '$regex': '.*' + req.body.search + '.*', '$options': 'i' } }]
        }
      })
    }
    pipeline.push({
      $sort: {
        "createdAt": -1
      }
    },
      {
        "$skip": skip
      },
      {
        "$limit": limit
      },
      {
        $lookup: {
          from: 'vehicletypes',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleTypeData'
        }
      },
      {
        $lookup: {
          from: 'transmissiontypes',
          localField: 'transmissionTypeId',
          foreignField: '_id',
          as: 'transmissionTypeData'
        }
      },
      {
        $project: {
          "id": 1,
          "location": 1,
          "vehicleName": 1,
          "vehicleMake": 1,
          "vehicleModel": 1,
          "vehicleImage": 1,
          "license": 1,
          // "numberPlate":1,
          "documentThree": 1,
          "carLicense": 1,
          "insuranceDocuments": 1,
          "taxiPermit": 1,
          "vehicalRegistration": 1,
          "drivingCertificate": 1,
          "isLicenseUploaded": 1,
          "isNumberPlateUploaded": 1,
          "isCarLicenseUploaded": 1,
          "isInsuranceDocumentsUploaded": 1,
          "isTaxiPermitUploaded": 1,
          "isVehicalRegistrationUploaded": 1,
          "isDrivingCertificateUploaded": 1,
          "aboutCar": 1,
          "color": 1,
          "chassis": 1,
          "engine": 1,
          "steering": 1,
          "speed": 1,
          "passenger": 1,
          "isDriverVehicle": 1,
          "isDeleted": 1,
          "vehicleTypeId": 1,
          "userId": 1,
          "createdAt": 1,
          "vehicleTypeData": 1,
          "transmissionTypeData": 1,
          "carFrontImage": 1,
          "carBackImage": 1,
          "carLeftImage": 1,
          "carRightImage": 1,
          "isCarFrontImageUploaded": 1,
          "isCarBackImageUploaded": 1,
          "isCarLeftImageUploaded": 1,
          "isCarRightImageUploaded": 1,
          "plateNumber": 1,
          "state": 1
        }
      });
    return res.success(true, null, await Model.Vehicle.aggregate(pipeline), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getAllAvailableDriver(req, res) {
  try {
    if (Validation.isAdminValidate.isValidBookingId(req.body))
      return res.ok(false, Constant.required, null);
    const bookingData = await Model.Booking.findOne({ _id: req.body.bookingId }, {}, {})
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData.bookingStatus != Constant.bookingStatus.PENDING) {
      return res.ok(false, Constant.alreadyAcceptBookingStatus, null);
    }
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
    let criteria = {
      available: true,
      isApproved: true,
      activeStatus: true,
      isBlocked: false,
      isDeleted: false,
      driverLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [bookingData.pickUplongitude, bookingData.pickUplatitude
            ]
          },
          $minDistance: 0,
          $maxDistance: adminData ? adminData.area : 500
        }
      }
    };
    if (bookingData.isCoDriverRequired && bookingData.isDriverRequired) {
      criteria.isPairedDriver = true;
      criteria.isCopilot = true;
      criteria.genderType = bookingData.genderType;
    } else {
      criteria.isCopilot = false;
      criteria.isPairedDriver = false;
      criteria.genderType = bookingData.genderType;
    }
    const driverData = await Model.Driver.find(criteria, { password: 0, __v: 0 }, {});
    return res.ok(true, null, driverData || []);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function addVehicle(req, res) {
  try {
    if (req.file.fieldname == 'vehicleImage') req.body.vehicleImage = req.file.filename
    if (Validation.isAdminValidate.isaddVehicleValid(req.body))
      return res.ok(false, Constant.required, null);
    if (!req.body.userId && !req.body.driverId) {
      return res.ok(false, Constant.required, null);
    }
    if (req.body.userId && req.body.userId.length != 24) {
      return res.ok(false, Constant.required, null);
    }
    if (req.body.driverId && req.body.driverId.length != 24) {
      return res.ok(false, Constant.required, null);
    }
    if (req.body.userId) {
      req.body.driverId = req.body.userId;
    }
    if (req.body.driverId) {
      req.body.driverId = req.body.driverId;
      req.body.isDriverVehicle = true;
    }

    let coordinates = [];
    let location = {};
    if (req.body.latitude && req.body.longitude) {
      coordinates.push(Number(req.body.longitude))
      coordinates.push(Number(req.body.latitude))
      location.type = "Point";
      location.coordinates = coordinates
    }
    req.body.location = location;
    if (req.body.license) {
      req.body.license = req.body.license;
      req.body.isLicenseUploaded = true;
    }

    if (req.body.plateNumber) {
      req.body.plateNumber = req.body.plateNumber;
      req.body.isNumberPlateUploaded = true;
    }

    if (req.body.carLicense) {
      req.body.carLicense = req.body.carLicense;
      req.body.isCarLicenseUploaded = true;
    }

    if (req.body.insuranceDocuments) {
      req.body.insuranceDocuments = req.body.insuranceDocuments;
      req.body.isInsuranceDocumentsUploaded = true;
    }
    if (req.body.taxiPermit) {
      req.body.taxiPermit = req.body.taxiPermit;
      req.body.isTaxiPermitUploaded = true;
    }
    if (req.body.vehicalRegistration) {
      req.body.vehicalRegistration = req.body.vehicalRegistration;
      req.body.isVehicalRegistrationUploaded = true;
    }
    if (req.body.drivingCertificate) {
      req.body.drivingCertificate = req.body.drivingCertificate;
      req.body.isDrivingCertificateUploaded = true;
    }
    if (req.body.carFrontImage) {
      req.body.carFrontImage = req.body.carFrontImage;
      req.body.isCarFrontImageUploaded = true;
    }
    if (req.body.carBackImage) {
      req.body.carBackImage = req.body.carBackImage;
      req.body.isCarBackImageUploaded = true;
    }
    if (req.body.carLeftImage) {
      req.body.carLeftImage = req.body.carLeftImage;
      req.body.isCarLeftImageUploaded = true;
    }
    if (req.body.carRightImage) {
      req.body.carRightImage = req.body.carRightImage;
      req.body.isCarRightImageUploaded = true;
    }
    const vehicleData = await new Model.Vehicle(req.body).save();
    return res.ok(true, null, vehicleData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};
/*
TRANSMISSION API'S
*/
async function addTransmissionType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidAddTransmissionType(req.body))
      return res.ok(false, Constant.required, {});
    let query = {
      transmissionTypeName: req.body.transmissionTypeName,
      isDeleted: false
    }
    const count = await Model.TransmissionType.countDocuments(query);
    if (count) {
      return res.ok(false, Constant.transmissionTypeNameAlreadyExists, {});
    }
    const transmissionTypeData = await Model.TransmissionType(req.body).save();
    return res.ok(true, null, transmissionTypeData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function editTransmissionType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditTransmissionType(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.transmissionTypeName != undefined && req.body.transmissionTypeName != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        transmissionTypeName: req.body.transmissionTypeName,
        isDeleted: false
      }
      const count = await Model.TransmissionType.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.transmissionTypeNameAlreadyExists, {});
      }
    }
    await Model.TransmissionType.findOneAndUpdate({ _id: req.body._id }, req.body);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteTransmissionType(req, res) {
  try {
    const query = {};
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    await Model.TransmissionType.findOneAndUpdate(query, req.body);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getTransmissionType(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.TransmissionType.countDocuments(query);
    return res.success(true, null, await Model.TransmissionType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
APP VERSIONING API'S
*/
async function setAppVersion(req, res) {
  try {
    if (Validation.isAdminValidate.isValidAppVersion(req.body))
      return res.ok(false, Constant.required, null);
    const query = {};
    const options = {
      new: true,
      upsert: true,
    };
    // if (req.body.latestIOSVersion <= req.body.criticalIOSVersion
    //     || req.body.latestAndroidVersion <= req.body.criticalAndroidVersion
    //     || req.body.latestDriverAndroidVersion <= req.body.criticalDriverAndroidVersion
    //     || req.body.latestDriverIOSVersion <= req.body.criticalDriverIOSVersion
    //     || req.body.latestWebID <= req.body.criticalWebID) {
    //         return res.ok(false, Constant.criticalVersion, {});
    // }
    await Model.AppVersion.findOneAndUpdate(query, req.body, options);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getAppVersion(req, res) {
  try {
    const appVersionData = await Model.AppVersion.findOne({});
    return res.ok(true, null, appVersionData)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
TEAM API'S
*/
async function addTeam(req, res) {
  try {
    if (Validation.isAdminValidate.isValidAddTeam(req.body))
      return res.ok(false, Constant.required, {});
    let query = {
      teamName: req.body.teamName,
      isDeleted: false
    }
    const count = await Model.Team.countDocuments(query);
    if (count) {
      return res.ok(false, Constant.teamNameAlreadyExists, {});
    }
    const teamData = await Model.Team(req.body).save();
    return res.ok(true, null, teamData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function editTeam(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditTeam(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.teamName != undefined && req.body.teamName != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        teamName: req.body.teamName,
        isDeleted: false
      }
      const count = await Model.Team.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.teamNameAlreadyExists, {});
      }
    }
    await Model.Team.findOneAndUpdate({ _id: req.body._id }, req.body);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteTeam(req, res) {
  try {
    const query = {};
    if (req.body._id && req.body._id.length == 24)
      query._id = mongoose.Types.ObjectId(req.body._id);
    await Model.Team.findOneAndUpdate(query, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getTeam(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.Team.countDocuments(query);
    return res.success(true, null, await Model.Team.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
/*
EVENT TYPE API'S
*/
async function addEventType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidAddEventType(req.body))
      return res.ok(false, Constant.required, {});
    let query = {
      eventName: req.body.eventName,
      isDeleted: false
    }
    const count = await Model.EventType.countDocuments(query);
    if (count) {
      return res.ok(false, Constant.eventNameAlreadyExists, {});
    }
    const eventTypeData = await Model.EventType(req.body).save();
    return res.ok(true, null, eventTypeData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function editEventType(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditEventType(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.eventName != undefined && req.body.eventName != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        eventName: req.body.eventName,
        isDeleted: false
      }
      const count = await Model.EventType.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.eventNameAlreadyExists, {});
      }
    }
    await Model.EventType.findOneAndUpdate({ _id: req.body._id }, req.body);
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteEventType(req, res) {
  try {
    const query = {};
    if (req.body._id && req.body._id.length == 24)
      query._id = mongoose.Types.ObjectId(req.body._id);
    await Model.EventType.findOneAndUpdate(query, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function getEventType(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const count = await Model.EventType.countDocuments(query);
    return res.success(true, null, await Model.EventType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


/*
STATE API'S
*/
// async function addState(req, res) {
//   try {
//     if (Validation.isAdminValidate.isValidAddState(req.body))
//       return res.ok(false, Constant.required, {});
//     let query = {
//       stateName: req.body.stateName,
//       isDeleted: false
//     }
//     const count = await Model.State.countDocuments(query);
//     if (count) {
//       return res.ok(false, Constant.stateNameAlreadyExists, {});
//     }
//     const stateData = await Model.State(req.body).save();
//     return res.ok(true, null, stateData);
//   } catch (error) {
//     console.log(error);
//     return res.serverError(Constant.serverError);
//   }
// };
// async function editState(req, res) {
//   try {
//     if (Validation.isAdminValidate.isValidEditState(req.body))
//       return res.ok(false, Constant.required, {});
//     if (req.body.stateName != undefined && req.body.stateName != null) {
//       let query = {
//         _id: { $nin: [req.body._id] },
//         stateName: req.body.stateName,
//         isDeleted: false
//       }
//       const count = await Model.State.countDocuments(query);
//       if (count) {
//         return res.ok(false, Constant.stateNameAlreadyExists, {});
//       }
//     }
//     await Model.State.findOneAndUpdate({ _id: req.body._id }, req.body);
//     return res.ok(true, null, {});
//   } catch (error) {
//     console.log(error);
//     return res.serverError(Constant.serverError);
//   }
// };
// async function blockUnblockDeleteState(req, res) {
//   try {
//     const query = {};
//     if (req.body._id && req.body._id.length == 24)
//       query._id = mongoose.Types.ObjectId(req.body._id);
//     await Model.State.findOneAndUpdate(query, { $set: req.body });
//     return res.ok(true, null, {});
//   } catch (error) {
//     console.log(error);
//     return res.serverError(Constant.serverError);
//   }
// };
// async function getState(req, res) {
//   try {
//     const query = { isDeleted: false };
//     if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
//     if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = parseInt(req.query.skip) || 0;
//     const count = await Model.State.countDocuments(query);
//     return res.success(true, null, await Model.State.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
//   } catch (error) {
//     console.log(error);
//     return res.serverError(Constant.serverError);
//   }
// };

async function getContactUs(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    if (req.body.search != undefined) {
      req.body.search = req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        {
          name: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          email: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          subject: {
            $regex: req.body.search,
            $options: 'i',
          },
        },
        {
          message: {
            $regex: req.body.search,
            $options: 'i',
          },
        }
      ];
    }
    const count = await Model.ContactUs.countDocuments(query);
    return res.success(true, null, await Model.ContactUs.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    return res.serverError(Constant.serverError);
  }
};

async function sendBulkPushToUserDelayTime(userIds, skip, limit, payload, isSendToAll) {
  setTimeout(async function () {
    console.log("delay chat 10 second");
    skip = skip + limit;
    userIds = [];
    let userData = await Model.User.find({ isDeleted: false }, { _id: 1 }).skip(skip).limit(limit);
    for (let i = 0; i < userData.length; i++) {
      userIds.push(mongoose.Types.ObjectId(userData[i]._id));
    }
    await sendBulkPushToUser(userIds, skip, limit, payload, isSendToAll);
  }, 5000);
};
async function sendBulkPushToUser(userIds, skip, limit, payload, isSendToAll, userType) {
  try {
    if (userIds && userIds.length) {
      let criteria = {};
      userIds == 'USER' ? criteria.userId = { $in: userIds } : criteria.driverId = { $in: userIds }
      console.log({ criteria })
      const userDeviceData = await Model.Device.find(criteria);
      if (userDeviceData && userDeviceData.length) {
        for (let i = 0; i < userDeviceData.length; i++) {
          payload.receiverId = userDeviceData[i].userId;
          payload.token = userDeviceData[i].deviceToken;
          if (userDeviceData[i].deviceType == 'IOS') {
            Service.PushNotificationService.sendIosPushNotification(payload);
          }
          else if (userDeviceData[i].deviceType == 'ANDROID') {
            Service.PushNotificationService.sendAndroidPushNotifiction(payload);
          }
        }
        if (isSendToAll)
          await sendBulkPushToUserDelayTime([], skip, limit, payload, isSendToAll);
      } else {
        return true;
      }
    } else {
      return true
    }
  } catch (error) {
    return true;
  }
}
async function sendBulkSMSToUserDelayTime(userIds, skip, limit, payload, isSendToAll) {
  setTimeout(async function () {
    console.log("delay chat 10 second");
    skip = skip + limit;
    userIds = [];
    let userData = await Model.User.find({ isDeleted: false }, { _id: 1 }).skip(skip).limit(limit);
    for (let i = 0; i < userData.length; i++) {
      userIds.push(mongoose.Types.ObjectId(userData[i]._id));
    }
    await sendBulkSMSToUser(userIds, skip, limit, payload, isSendToAll);
  }, 5000);
};
async function sendBulkSMSToUser(userIds, skip, limit, payload, isSendToAll) {
  try {
    if (userIds && userIds.length) {
      let userData = await Model.User.find({ _id: { $in: userIds } }, { phone: 1, countryCode: 1 });
      if (userData && userData.length) {
        for (let i = 0; i < userData.length; i++) {
          Service.OtpService.sendSMS(userData.countryCode, userData.phone, payload.message);
        }
      }
      if (isSendToAll)
        await sendBulkSMSToUserDelayTime([], skip, limit, payload, isSendToAll);
      return true
    } else {
      return true
    }
  } catch (error) {
    return true;
  }
}
async function sendBulkNotification(req, res) {
  try {
    if (Validation.isAdminValidate.isSendNotificationValid(req.body))
      return res.ok(false, Constant.required, {});

    const skip = 0;
    const limit = 10;
    let payload = {
      title: req.body.title,
      message: req.body.message,
      body: req.body.message,
      eventType: '',
      socketType: '',
      adminId: req.user._id,
      isUserNotification: true,
      isNotificationSave: true
    }
    let userIds = [];
    let criteria = { isDeleted: false };
    let isSendToAll = true;
    console.log("-------------------", req.body)
    if (req.body.userId) {
      criteria._id = { $in: req.body.userId };
      isSendToAll = false;
    }
    let userData;
    console.log("============", { criteria })
    if (req.body.userType == 'USER') {
      console.log("user")
      userData = await Model.User.find(criteria, { _id: 1 })
    }
    else {
      console.log("driver")
      userData = await Model.Driver.find(criteria, { _id: 1 })
    }
    // .skip(skip).limit(limit);
    console.log({ userData })
    for (let i = 0; i < userData.length; i++) {
      userIds.push(mongoose.Types.ObjectId(userData[i]._id));
    }
    if (req.body.messageType == "PUSH") {
      sendBulkPushToUser(userIds, skip, limit, payload, isSendToAll, req.body.userType);
    }
    if (req.body.messageType == "SMS") {
      sendBulkSMSToUser(userIds, skip, limit, payload, isSendToAll, req.body.userType);
    }
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error)
    return res.serverError(Constant.serverError);
  }
};

// City API's
async function addZipCode(req, res) {
  try {
    let zipcode1 = req.body.zipCode;
    let tax1 = req.body.tax;
    let users = [];
    let users1 = [];
    let tax = [];
    let existingzip = [];
    for (let i = 0; i < zipcode1.length; i++) {
      let query = {
        zipCode: zipcode1[i],
        tax: tax1[i],
        isDeleted: false
      }
      const count = await Model.City.countDocuments(query);
      if (count) {
        // res.status(400).send(zipcode1[i]);
        existingzip.push(zipcode1[i]);
        tax.push(tax1[i]);
        continue;
      }
      if(tax1[i] === null) {
        break;
      }
      element = zipcode1[i];
      element1 = tax1[i];
      users.push(element)
      users1.push(element1)
      await Model.City({zipCode: element, tax:element1}).save();
    }
    return res.ok(true, 'SUCCESS', null)
    } catch (error) {
    return res.ok(false, 'Error', error)
  }

};

async function editZipCode(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditCity(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.zipCode != undefined && req.body.zipCode != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        zipCode: req.body.zipCode,
        isDeleted: false
      }
      const count = await Model.City.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.cityNameAlreadyExists, {});
      }
    }
    const zipcode = await Model.City.findOneAndUpdate({ _id: req.body._id }, req.body);
    return res.ok(true, null, zipcode);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};
async function blockUnblockDeleteCity(req, res) {

  try {
    const query = {};
    if (req.body._id) {
      query._id = mongoose.Types.ObjectId(req.body._id);
      query.isDeleted = true
    }
    await Model.City.findOneAndUpdate({ '_id': req.body._id }, { $set: { isDeleted: true } });
    return res.ok(true, null, query);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getZipCode(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body.search != undefined) {
      query.$or = [
        {
          zipCode: {
            $regex: req.body.search,
            $options: 'i',
          },
        }
      ];
    }
    const count = await Model.City.countDocuments(query);
    const originalData = await Model.City.find(query).sort({ createdAt: -1 })

    return res.success(true, null, originalData, count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function getAllDriverPaymentHistory(req, res) {
  try {
    if (req.body.startDate != undefined && req.body.endDate != undefined) {
      const originalData = await Model.DriverPayout.find({
        $or: [
          {
            createdAt: {
              $gte: new Date(req.body.startDate),
              $lte: new Date(req.body.endDate),
            },
          },
        ]
      }).populate({ path: 'driverId' })
      return res.success(true, null, originalData);

    } else {
      const originalData = await Model.DriverPayout.find().populate({ path: 'driverId' })
      return res.success(true, null, originalData);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}

// async function getAllDriverPaymentHistoryByChoice (req, res) {
//   try {
//     const query = { isDeleted: false };
//     if (req.body.isApproved) query.isApproved = req.body.isApproved;
//     if (req.body.isBlocked) query.isBlocked = req.body.isBlocked;
//     if (req.body._id) query._id = req.body._id;
//     // const query1 = {
//     //   driverID: req.body.driverId,
//     // }
//     if (req.body.search != undefined) {
//       query.$or = [
//         {
//           // firstName: {
//           //   $regex: req.body.search,
//           //   $options: 'i',
//           // },
//         },
//         // {
//         //   lastName: {
//         //     $regex: req.body.search,
//         //     $options: 'i',
//         //   },
//         // },
//         // {
//         //   phone: {
//         //     $regex: req.body.search,
//         //     $options: 'i',
//         //   },
//         // },
//         // {
//         //   email: {
//         //     $regex: req.body.search,
//         //     $options: 'i',
//         //   },
//         // },
//       ];
//       // query.$or = [
//       //   {
//       //     driverId: {
//       //       $regex: req.body.search,
//       //       $options: 'i'
//       //     }
//       //   }
//       // ]
//     }
//     // if (req.body.startDate != undefined && req.body.endDate != undefined) {
//     //   const originalData = await Model.DriverPayout.find({
//     //     $or: [
//     //       {
//     //         createdAt: {
//     //           $gte: new Date(req.body.startDate),
//     //           $lte: new Date(req.body.endDate),
//     //         },
//     //       },
//     //     ]
//     //   }).populate({ path: 'driverId' })
//     //   console.log("here2");
//     //   return res.success(true, null, originalData);
//     //   console.log("here3");
//     // }
//     const limit = parseInt(req.body.limit) || 10;
//     const skip = parseInt(req.body.skip) || 0;
//     const count = await Model.DriverPayout.countDocuments(query);
    
//     if (skip === -1) {
//       return res.success(true, null, await Model.DriverPayout.find(query).populate({ path: 'driverId' , match: {firstName: req.body.search} }).sort({ createdAt: -1 }));
//     }
//     // const count = await Model.ContactUs.countDocuments(query);
//     // return res.success(true, null, await Model.ContactUs.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
//     return res.success(true, null, await Model.DriverPayout.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
//   } catch (error) {
//     console.log(error);
//     return res.serverError(Constant.serverError);
//   }
// }

// async function getAllDriverPaymentHistoryByChoice (req, res) {
//   const driverName = req.body.search;
//   const driverData = await Model.Driver.findOne({firstName: driverName});
//   const driverID = driverData._id;
//   console.log(driverID);
//   const driverHistory = await Model.DriverPayout.find({
//     $or: [
//       {
//         createdAt: {
//           $gte: new Date(req.body.startDate),
//           $lte: new Date(req.body.endDate),
//         },
//       },
//       {
//         driverId: driverID
//       },
//     ]
//   }).populate({ path: 'driverId' })

//   console.log(driverHistory);
//   return res.ok(true, 'success', driverHistory)   
// }

// async function getAllDriverPaymentHistoryByChoice(req, res) {
//   try {
//     const query = { isDeleted: false };
//     let pipeline = [];
//     //FOR PAGINATION
//     const limit = parseInt(req.body.limit) || 10;
//     const page = parseInt(req.body.page) || 1;
//     if (req.body.search != "") {
//       query.$or = [
//           {
//               driverId: req.body.search
//           }
//       ];
//     }
//     //SEARCH FROM DRIVER ID
//     if (req.body.search != "") {
//         pipeline.push({
//             $match: {
//               '$or': [
//                   { 'driverId': req.body.search}]
//             }
//         })
//     }
//     //FILTER DRIVER PAYOUT FROM DATE
//     if (req.body.startDate != '' && req.body.endDate != '') {
//         pipeline.push({
//             $match: {
//                 $or: [
//                     {
//                         createdAt: {
//                             $gte: new Date(req.body.startDate),
//                             $lte: new Date(req.body.endDate)
//                         },
//                     },
//                 ]
//             }
//         })
//       }
//     pipeline.push(
//     {
//         $sort: {
//             "_id": -1
//         },
//         // $project: {
//         //   driverId: 1
//         // },
//     })
//     const DriverPayoutList = await Model.DriverPayout.aggregate(pipeline)
//             .limit(limit * 1)
//             .skip((page - 1) * limit);

//     const count = await Model.DriverPayout.countDocuments(query);  
//     const result = {
//       DriverPayoutList,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,}
//     return res.ok(true, 'success', result)
//   }
//   catch (error) {
//     res.ok(false, 'error', error);
//   }
// }

async function getAllDriverPaymentHistoryByChoice (req, res) {
  try {
  if(req.body.search == "")
  {
    const all = await Model.DriverPayout.find({$or: [
      {
        createdAt: {
          $gte: new Date(req.body.startDate),
          $lte: new Date(req.body.endDate),
        },  
      },
    ]}).populate({ path: 'driverId' });
    return res.ok(true, 'success', all);
  }
  const driverName = req.body.search;
  const driverData = await Model.Driver.findOne({firstName: driverName});
  if(driverData == null) {
    return res.ok(false, 'No Driver Registered', {})
  }
  const driverID = driverData._id;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const driverHistory = await Model.DriverPayout.find({
    $or: [
      {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },  
      },
    ],
    driverId: driverID
  }).populate({ path: 'driverId' });
  return res.ok(true, 'success', driverHistory) 
}
catch(error) {
  return res.ok(false, 'error', error)
}
}

async function getDriverPaymentHistoryById(req, res) {
  //PAGINATION
  Model.DriverPayout.findById({ _id: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
      if (err) {
          let apiResponse = Service.generate.generate(true, 'Error', 500, err)
          res.send(apiResponse)
      } else if (result == undefined || result == null || result == '') {
          let apiResponse = Service.generate.generate(true, 'No user Found', 404, null)
          res.send(apiResponse)
      } else {
          let apiResponse = Service.generate.generate(true, 'Success', 200, result)
          res.send(apiResponse)
      }
  }).populate({ path: 'userCard' })
}

async function getPayoutDriver(req, res) {
  try {
    if (Validation.isAdminValidate.getPayoutDriver(req.body))
      return res.ok(false, Constant.required, {});
    const payout = await stripe.transfers.create({
      amount: req.body.amount * 100,
      currency: "usd",
      destination: req.body.stripeDriverId,
    });
    console.log(payout);
    if (payout.id === null || payout.id === '') {
      return res.error(true, "Payout failed.");
    } else {
      const DriverPayout = await Model.DriverPayout.findOne({ driverId: req.body.driverId });

      let withdrawArr = []
      console.log();
      if (DriverPayout.withdrawHistory.length > 0) {
        for (let i = 0; i < DriverPayout.withdrawHistory.length; i++) {
          const element = DriverPayout.withdrawHistory[i];
          let oldobj = {
            withdrawAmount: element.withdrawAmount,
            payoutDone: true,
            createdAt: element.createdAt
          }
          withdrawArr.push(oldobj)
        }
      }

      const paymentWithdraw = await Model.DriverPayout.findOneAndUpdate(
        { driverId: req.body.driverId }, { $set: { withdrawHistory: withdrawArr } });

      return res.success(true, 'Your transfer is on the way.', paymentWithdraw);
    }
  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.serverError, {});
  }
};


async function checkCardDetails(cardResult) {
  try {
    let criteria = {
      brand: cardResult.brand,
      last4Digits: cardResult.last4Digits,
      expiryDate: cardResult.expiryDate
    }
    let cardData = await Model.Card.findOne(criteria);
    if (cardData) {
      if (cardData && cardData.stripeCustomerId && cardData.stripePaymentMethod) {
        cardResult.stripeCustomerId = cardData.stripeCustomerId;
        cardResult.stripePaymentMethod = cardData.stripePaymentMethod;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

async function createStripeCustomer(opts) {
  let response = { status: false, data: {} }
  try {
    let request = {
      payment_method: opts.stripePaymentMethod,
      description: `Customer creation ${opts.name}`,
      metadata: opts.metadata || null,
      email: opts.email || null,
      invoice_settings: {
        default_payment_method: opts.stripePaymentMethod
      }
    }

    let result = await stripe.customers.create(request);
    if (result && result.id) {
      response.status = true,
        response.data = result
      return response
    }
    return response
  } catch (error) {
    response.status = false;
    response.data = error
    return response
  }
}

async function createUserCard(req, res) {
  try {
    if (Validation.isAdminValidate.isValidUserCard(req.body))
      return res.ok(false, Constant.required, {});
    // card create
    const paymentMethod = await stripeTest.paymentMethods.create({
      type: 'card',
      card: {
        number: req.body.cardNumber,
        exp_month: parseInt(req.body.cardExpMonth),
        exp_year: parseInt(req.body.cardExpYear),
        cvc: req.body.cardCvv,
      },
      // card: {
      //   number: '4242424242424242',
      //   exp_month: 9,
      //   exp_year: 2022,
      //   cvc: '314',
      // },
    });

    // user Data
    const userData = await Model.User.findOne({ _id: req.body.userId }, { email: 1, _id: 1 });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const cardDataCheck = await Model.Card.findOne({
      userId: mongoose.Types.ObjectId(req.body.userId),
      isDeleted: false, isBlocked: false
    });
    let stripePaymentMethod = paymentMethod.id;
    let description = `Create customer ${userData.email} -${userData._id}`;
    let meta_data = req.body.meta_data || null;
    let opts = {
      stripePaymentMethod: stripePaymentMethod,
      description: description,
      meta_data: meta_data,
      name: userData.firstName,
      email: userData.email
    }

    // create customer id
    cardData = {
      stripePaymentMethod: paymentMethod.id,
      last4Digits: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      funding: paymentMethod.card.funding,
      expiryDate: paymentMethod.card.exp_month + '-' + paymentMethod.card.exp_year
    }
    let result = await checkCardDetails(cardData);
    if (!result) {
      let stripeDetail = await createStripeCustomer(opts)
      if (!stripeDetail.status) {
        return res.ok(false, Constant.stripCardError, null);
      }
      cardData.userId = req.body.userId;
      cardData.stripeCustomerId = stripeDetail.data.id;
      if (!cardDataCheck) {
        cardData.isDefault = true;
      }
    }
    card = await Model.Card(cardData).save();
    const oldCard = await Model.User.findOne({ '_id': req.body.userId })
    let arr = []
    for (let i = 0; i < oldCard.userCard.length; i++) {
      arr.push(oldCard.userCard[i]);
    }
    arr.push(card.id)
    const finalData = await Model.User.updateOne({ '_id': mongoose.Types.ObjectId(req.body.userId) }, { $set: { userCard: arr } })

    return res.success(true, null, finalData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function deleteCardFromAdmin(req, res) {
  try {
    if (Validation.isAdminValidate.isValiDeleteCard(req.body))
      return res.ok(false, Constant.required, null);

    await Model.Card.deleteOne({
      _id: mongoose.Types.ObjectId(req.body.cardId),
      userId: mongoose.Types.ObjectId(req.body.userId)
    })
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
  EVENT MANAGER API'S
*/

async function createEventManager(req, res) {
  try { 
    if (Validation.isAdminValidate.isEventMangrRegValid(req.body))
      return res.ok(false, Constant.required, null);
      const eventManagerData = await Model.EventManager.findOne({ $or: [{ phone: req.body.phone, isDeleted: false }] });
      if(eventManagerData) {
        return res.ok(false, Constant.eventManagerAlreadyExist, null)
      }
    const encryptKey = await generateRandomString(5);
    let eventManager = await Model.EventManager(req.body).save();
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(eventManager._id)
      , encryptKey: encryptKey
    });
    eventManager.set('token', 'SEM ' + tokenKey, { strict: false });
    await Model.EventManager.findOneAndUpdate({ _id: eventManager._id }, { $set: { token: tokenKey || null } })
    await Model.EventManager.findOneAndUpdate({ _id: eventManager._id }, { $set: { eventManager: true } })

    return res.ok(true, null, eventManager);
  } catch (error) {
    res.ok(false, Constant.error, error);
  }
}

// async function getAllEventManager(req, res) {
//   try {
//     const query = {
//       isDeleted: false,
//       isBlocked: false,
//     }
//     const eventManagerData = await Model.EventManager.find(query);
//     return res.ok(true, 'SUCCESS', eventManagerData)

//   } catch (error) {
//     return res.ok(false, Constant.error, null);
//   }
// }

async function getAllEventManager(req, res){
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const page = parseInt(req.body.page) || 1;
    const search = req.body;
    let filter = [];
    filter.push({ $or: [{}] });
    filter.push({ $or: [{ isDeleted: false, isBlocked: false, isAvailable: true }] });
    if (search.name) filter.push({ $or: [{ name:  search.name }] });
    if (search.phone) filter.push({ $or: [{ phone:  search.phone }] });
    const count = await Model.EventManager.countDocuments().and(filter)
    const offer = await Model.EventManager.find()
      .and(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    let data = offer;
    return res.ok(true, 'SUCCESS', {
        totalPages: Math.ceil(count / limit),
        count: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        data,
      })

  } catch (error) {
    return res.ok(false, Constant.error, error)
  }
}

async function getAllEventManagerList(req, res){
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const page = parseInt(req.body.page) || 1;
    const search = req.body;
    let filter = [];
    filter.push({ $or: [{}] });
    filter.push({ $or: [{ isDeleted: false, isBlocked: false}] });
    if (search.name) filter.push({ $or: [{ name:  search.name }] });
    if (search.phone) filter.push({ $or: [{ phone:  search.phone }] });
    const count = await Model.EventManager.countDocuments().and(filter)
    const offer = await Model.EventManager.find()
      .and(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    let data = offer;
    return res.ok(true, 'SUCCESS', {
        totalPages: Math.ceil(count / limit),
        count: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        data,
      })

  } catch (error) {
    return res.ok(false, Constant.error, error)
  }
}

async function editEventManager(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditEventManager(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.name != undefined && req.body.name != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        name: req.body.name,
        isDeleted: false
      }
      const count = await Model.EventManager.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.EventManagerNameAlreadyExists, {});
      }
    }
    await Model.EventManager.findOneAndUpdate({ _id: req.body._id }, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function deleteEventManager(req, res) {
  try {
    const query = {};
    if (req.body._id) {
      query._id = mongoose.Types.ObjectId(req.body._id);
      query.isDeleted = true
    }
    await Model.EventManager.findByIdAndUpdate({_id: req.body._id}, {isDeleted: true});
    return res.ok(true, "SUCCESS", query);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}

async function getEventManagerById(req, res) {
  try {
    const query = {
      _id: req.params.id
    }
    const data = await Model.EventManager.findById(query);
    return res.ok(true, "SUCEESS", data)
  } catch (error) {
    return res.serverError(Constant.serverError);
  }
}

/*
  EVENT BOOKING API'S
*/

// async function getAllEventBooking(req, res) {
//   try {
    
//     const query = {
//       __v: 0
//     }
//     const data = await Model.EventBooking.find(query);
//     return res.ok(true, 'SUCCESS', data);

//   } catch (error) {
//     return res.ok(false, Constant.error, error)
//   }
// }

async function getAllEventBooking(req, res){
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const page = parseInt(req.body.page) || 1;
    const search = req.body;
    let filter = [];
    filter.push({ $or: [{}] });
    filter.push({ $or: [{ __v:  0 }] });
    if (search.bookingNo) filter.push({ $or: [{ bookingNo:  search.bookingNo }] });
    if (search.eventName) filter.push({ $or: [{ eventName:  search.eventName }] });
    const count = await Model.EventBooking.countDocuments().and(filter)
    const offer = await Model.EventBooking.find()
      .and(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    let data = offer;
    return res.ok(true, 'SUCCESS', {
        totalPages: Math.ceil(count / limit),
        count: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        data,
      })

  } catch (error) {
    return res.ok(false, Constant.error, error)
  }
}

async function getEventBookingById(req, res) {
  try {
    
    const query = {
      _id: req.params.id
    }
    const data = await Model.EventBooking.findById(query);
    return res.ok(true, 'SUCCESS', data);

  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.serverError, error);
  }
} 

async function editEventBooking(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditEventBooking(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.name != undefined && req.body.name != null) {
      let query = {
        _id: { $nin: [req.body._id] },
        name: req.body.name,
        isDeleted: false
      }
      const count = await Model.EventBooking.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.EventBookingNameAlreadyExists, {});
      }
    }
    await Model.EventBooking.findOneAndUpdate({ _id: req.body._id }, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function cancelEventBooking(req, res) {
  try {
    const query = {
      _id: req.body._id
    }
    if(!query) {
      return res.ok(false, Constant.required, null);
    }
    const data = await Model.EventBooking.findOne({_id: req.body._id});
    if(data.bookingStatus === "CANCELLED" || data.isDeleted === true)
    {
      return res.ok(false, 'Booking Already Cancelled', null)
    }
    const data1 = await Model.EventBooking.findOneAndUpdate({_id: req.body._id}, {$set: {bookingStatus:"CANCELLED",  isDeleted: true}});
    return res.ok(true, "SUCCESS", data);
  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.error, error)
  }
}

async function assignEventManager(req, res) {
  try {
    
    const query = {
      _id: req.body._id
    }
    const data = await Model.EventBooking.findOne(query);
    if(data.eventManagerId)
    {
      return res.ok(false, 'You cannot add more than one Event Manager', null);
    };
    const Data = await Model.EventBooking.findOneAndUpdate({_id: req.body._id}, { $set : {eventManagerId: req.body.eventManagerId}});
    const updateData = await Model.EventBooking.findOne(query);
    const updateStatus = await Model.EventManager.findOneAndUpdate({_id: req.body.eventManagerId}, { $set : { isAvailable: false}});
    Service.OtpService.sendSMS(
      updateStatus.countryCode,
      updateStatus.phone,
      `You have been assigned a new Event Booking namely ${Data.eventName}`
    );
    return res.ok(true, 'SUCCESS', updateData);

  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function removeEventManager(req, res) {
  try {
    const data = await Model.EventBooking.findOneAndUpdate({_id: req.params.id}, {eventManagerId: null});
    const managerId = data.eventManagerId;
    const managerData = await Model.EventManager.findOneAndUpdate({_id: managerId}, {$set: { isAvailable: true}});
    const data1 = await Model.EventBooking.findOneAndUpdate({_id: req.params.id}, {eventManagerId: null});
    return res.ok(true, 'SUCCESS', data1)
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function getEventBookingList(req, res) {
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const page = parseInt(req.body.page) || 1;
    const query = { eventManagerId: req.body._id };
    if(!query) {
      return res.ok(false, Constant.error, error);
    }
    const search = req.body;
    let filter = [];
    filter.push({ $or: [{}] });
    filter.push({ $or: [{ __v:  0 }] });
    if (search.bookingNo) filter.push({ $or: [{ bookingNo:  search.bookingNo }] });
    if (search.eventName) filter.push({ $or: [{ eventName:  search.eventName }] });
    const count = await Model.EventBooking.countDocuments().and(filter)
    const offer = await Model.EventBooking.find(query)
      .and(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    let data = offer;
    return res.ok(true, 'SUCCESS', {
        totalPages: Math.ceil(count / limit),
        count: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        data,
      })

  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function eventDriverRate(req, res) {
  try {
    const rate = req.body.ratePerHour;
    const updatedAdmin = await Model.Admin.updateMany({__v: 0}, {rate: rate})
    const adminData = await Model.Admin.findOne({id: req.params.id});
    return res.ok(true, 'SUCCESS', adminData);
  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.serverError, error);
  }
}

async function getDriverRate(req, res) {
  try {
    const admin = await Model.Admin.findOne({__v: 0});
    return res.ok(true, 'SUCCESS', admin.rate);
  } catch (error) {
    return res.ok(false, Constant.serverError, error)
  }
}

/* 
  TEAM BOOKINGS
*/

async function createTeam(req, res) {
  try {
    let arr = [];
    let drivers = [];
    drivers = req.body.driver;
    for (let i = 0; i < drivers.length; i++) {
      const element = drivers[i];
      arr.push(element);
      const eventData = await Model.EventBooking.findOne({_id: req.body._id})
      var driverData = await Model.Driver.findById(element);
      var phone = driverData.phone;
      var Cc = driverData.countryCode;
      Service.OtpService.sendSMS(
        `+${Cc}`,
        phone,
        `You have been assigned as a driver to an Event named ${eventData.eventName}.`
      );
    }
    const data = await Model.EventBooking.findOne({_id: req.body._id});
    // console.log(data);
    const timestamp = data.bookingDate;
    var datec = new Date(timestamp);
    var date = moment(datec).format("DD-MM-YYYY");
    const eventDates = await Model.EventDriver.find();
    for (let i = 0; i < eventDates.length; i++) {
      const element = eventDates[i].bookingDate;
      var date1c = new Date(element);
      var date1 = moment(date1c).format("DD-MM-YYYY");
      if(date1 === date) {
        const data5 = eventDates[i];
        const eventDrivers = data5.driverTeam;
        for (let j = 0; j < arr.length; j++) {
          for (let k = 0; k < eventDrivers.length; k++) {
            const element1 = eventDrivers[k];
            if(arr[j] == eventDrivers[k]) {
              const driver = await Model.Driver.findOne({_id: arr[j]})
              return res.ok(false, `${driver.firstName} ${driver.lastName} is busy`, driver.firstName)
            }
            else {
              console.log("else");
            }
          }
        }
      }
    }

    const len1 = arr.length;
    if( data.driverTeam) {
      return res.ok(false, "Drivers already added", null);
    }
    const len = data.driver;
    if(len1 < len){
      return res.ok(false, 'will need More drivers', null);
    }
    if(len1 > len){
      return res.ok(false, 'Will need less drivers', null);
    }
    const eventData1 = await Model.EventBooking.findOne({_id: req.body._id});
    var a = eventData1._id
    if(len1 === len) {
      let abc;
      a.eventManagerId = eventData1.eventManagerId;
      a.bookingDate = eventData1.bookingDate;
      a.bookingLocalDate = eventData1.bookingLocalDate;
      a.bookingStatus = eventData1.bookingStatus;
      a.isDeleted = eventData1.isDeleted;
      a.driverTeam = arr;
      a.eventId = a;
      // const team = await Model.EventBooking.findOneAndUpdate({_id: req.body._id}, { $set: { driverTeam: arr }} );
      const team = await Model.EventDriver(a).save();
    }
    // const data1 = await Model.EventBooking.findOne({_id: req.body._id});
    return res.ok(true, 'SUCCESS', data);
  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.error, error); 
  }
}

async function createCoDriverTeam(req, res) {
  try {
    let arr = [];
    let Codrivers = [];
    Codrivers = req.body.Codriver;
    for (let i = 0; i < Codrivers.length; i++) {
      const element = Codrivers[i];
      arr.push(element);
    }

    const data = await Model.EventBooking.findOne({_id: req.body._id});
    const timestamp = data.bookingDate;
    var datec = new Date(timestamp);
    var date = moment(datec).format("DD-MM-YYYY");
    const eventDates = await Model.EventDriver.find();
    for (let i = 0; i < eventDates.length; i++) {
      const element = eventDates[i].bookingDate;
      var date1c = new Date(element);
      var date1 = moment(date1c).format("DD-MM-YYYY");
      if(date1 === date) {
        const data5 = eventDates[i];
        const eventCoDrivers = data5.CodriverTeam;
        for (let j = 0; j < arr.length; j++) {
          for (let k = 0; k < eventCoDrivers.length; k++) {
            const element1 = eventCoDrivers[k];
            if(arr[j] == eventCoDrivers[k]) {
              const driver = await Model.Driver.findOne({_id: arr[j]})
              return res.ok(false, `${driver.firstName} ${driver.lastName} is busy`, driver.firstName)
            }
            else {
              console.log("else");
            }
          }
        }
      }
    }
    
    const len1 = arr.length;

    const len = data.coDriver;
    if(len1 < len){
      return res.ok(false, 'will need More Codrivers', null);
    }
    if(len1 > len){
      return res.ok(false, 'Will need less Codrivers', null);
    }
    if(len1 == len) {
      console.log("1");
      const team = await Model.EventDriver.findOneAndUpdate({eventId: req.body._id}, { CodriverTeam: arr } );
    }
    const data1 = await Model.EventBooking.findOne({_id: req.body._id});
    return res.ok(true, 'SUCCESS', data1);
  } catch (error) {
    return res.ok(false, Constant.error, error); 
  }
}

async function getTeamList(req, res) {
  try {
    let arr = [];
    const query = {
      eventId: req.body._id
    }
    const data = await Model.EventDriver.findOne(query);
    const drivers = data.driverTeam;
    for (let i = 0; i < drivers.length; i++) {
      const element = drivers[i];
      const data = await Model.Driver.findOne({_id: element})
      arr.push({element, data});
    }
    return res.ok(true, 'SUCCESS', arr);
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function getCoDriverTeamList(req, res) {
  try {
    let arr = [];
    const query = {
      eventId: req.body._id
    };
    const data = await Model.EventDriver.findOne(query);
    const Codrivers = data.CodriverTeam;
    for (let i = 0; i < Codrivers.length; i++) {
      const element = Codrivers[i];
      const data = await Model.Driver.findOne({_id: element})
      arr.push({element, data});
    }
    return res.ok(true, 'SUCCESS', arr);
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function createTeamBooking(req, res) {
  try {
    req.body.userId = req.body.teamId;
    let promoCodeData = null;
    let isPromoApply = false
    let promoUserdId = ''
    let promoAmount = 0;
    let isSharePercentageDriverCoDriver = false;

    if (Validation.isAdminValidate.isValidCreateTeamBooking(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.totalDistance) {
      req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1609;
    } else {
      req.body.totalDistanceInKm = 0;
    }
    const eventBookingData = await Model.EventBooking.findOne({ _id: req.body.teamId });
    if (!eventBookingData) {
      return res.ok(false, Constant.eventManagerNotFound, null);
    }
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
    if (!adminData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const serviceData = await Model.ServiceType.findOne({
      _id: req.body.seviceTypeId,
      isDeleted: false,
      isBlocked: false
    });
    if (!serviceData) {
      return res.ok(false, Constant.serviceTypeNotFound, null);
    }
    if (req.body.promoCode) {
      promoCodeData = await Model.PromoCode.findOne({
        promoCode: req.body.promoCode,
        isBlocked: false, isDeleted: false
      });
      if (promoCodeData) {
        if (promoCodeData.noOfPromoUsers && promoCodeData.individualUserPromoAttempt) {
          const promoCountUsed = await Model.Booking.countDocuments({
            promoId: mongoose.Types.ObjectId(promoCodeData._id)
          });
          if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
            return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
          }
          const promoCountUsedByUser = await Model.Booking.countDocuments({
            userId: mongoose.Types.ObjectId(req.body.teamId),
            promoId: mongoose.Types.ObjectId(promoCodeData._id)
          });
          if (promoCountUsedByUser >= promoCodeData.individualUserPromoAttempt) {
            return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
          }
        }
        if (promoCodeData.isExpireDateAdded && promoCodeData.expireDate) {
          if (moment(promoCodeData.expireDate).diff(moment().utc()) < 1) {
            return res.ok(false, Constant.promoCodeExpired, null);
          }
        }
        req.body.isPromoApply = true;
        isPromoApply = true
        promoUserdId = promoCodeData._id
        req.body.promoId = promoCodeData ? promoCodeData._id : null;
      } else {
        return res.ok(false, Constant.inValidPromoCode, null);
      }
    }
    const locationData = await Model.EventBooking.findOne({_id: req.body.teamId})
    let pickUpCoordinates = [];
    let pickUpLocation = {};
    if (locationData.pickUplatitude && locationData.pickUplongitude) {
      pickUpCoordinates.push(Number(locationData.pickUplatitude))
      pickUpCoordinates.push(Number(locationData.pickUplongitude))
      pickUpLocation.type = "Point";
      pickUpLocation.coordinates = pickUpCoordinates;
      req.body.pickUpLocation = pickUpLocation;
    }
    if (locationData.pickUpAddress) {
      req.body.pickUpAddress = locationData.pickUpAddress;
      req.body.pickUplatitude = locationData.pickUplatitude;
      req.body.pickUplongitude = locationData.pickUplongitude;
    }
    let droupUpCoordinates = [];
    let droupUpLocation = {};
    if (req.body.dropUplatitude && req.body.dropUplongitude) {
      droupUpCoordinates.push(Number(req.body.dropUplongitude))
      droupUpCoordinates.push(Number(req.body.dropUplatitude))
      droupUpLocation.type = "Point";
      droupUpLocation.coordinates = droupUpCoordinates;
      req.body.droupUpLocation = droupUpLocation;
    }
    if (req.body.dropUpAddress) {
      req.body.dropUpAddress = req.body.dropUpAddress;
    }
    switch (req.body.tripType) {
      case Constant.tripType.roundTrip:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = false;
        req.body.tripType = Constant.tripType.roundTrip;
        req.body.isRoundTrip = true;
        break;
      case Constant.tripType.singleTrip:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = true;
        req.body.tripType = Constant.tripType.singleTrip;
        req.body.isSingleTrip = true;
        break;
      default:
        req.body.isDriverRequired = true;
        req.body.isCoDriverRequired = false;
        req.body.tripType = Constant.tripType.singleTrip;
        req.body.isSingleTrip = true;
        break;
    }
    switch (req.body.paymentMode) {
      case Constant.paymentMode.card:
        req.body.paymentMode = Constant.paymentMode.card;
        req.body.isCashMode = false;
        break;
      default:
        req.body.paymentMode = Constant.paymentMode.card;
        req.body.isCashMode = false;
        break;
    }
    if (req.body.tripType === Constant.tripType.singleTrip) {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
        parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
        parseFloat(adminData.overflowFee)
      );
      req.body.booKingAmount += adminData.baseFare;
    } else {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      req.body.booKingAmount += adminData.baseFare;
    }

    if (req.body.isPromoApply) {
      if (promoCodeData.isCash) {
        promoAmount = promoCodeData.cashback;
      } else {
        promoAmount = parseFloat((parseFloat(req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
      }
      req.body.promoAmount = parseFloat((promoAmount).toFixed(2));
    }

    if (eventBookingData && eventBookingData.pendingAmount) {
      req.body.totalAmount = parseFloat(req.body.booKingAmount + eventBookingData.pendingAmount);
    } else {
      req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
    }
    req.body.cancelAmount = parseFloat(((req.body.booKingAmount * adminData.cancelAmountInPercentage) / 100).toFixed(2));

    if (req.body.totalAmount < 0) {
      req.body.totalAmount = 0;
    }
    req.body.actualAmount = req.body.totalAmount;
    if (req.body.isDriverRequired && req.body.driverId != null &&
      req.body && req.body.isCoDriverRequired && req.body.coDriverId != null) {
      isSharePercentageDriverCoDriver = true;
    }
    let driverEarningAmount = 0;
    let driverSharePercentage = adminData.driverSharePercentage || 0;
    if (isSharePercentageDriverCoDriver) {
      driverSharePercentage = adminData.coDriverSharePercentage || 0;
    }
    driverEarningAmount = parseFloat(((req.body.actualAmount) * driverSharePercentage) / 100).toFixed(2)
    req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
    req.body.driverEarningAmount = driverEarningAmount;

    const Promoamount = promoAmount.toFixed(2);
    var TOTAL = req.body.actualAmount - Promoamount;
    if(TOTAL < 0) {
      TOTAL = 0;
    }
    if (req.body.paymentMode == Constant.paymentMode.wallet &&
      TOTAL > eventBookingData.walletAmount) {
      return res.ok(false, Constant.InsufficientAmount, null);
    }

    req.body.isEventBooking = true;
    req.body.eventId = req.body.teamId;
    const driverData = await Model.Driver.findOne({ _id: req.body.driverId });
    if(driverData.activeStatus === false) {
      return res.ok(false, 'Driver Not Available at the moment' , 'Driver Not Available at the moment');
    }
    const CodriverData = await Model.Driver.findOne({ _id: req.body.CodriverId });
    if(CodriverData.activeStatus === false) {
      return res.ok(false, 'CoDriver Not Available at the moment' , 'CoDriver Not Available at the moment');
    }
    if(driverData) {
      const updateDriverData = await Model.Driver.findOneAndUpdate({ _id: req.body.driverId }, { activeStatus: false });
    }
    if(CodriverData) {
      const updateCoDriverData = await Model.Driver.findOneAndUpdate({ _id: req.body.CodriverId }, { activeStatus: false });
    }

    const bookingData = await Model.Booking(req.body).save();

    //ADD PROMO LOGS...
    if (isPromoApply === true) {
      //ADD PROMO LOG
      const promoBody = {
        bookingId: bookingData._id,
        promoId: promoUserdId,
        userId: req.body.teamId
      }
      await PromoLogCreate(promoBody)
    }

    if (!eventBookingData.isReferralCodeUsed && eventBookingData.referralUserCode) {
      await Model.User.updateOne({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $set: { isReferralCodeUsed: true } });
    }
    let sendUserData = await userDataSend(eventBookingData);
    const sendBookingData = await getCurrentBookingData(bookingData);
    driverController.availableFreeEventDriver(sendBookingData, sendUserData, {});

    let dataToSendForSchedule = {
      bookingData: bookingData,
      adminData: adminData
    }
    return res.ok(true, null, bookingData);
  
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function PromoLogCreate(promoBody) {
  try {
    const promo = {
      bookingId: promoBody.bookingId,
      promoId: promoBody.promoId,
      userId: promoBody.userId
    }
    //ADD LOG 
    const promoLog = await new Model.PromoLog(promo).save();
    if (promoLog) {
      //UPDATE PROMOCODE
      await Model.PromoCode.update({ _id: mongoose.Types.ObjectId(promoBody.promoId) },
        { $inc: { promoAttempt: -1 } });
    }
    //GET PROMOCODE FOR DECRESING NO OF USE
    const promoCodeData = await Model.PromoCode.findOne({
      _id: mongoose.Types.ObjectId(promoBody.promoId),
      isBlocked: false, isDeleted: false
    });
    //IF NO OF USE === 0 DELETE PROMOCODE
    if (promoCodeData.promoAttempt === 0) {
      await Model.PromoCode.findOneAndUpdate({ _id: promoBody.promoId }, { isBlocked: true, isDeleted: true });
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function editTeamBooking(req, res) {
  try {
    if (Validation.isAdminValidate.isValidEditTeamBooking(req.body))
      return res.ok(false, Constant.required, {});
    if (req.body.name != undefined && req.body.name != null) {
      let query = {
        _id: { $nin: [req.body.teamId] },
        name: req.body.name,
        isDeleted: false
      }
      const count = await Model.Booking.countDocuments(query);
      if (count) {
        return res.ok(false, Constant.EventBookingNameAlreadyExists, {});
      }
    }
    await Model.Booking.findOneAndUpdate({ _id: req.body._id }, { $set: req.body });
    return res.ok(true, null, {});
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

// async function getAllTeamBookings(req, res){
//   try {
//     const query = {
//       eventId: req.body._id
//     }
//     // if (que && req.body._id.length == 24) query._id = req.body._id;
//     const limit = parseInt(req.body.limit) || 10;
//     const skip = parseInt(req.body.skip) || 0;
//     if (req.body.search != undefined) {
//       // req.body.search = req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//       query.$or = [
//         // {
//         //   bookingNo: parseInt(req.body.search)
//         // },
//         {
//           firstName: {
//             $regex: req.body.search,
//             $options: 'i',
//           },
//         }
//       ];
//     }
//     const data = await Model.Booking.find(query).populate('driverId').populate('promoId').limit(limit).skip(skip).sort({ createdAt: -1 });
//     return res.ok(true, "SUCCCESS", data);

//   } catch (error) {
//     return res.ok(false, Constant.error, error)
//   }
// }

async function getAllTeamBookings(req, res){
  try {
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;
    const page = parseInt(req.body.page) || 1;
    // const { page = 1, limit = 10 } = req.query;
    const search = req.body;
    let filter = [];
    filter.push({ $or: [{}] });
    filter.push({ $or: [{ eventId:  req.body._id }] });
    if (search.bookingNo) filter.push({ $or: [{ bookingNo:  search.bookingNo }] });
    if (search.firstName) filter.push({ $or: [{ firstName:  search.firstName }] });
    const count = await Model.Booking.countDocuments().and(filter)
    const offer = await Model.Booking.find()
      .and(filter)
      .populate('driverId')
      .populate('promoId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
    let data = offer;
    return res.ok(true, 'SUCCESS', {
        totalPages: Math.ceil(count / limit),
        count: count,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        data,
      })

  } catch (error) {
    return res.ok(false, Constant.error, error)
  }
}

async function getTeamBookingById(req, res){
  try {
    const query = {
      _id: req.body._id
    }
    const pipeline = [
      { $match: { _id: mongoose.Types.ObjectId(req.body._id) } },
      { $match: { isDeleted: false } }, 
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'coDriverId',
          foreignField: '_id',
          as: 'coDriverData'
        }
      },
      {
        $project: {
          vehicleId: 1,
          bookingNo: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          adminId: 1,
          seviceTypeId: 1,
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          vehicleTypeData: { $arrayElemAt: ["$vehicleTypeData", 0] },
          eventTypeData: { $arrayElemAt: ["$eventTypeData", 0] },
          teamData: { $arrayElemAt: ["$teamData", 0] },
          coDriverId: 1,
          isCompleteByCustomer: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          note: 1,
          dropUplongitude: 1,
          pickUpAddress: 1,
          dropUpAddress: 1,
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          droupUpLocationFirst: 1,
          dropUpAddressFirst: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          droupUpLocationSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          droupUpLocationThird: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          droupUpLocationFour: 1,
          dropUpAddressFour: 1,
          bookingDate: 1,
          sheduledDate: 1,
          bookingStatus: 1,
          isAutoAllocated: 1,
          assignBy: 1,
          isSheduledBooking: 1,
          isCanceledByDriver: 1,
          isCanceledByCustomer: 1,
          isCanceledByAdmin: 1,
          isDriverRated: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          pendingAmount: 1,
          timezone: 1,
          isDriverRequired: 1,
          isEventBooking: 1,
          eventName: 1,
          eventDescription: 1,
          block: 1,
          eventLocaltionLatitude: 1,
          eventLocaltionLongitude: 1,
          eventLocaltion: 1,
          eventAddress: 1,
          isTripAllocated: 1,
          eta: 1,
          totalDistanceInKm: 1
        }
      }
    ]
    const data = await Model.Booking.aggregate(pipeline);
    return res.ok(true, 'SUCCESS', data);
  } catch (error) {
    return res.ok(false, Constant.error, error);

  }
}

async function refundStrip(refundObj) {
  let response = { status: false, data: {} }
  try {
    console.log(refundObj);
    let obj = {
      charge: refundObj.charge,
      amount: (refundObj.amount) * 100
    }
    const refund = await stripe.refunds.create(obj);
    if (refund && refund.id) {
      response.status = true
      response.data.refundId = refund.id;
      response.data.amount = refund.amount;
      response.data.paymentIntent = refund.payment_intent;
      return response;
    } else {
      return response;
    }
  } catch (error) {
    response.data.error = error;
    return response;
  }
}

async function deleteTeamBooking(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let driverData = null;
    let coDriverData = null;
    let saveObj = {};
    // let message = Constant.bookingMessages.canceledBookingByUser;
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
    let eventType = Constant.eventType.default;
    if (Validation.isAdminValidate.isValidCancelTeamBooking(req.body))
      return res.ok(false, Constant.required, null);
    let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    // const userData = await Model.EventManager.findOne(req.user.id);
    // console.log(userData);
    // if (!userData) {
    //   return res.ok(false, Constant.userNotFound, null);
    // }
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus === Constant.bookingStatus.CANCELED) {
      return res.ok(false, Constant.alreadyCanceledBookingStatus, null);
    }
    if (!(bookingData.bookingStatus == Constant.bookingStatus.PENDING ||
      bookingData.bookingStatus == Constant.bookingStatus.ACCEPTED ||
      bookingData.bookingStatus == Constant.bookingStatus.ARRIVED)) {
      return res.ok(false, Constant.notAllowedCanceledBookingStatus, null);
    }
    if (bookingData.driverId) {
      driverData = await Model.Driver.findOne({ _id: bookingData.driverId });
      saveObj.driverId = driverData._id;
    }
    if (bookingData.coDriverId) {
      coDriverData = await Model.Driver.findOne({ _id: bookingData.coDriverId });
      saveObj.coDriverId = coDriverData._id;
    }

    if (driverData)
      await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCanceledBooking: 1 } });
    if (coDriverData)
      await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCanceledBooking: 1 } });

    //check for promoamount and refund to wallet or card
    if (bookingData.promoAmount === 0) {
      // refund to user wallet
      // if (bookingData.paymentMode === Constant.paymentMode.wallet) {
      //   //ride cancle PENDING
      //   if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
      //     let updateWallet = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //     console.log("1");
      //     console.log(bookingData.userId);
      //   }
      //   // return res.ok(true, 'SUCCESS', null);
      //   //ride cancle ACCEPTED
      //   if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
      //     let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
      //     let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //   }
      //   //ride cancle ARRIVED
      //   if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
      //     let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
      //     let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //   }
      //   // refund to user card
      // }

      //add refund to user card
      if (bookingData.paymentMode === Constant.paymentMode.card) {
        let amountDeb = 0
        const transactionData = await Model.Transaction.findOne({ bookingId: req.body.bookingId });
        //ride cancle PENDING
        if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
          amountDeb = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
        }
        //ride cancle ACCEPTED
        if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
          amountDeb = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)
        }
        //ride cancle ARRIVED
        if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
          amountDeb = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)
        }
        //create object for refund 
        let refundObj = {
          charge: transactionData.chargeId,
          amount: amountDeb
        }
        //call for refund
        let refundData = await refundStrip(refundObj)
        // save refund response
        let refundSave = {
          userId: transactionData.userId,
          bookingId: transactionData.bookingId,
          cardId: transactionData.cardId,
          chargeId: transactionData.chargeId,
          refundId: refundData.data.refundId,
          paymentIntent: refundData.data.paymentIntent,
          amount: refundData.data.amount / 100,
        }
        let refundDataSave = await Model.Refund(refundSave).save();
      }
    } else {
      // add only promo amount
      // refund to user wallet
      // if (bookingData.paymentMode === Constant.paymentMode.wallet) {
      //   //ride cancle PENDING
      //   if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
      //     let updateWallet = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //   }
      //   //ride cancle ACCEPTED
      //   if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
      //     let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
      //     let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //   }
      //   //ride cancle ARRIVED
      //   if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
      //     let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
      //     let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

      //     await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
      //       { $inc: { walletAmount: parseInt(updateWallet) } });
      //   }
      // }

      //add refund to user card
      if (bookingData.paymentMode === Constant.paymentMode.card) {
        let amountDeb = 0
        const transactionData = await Model.Transaction.findOne({ bookingId: req.body.bookingId });
        if (transactionData) {
          //ride cancle PENDING
          if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
            amountDeb = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
          }
          //ride cancle ACCEPTED
          if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
            let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
            amountDeb = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)
          }
          //ride cancle ARRIVED
          if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
            let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
            amountDeb = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)
          }
          //create object for refund 
          let refundObj = {
            charge: transactionData.chargeId,
            amount: amountDeb
          }
          //call for refund
          let refundData = await refundStrip(refundObj)
          // save refund response
          let refundSave = {
            userId: transactionData.userId,
            bookingId: transactionData.bookingId,
            cardId: transactionData.cardId,
            chargeId: transactionData.chargeId,
            refundId: refundData.data.refundId,
            paymentIntent: refundData.data.paymentIntent,
            amount: refundData.data.amount / 100,
          }
          let refundDataSave = await Model.Refund(refundSave).save();
        }
      }
    }

    // old cancelBooking code
    // if (bookingData.paymentMode == Constant.paymentMode.wallet ||
    //   bookingData.paymentMode == Constant.paymentMode.card) {
    //   await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
    //     { $inc: { walletAmount: ((bookingData.totalAmount - bookingData.cancelAmount)) } });
    // }
    // if (bookingData.paymentMode == Constant.paymentMode.cash) {
    //   await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
    //     { $inc: { walletAmount: ((bookingData.walletAmount - bookingData.cancelAmount)) } });
    // }


    setObj.bookingStatus = Constant.bookingStatus.CANCELED;
    setObj.isCanceledByCustomer = true;

    saveObj.bookingStatus = setObj.bookingStatus;
    saveObj.statusMoveByUser = true;
    saveObj.bookingId = bookingData._id;

    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    if (driverData || coDriverData) {
      await Model.BookingDriverHistory(saveObj).save();
      await Model.BookingDriverRequestLog(saveObj).save();
    }
    if (bookingData.driverId) {
      await driverController.driverAvailabelStausUpdate(driverData);
    }
    if (bookingData.coDriverId) {
      await driverController.driverAvailabelStausUpdate(coDriverData);
    }

    bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    let earningObj = {
      bookingStatus: bookingData.bookingStatus
    }
    await Model.DriverEaring.update({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) },
      { $set: earningObj }, { lean: true, multi: true });

    await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
    let title = Constant.bookingMessages.wingMenTitle;
    let payload = {
      title: title,
      message: message,
      eventType: Constant.eventType.userCancelBooking,
      userId: bookingData.firstName,
      driverData: bookingData.driverId ? driverData : {},
      coDriverData: bookingData.coDriverId ? coDriverData : {},
      userData: bookingData,
      bookingId: bookingData._id,
      isDriverNotification: true,
      isNotificationSave: false
    };
    if (bookingData.driverId) {
      payload.receiverId = bookingData.driverId;
      if (driverData && driverData.isNotification) {
        const driverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.driverId) });
        if (driverDeviceData && driverDeviceData.length) {
          for (let i = 0; i < driverDeviceData.length; i++) {
            payload.token = driverDeviceData[i].deviceToken;
            if (driverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (driverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }
      }

      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }
    if (bookingData.coDriverId) {
      payload.receiverId = bookingData.coDriverId;
      if (coDriverData && coDriverData.isNotification) {
        const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(bookingData.coDriverId) });
        if (coDriverDeviceData && coDriverDeviceData.length) {
          for (let i = 0; i < coDriverDeviceData.length; i++) {
            payload.token = coDriverDeviceData[i].deviceToken;
            if (coDriverDeviceData[i].deviceType == 'IOS') {
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (coDriverDeviceData[i].deviceType == 'ANDROID') {
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
          }
        }
      }
      payload.isNotificationSave = true;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
    }

    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function endEventBooking(req, res) {
  try {
    const eventData = await Model.EventBooking.findOne({ _id: req.params.id});
    var drivers = eventData.driverTeam;
    for (let i = 0; i < drivers.length; i++) {
      const element = drivers[i];
      const driverRideEnd = await Model.Driver.findByIdAndUpdate(element, {$set: {available: true}});
    }
    var Codrivers = eventData.CodriverTeam;
    for (let j = 0; j < Codrivers.length; j++) {
      const element = Codrivers[j];
      const CodriverRideEnd = await Model.Driver.findByIdAndUpdate(element, {$set: {available: true}});
    }
    const eventData1 = await Model.EventBooking.findOneAndUpdate({_id: req.params.id}, {$set: {bookingStatus: 'COMPLETED'}})
    const manager = await Model.EventManager.findOneAndUpdate({_id: eventData1.eventManagerId}, {$set: {isAvailable: true}});
    const eventData2 = await Model.EventBooking.findOne({ _id: req.params.id});
    const phoneNo = eventData2.phone;
    const Cc = `+${eventData2.countryCode}`;
    Service.OtpService.bookingSms1(
      Cc,
      phoneNo,
      `Hello ${eventData2.firstName},\nThank you for allowing Wingmen to have your back! We hope you had a great experience. For more details about your Event Booking click this link - https://wingmen-booking-nu.vercel.app/eventteambooking/${eventData._id}  - Team Wingmen`
    );

    return res.ok(true, 'SUCCESS', eventData2);
    

  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function confirmEventBooking(req, res) {
  try {
    const eventData = await Model.EventBooking.findOne({_id: req.body.eventId});
    if(eventData.paymentStatus == 'PARTIAL') {
      return res.ok(false, 'Payment has already been done', 'Payment has already been done');
    }
    const cardId = eventData.userCard[0];
    const cardData = await Model.Card.findOne({
      _id: mongoose.Types.ObjectId(cardId),
      isDeleted: false, isBlocked: false
    })
    if (!cardData) {
      return res.ok(false, Constant.invalidStripCard, null);
    }
    let paymentObj = {
      amount: parseFloat(eventData.totalAmount / 2),
      stripeCustomerId: cardData.stripeCustomerId,
      stripePaymentMethod: cardData.stripePaymentMethod,
      description: `Payment by ${eventData.firstName} ${eventData.lastName}-${eventData.bookingDate}--${eventData.email}`
    }

    let paymentData = await chargeStrip(paymentObj)
      if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
        paymentObj.trxId = paymentData.data.paymentId;
        paymentObj.captureMethod = paymentData.data.captureMethod;
        paymentObj.chargeId = paymentData.data.chargeId;
        paymentObj.paymentStatus = Constant.paymentStatus.completed;
        paymentObj.userId = eventData.userId;
        paymentObj.cardId = cardData._id;
        let transactionData = await Model.Transaction(paymentObj).save();
        req.body.transactionId = transactionData._id;
        req.body.trxId = transactionData.trxId;
        req.body.isPayementOnStrip = true;
      } 
      else {
        return res.ok(false, Constant.errorInStripCardChargeAmount, null);
      }
      const paymnetDone = await Model.EventBooking.findOneAndUpdate({_id: req.body.eventId}, {$set: {paymentStatus: 'PARTIAL', isAcceptedByAdmin: true}});
    return res.ok(true, 'SUCCESS', paymentObj)
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function chargeStrip(opts) {
  // console.log(opts);
  let response = { status: false, data: {} }
  try {
    if (opts.amount < (0.5)) {
      opts.amount = 0.5;
    }
    opts.amount = parseFloat((opts.amount).toFixed(2));
    let obj = {
      amount: (opts.amount) * 100,
      currency: opts.currency || 'usd',
      customer: opts.stripeCustomerId,
      payment_method: opts.stripePaymentMethod,
      confirm: true,
      off_session: true,
      payment_method_types: ['card'],
      capture_method: opts.hold_payment ? 'manual' : 'automatic',
      description: opts.description || ""
    };
    if (opts.receiptEmail) {
      obj.receipt_email = opts.receiptEmail;
    }
    let chargeData = await stripe.paymentIntents.create(obj);
    if (chargeData && chargeData.id) {
      response.data.paymentId = chargeData.id;
      response.data.amount = chargeData.amount;
      response.data.captureMethod = chargeData.capture_method;
      response.data.stripeCustomerId = chargeData.customer;
      response.data.chargeId = chargeData.charges.data[0].id;
      response.status = true
      return response;
    } else {
      return response;
    }
  } catch (error) {
    return response;
  }
}

async function assignRideByAdmin(req, res) {
  try {
    const query = {
      _id: req.body.bookingId
    }
    const bookingData = await Model.Booking.findOneAndUpdate({_id: req.body.bookingId}, {$set: {driverId: req.body.driverId, assignBy: "ADMIN"}});
    const driverData = await Model.Driver.findOneAndUpdate({_id: req.body.driverId}, {$set: {available: false}});
    const updateBookingData = await Model.Booking.findOne({query});
    return res.ok(true, 'SUCCESS', updateBookingData);
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function completeTeamBooking (req, res) {
  try {
    const driverData = await Model.Driver.findOneAndUpdate({_id: req.body._id}, {$set: {activeStatus: true, available: true}});
    return res.ok(true, 'SUCCESS', driverData);
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function extraHoursAdded(req, res) {
  try {

    const hours = req.body.extraHours;
    const updateEventData = await Model.EventBooking.findOneAndUpdate({_id: req.params.id}, {extraHours: hours});
    var adminRate = await Model.Admin.findOne({__v: 0});
    var ratePerHour = adminRate.rate;
    const updateAmt = hours*ratePerHour;
    const updateTotalAmt = await Model.EventBooking.findOneAndUpdate({_id: req.params.id}, {extraAmount: updateAmt});
    const eventData = await Model.EventBooking.findOne({_id: req.params.id});
    return res.ok(true, 'SUCCESS', eventData);

  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}