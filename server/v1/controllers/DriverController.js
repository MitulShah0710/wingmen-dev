const Model = require('../../models/index');
const Service = require('../../services/index');
const Constant = require('../../Constant');
const Validation = require('../Validations/index');
const fileUpload = require('../../services/FileUploadService');
const Auth = require('../../polices/auth');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const { res } = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');
const cronJob = require('../../v1/cron/cronjobs')
const randomstring = require('randomstring');
const fs = require('fs');
const config = require('../../config/config');
const stripePay = require('stripe');
// const stripeTest = stripePay(config.stripKeyTest);
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);
const cron = require("node-cron");
const { remove } = require('../../models/User');
const { cancelBooking } = require('./UserController');
const { DriverController } = require('.');

exports.createDriver = createDriver;
exports.updateDocuments = updateDocuments;
exports.uploadFile = uploadFile;
exports.getProfile = getProfile;
exports.getOrder = getOrder;
exports.resetDriverPassword = resetDriverPassword;
exports.onOrderComplete = onOrderComplete;
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.verifyOtpForgotPassword = verifyOtpForgotPassword;
exports.forgotResetPassword = forgotResetPassword;
exports.register = register;
exports.loginDriver = loginDriver;
exports.logout = logout;
exports.updateDriver = updateDriver;
exports.driverOnOff = driverOnOff;
exports.driverMode = driverMode;
exports.updateDriverLongLat = updateDriverLongLat;
exports.checkAskPairedRequesTime = checkAskPairedRequesTime;
exports.checkDriver = checkDriver;
exports.nearByDriver = nearByDriver;
exports.driverForBooking = driverForBooking;
exports.getVehicleType = getVehicleType;
exports.addVehicle = addVehicle;
exports.getVehicles = getVehicles;
exports.addFavoriteUnFavoriteDriver = addFavoriteUnFavoriteDriver;
exports.getFavoriteDriverList = getFavoriteDriverList;
exports.askForPaired = askForPaired;
exports.acceptPairedAndSendOtp = acceptPairedAndSendOtp;
exports.addCoDriver = addCoDriver;
exports.removeCoDriver = removeCoDriver;
exports.getCoDriverList = getCoDriverList;
exports.availableFreeDriver = availableFreeDriver;
exports.availableFreeScheduledDriver = availableFreeScheduledDriver;
exports.availableFreeScheduledCoDriver = availableFreeScheduledCoDriver;
exports.viewScheduledRide = viewScheduledRide;
exports.assignScheduledRide = assignScheduledRide;
exports.ScheduledRideVerifyOtp = ScheduledRideVerifyOtp;
exports.ScheduledConfirmBookingStatus = ScheduledConfirmBookingStatus;
exports.ScheduledRideCoDriverVerifyOtp = ScheduledRideCoDriverVerifyOtp;
exports.cancelScheduledBooking = cancelScheduledBooking;
exports.Reminder48 = Reminder48;
exports.Reminder24= Reminder24;
exports.Reminder6 = Reminder6;
exports.sendBroadcastMailtoDrivers = sendBroadcastMailtoDrivers;
exports.acceptedBookingStatus = acceptedBookingStatus;
exports.driverAvailabelStausCheck = driverAvailabelStausCheck;
exports.changeBookingStatus = changeBookingStatus;
exports.ignoreBookingStatus = ignoreBookingStatus;
exports.getAppVersion = getAppVersion;
exports.cronForAutoAllocation = cronForAutoAllocation;
exports.getAllBooking = getAllBooking;
exports.getBookingDetails = getBookingDetails;
exports.getAllNotification = getAllNotification;
exports.clearNotification = clearNotification;
exports.clearAllNotification = clearAllNotification;
exports.enableDisableNotification = enableDisableNotification;
exports.ratingAndReviewToUser = ratingAndReviewToUser;
exports.getCurrentBookingStatus = getCurrentBookingStatus;
exports.driverAvailabelStausUpdate = driverAvailabelStausUpdate;
exports.getUserData = getUserData;
exports.getDriverData = getDriverData;
exports.getCoDriverData = getCoDriverData;
exports.getAllChatMessages = getAllChatMessages;
exports.getAllChatMessagesForDriver = getAllChatMessagesForDriver;
exports.getPayemntHistory = getPayemntHistory;
exports.getPayemntHistoryList = getPayemntHistoryList;
exports.getRatingList = getRatingList;
exports.sendChatBulkPushToDriver = sendChatBulkPushToDriver;
exports.addBank = addBank;
exports.editBank = editBank;
exports.signUpForgotPassword = signUpForgotPassword;
exports.startRideWithOtp = startRideWithOtp;
exports.getBankDetail = getBankDetail;
exports.withdrawPayment = withdrawPayment;
exports.getWithdrawPaymrntHistory = getWithdrawPaymrntHistory;
exports.createStripeAccountStandard = createStripeAccountStandard;
exports.getStripeAccountDetail = getStripeAccountDetail;
exports.deleteStripeAccountDetail = deleteStripeAccountDetail;
exports.getCoDriverBetweenRide = getCoDriverBetweenRide;
exports.addCoDriverOnRide = addCoDriverOnRide;
exports.updateDriverLocation = updateDriverLocation;
exports.availableFreeEventDriver = availableFreeEventDriver;
exports.SendGuestTipLink = SendGuestTipLink;
exports.assignEventDrivers = assignEventDrivers;

async function sendChatBulkPushToDriverDelayTime(driverId, socketData) {
  setTimeout(async function () {
    console.log("delay chat 10 second")
  }, 1000);
}

async function sendChatBulkPushToDriver(driverId, socketData) {
  try {
    if (driverId) {
      const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverId) }, { isNotification: 1 });
      let isNotification = driverData ? driverData.isNotification : false;
      if (isNotification) {
        const driverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(driverId) });
        if (driverDeviceData && driverDeviceData.length) {
          for (let i = 0; i < driverDeviceData.length; i++) {
            if (driverDeviceData[i].deviceType == 'IOS') {
              let payload = {
                token: driverDeviceData[i].deviceToken,
                title: 'New message.',
                message: socketData.message,
                body: socketData.message,
                eventType: socketData.eventType ? socketData.eventType : Constant.eventType.chatSendToDriver,
                isDriverNotification: true,
                isNotificationSave: false,
                isUserDataPass: true,
                isDriverDataPass: socketData.isDriverDataPass ? true : false
              }
              _.extend(payload, socketData);
              Service.PushNotificationService.sendIosPushNotification(payload);
            }
            else if (driverDeviceData[i].deviceType == 'ANDROID') {
              let payload = {
                token: driverDeviceData[i].deviceToken,
                title: 'New message.',
                message: socketData.message,
                body: socketData.message,
                eventType: socketData.eventType ? socketData.eventType : Constant.eventType.chatSendToDriver,
                isDriverNotification: true,
                isNotificationSave: false,
                isUserDataPass: true,
                isDriverDataPass: socketData.isDriverDataPass ? true : false
              }
              _.extend(payload, socketData);
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
            await sendChatBulkPushToDriverDelayTime(driverId, socketData);
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  } catch (error) {
    return true;
  }
}

async function generateRandomString(noOfChars) {
  return randomstring.generate(noOfChars);
};

async function sendBulkPushToDriversDelayTime(bookingData, driverData, inputDriverData, driverDataNotification) {
  setTimeout(async function () {
    console.log("delay 10 second")
    await sendBulkPushToDrivers(bookingData, driverData, inputDriverData, driverDataNotification)
  }, 1000);
}

async function sendBulkPushToDrivers(bookingData, driverData, inputDriverData, driverDataNotification) {
  try {
    if (driverData && driverData.length) {
      inputDriverData = driverData.slice(0, 10);
      driverData = driverData.slice(10, driverData.length);
      if (inputDriverData && inputDriverData.length) {
        const coDriverDeviceData = await Model.Device.find({ driverId: { $in: inputDriverData } });
        console.log('===4', coDriverDeviceData)
        if (coDriverDeviceData && coDriverDeviceData.length) {
          for (let i = 0; i < coDriverDeviceData.length; i++) {
            let obj = _.find(driverDataNotification, { driverId: (coDriverDeviceData[i].driverId).toString() })
            console.log('===5', obj);
            let isNotification = obj ? obj.isNotification : false;
            if (isNotification && coDriverDeviceData[i].deviceType == 'IOS') {
              let payload = {
                token: coDriverDeviceData[i].deviceToken,
                title: Constant.bookingMessages.wingMenTitle,
                message: Constant.bookingMessages.newBookingNotification,
                body: Constant.bookingMessages.newBookingNotification,
                eventType: Constant.eventType.newBookingNotificationSendToDriver,
                socketType: Constant.socketType.driver,
                userId: bookingData.userId,
                bookingId: bookingData._id,
                bookingData: bookingData,
                receiverId: coDriverDeviceData[i].driverId,
                isDriverNotification: true,
                isNotificationSave: false,
                isBookingDataPass: false
              }
              Service.PushNotificationService.sendIosPushNotification(payload);
            }
            else if (isNotification && coDriverDeviceData[i].deviceType == 'ANDROID') {
              let payload = {
                token: coDriverDeviceData[i].deviceToken,
                title: Constant.bookingMessages.wingMenTitle,
                message: Constant.bookingMessages.newBookingNotification,
                body: Constant.bookingMessages.newBookingNotification,
                eventType: Constant.eventType.newBookingNotificationSendToDriver,
                socketType: Constant.socketType.driver,
                userId: bookingData.userId,
                bookingId: bookingData._id,
                bookingData: bookingData,
                receiverId: coDriverDeviceData[i].driverId,
                isDriverNotification: true,
                isNotificationSave: false,
                isBookingDataPass: false
              }
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
            await sendBulkPushToDriversDelayTime(bookingData, driverData, inputDriverData, driverDataNotification);
          }
        } else {
          return true;
        }
      } else {
        return true
      }
    } else {
      return true;
    }
  } catch (error) {
    return true;
  }
}

async function sendBroacastPushToDrivers(SMS, DriverDeviceData, DriverTitle, DriverDescription) {
  console.log(DriverDeviceData);
  if(DriverDeviceData == null ){
    return;
  }
  else 
  {
      if (DriverDeviceData.deviceType == 'IOS') {
        let payload = {
          token: DriverDeviceData.deviceToken,
          title: DriverTitle,
          message: DriverDescription,
          // body: Constant.bookingMessages.newBookingNotification,
          eventType: Constant.eventType.newBookingNotificationSendToDriver,
          socketType: Constant.socketType.driver,
          receiverId: DriverDeviceData.driverId,
          isDriverNotification: true,
          isNotificationSave: false,
          isBookingDataPass: false
        }
        Service.PushNotificationService.sendIosPushNotification(payload);
      }
      if(DriverDeviceData.deviceType == 'ANDROID') {
        let payload = {
          token: DriverDeviceData.deviceToken,
          title: DriverTitle,                 
          message: DriverDescription,
          // body: Constant.bookingMessages.newBookingNotification,
          eventType: Constant.eventType.newBookingNotificationSendToDriver,
          socketType: Constant.socketType.driver,
          receiverId: DriverDeviceData.driverId,
          isDriverNotification: true,
          isNotificationSave: false,
          isBookingDataPass: false
        }
        Service.PushNotificationService.sendAndroidPushNotifiction(payload);
      }
    }
}

async function sendBulkPushToDrivers2(bookingData, driverData, inputDriverData, driverDataNotification) {
  try {
    if (driverData && driverData.length) {
      inputDriverData = driverData.slice(0, 10);
      driverData = driverData.slice(10, driverData.length);
      if (inputDriverData && inputDriverData.length) {
        const coDriverDeviceData = await Model.Device.find({ driverId: { $in: inputDriverData } });
        console.log('===4', coDriverDeviceData)
        if (coDriverDeviceData && coDriverDeviceData.length) {
          for (let i = 0; i < coDriverDeviceData.length; i++) {
            let obj = _.find(driverDataNotification, { driverId: (coDriverDeviceData[i].driverId).toString() })
            console.log('===5', obj);
            let isNotification = obj ? obj.isNotification : false;
            if (isNotification && coDriverDeviceData[i].deviceType == 'IOS') {
              let payload = {
                token: coDriverDeviceData[i].deviceToken,
                title: 'Do you want to join a ride as a co-driver?',
                message: Constant.bookingMessages.bookingNotificationForsingleTrip,
                body: Constant.bookingMessages.bookingNotificationForsingleTrip,
                eventType: Constant.eventType.bookingNotificationSendToDriverForsingleTrip,
                socketType: Constant.socketType.driver,
                userId: bookingData.userId,
                bookingId: bookingData._id,
                bookingData: bookingData,
                receiverId: coDriverDeviceData[i].driverId,
                isDriverNotification: true,
                isNotificationSave: false,
                isBookingDataPass: false
              }
              Service.PushNotificationService.sendIosPushNotification(payload);
            }
            else if (isNotification && coDriverDeviceData[i].deviceType == 'ANDROID') {
              let payload = {
                token: coDriverDeviceData[i].deviceToken,
                title: 'Do you want to join as a co-driver?',
                message: Constant.bookingMessages.bookingNotificationForsingleTrip,
                body: Constant.bookingMessages.bookingNotificationForsingleTrip,
                eventType: Constant.eventType.bookingNotificationSendToDriverForsingleTrip,
                socketType: Constant.socketType.driver,
                userId: bookingData.userId,
                bookingId: bookingData._id,
                bookingData: bookingData,
                receiverId: coDriverDeviceData[i].driverId,
                isDriverNotification: true,
                isNotificationSave: false,
                isBookingDataPass: false
              }
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
            await sendBulkPushToDriversDelayTime(bookingData, driverData, inputDriverData, driverDataNotification);
          }
        } else {
          return true;
        }
      } else {
        return true
      }
    } else {
      return true;
    }
  } catch (error) {
    return true;
  }
}

async function sendBulkNotificationToDriversDelayTime(bookingData, driverData, inputDriverData, userData) {
  setTimeout(async function () {
    console.log("delay 10 second")
    await sendBulkNotificationToDrivers(bookingData, driverData, inputDriverData, userData)
  }, 1000);
}

async function sendBulkNotificationToDrivers(bookingData, driverData, inputDriverData, userData) {
  try {
    if (driverData && driverData.length) {
      inputDriverData = driverData.slice(0, 10);
      driverData = driverData.slice(10, driverData.length);
      if (inputDriverData && inputDriverData.length) {
        for (let i = 0; i < inputDriverData.length; i++) {
          let payload = {
            token: '',
            title: Constant.bookingMessages.wingMenTitle,
            message: Constant.bookingMessages.newBookingNotification,
            body: Constant.bookingMessages.newBookingNotification,
            eventType: Constant.eventType.newBookingNotificationSendToDriver,
            socketType: Constant.socketType.driver,
            userId: bookingData.userId,
            bookingId: bookingData._id,
            bookingData: bookingData,
            receiverId: inputDriverData[i]._id,
            userData: userData || {},
            isDriverNotification: true,
            isNotificationSave: true
          };

          console.log("===1", "sendNotificationToDriver", payload);
          process.emit("sendNotificationToDriver", payload);
          await sendBulkNotificationToDriversDelayTime(bookingData, driverData, inputDriverData, userData);
        }
      } else {
        return true
      }
    } else {
      return true;
    }
  } catch (error) {
    return true;
  }
}

async function sendBulkNotificationToDrivers2(bookingData, driverData, inputDriverData, userData) {
  try {
    if (driverData && driverData.length) {
      inputDriverData = driverData.slice(0, 10);
      driverData = driverData.slice(10, driverData.length);
      if (inputDriverData && inputDriverData.length) {
        for (let i = 0; i < inputDriverData.length; i++) {
          let payload = {
            token: '',
            title: 'Do you want to join a ride as a co-driver?',
            message: Constant.bookingMessages.bookingNotificationForsingleTrip,
            body: Constant.bookingMessages.bookingNotificationForsingleTrip,
            eventType: Constant.eventType.bookingNotificationSendToDriverForsingleTrip,
            socketType: Constant.socketType.driver,
            userId: bookingData.userId,
            bookingId: bookingData._id,
            bookingData: bookingData,
            receiverId: inputDriverData[i]._id,
            userData: userData || {},
            isDriverNotification: true,
            isNotificationSave: true
          };

          process.emit("sendNotificationToDriver", payload);
          await sendBulkNotificationToDriversDelayTime(bookingData, driverData, inputDriverData, userData);
        }
      } else {
        return true
      }
    } else {
      return true;
    }
  } catch (error) {
    return true;
  }
}


async function createDriver(data, res) {
  let coordinates = [data.body.longitude, data.body.latitude];
  let info = data.body.location
  let driverLocation = {
    coordinates,
    info
  }
  switch (data.body.genderType) {
    case 'MALE':
      data.body.genderType = 'MALE';
      break;
    case 'FEMALE':
      data.body.genderType = 'FEMALE';
      break;
    case 'NO_PREFRENCE':
      data.body.genderType = 'NO_PREFRENCE';
      break;
    default:
      data.body.genderType = 'NO_PREFRENCE';
      break;
  }
  const driver = {
    dob: data.body.dob,
    licenceNumber: data.body.licenceNumber,
    issuingDate: data.body.issuingDate,
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
    isTransmissionType: data.body.isTransmissionType,
    genderType: data.body.genderType
  }

  return driver;
};

async function getCurrentBookingStatus(driverData) {
  try {
    if (driverData.driverId) {
      const pipeline = [
        {
          $match: {
            $or: [
              { driverId: mongoose.Types.ObjectId(driverData.driverId) },
              { coDriverId: mongoose.Types.ObjectId(driverData.driverId) }]
          }
        },
        { $match: { bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] } } },
        { $match: { isDeleted: false, isSheduledBooking: false, isEventBooking: false } },
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
            adminId: 1,
            bookingNo: 1,
            userId: 1,
            bookingNo: 1,
            driverId: 1,
            teamId: 1,
            eventTypeId: 1,
            seviceTypeId: 1,
            userData: { $arrayElemAt: ["$userData", 0] },
            coDriverId: 1,
            note: 1,
            driverData: { $arrayElemAt: ["$driverData", 0] },
            vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
            userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
            coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
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
            pickUplatitude: 1,
            isCompleteByCustomer: 1,
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
            actualAmount: 1,
            walletAmount: 1,
            booKingAmount: 1,
            promoAmount: 1,
            totalDistance: 1,
            tripType: 1,
            pendingAmount: 1,
            timezone: 1,
            eventName: 1,
            eventDescription: 1,
            block: 1,
            eventLocaltionLatitude: 1,
            eventLocaltionLongitude: 1,
            eventLocaltion: 1,
            eventAddress: 1,
            isTripAllocated: 1,
            driverEarningAmount: 1
          }
        }
      ];
      const bookingData = await Model.Booking.aggregate(pipeline);
      return bookingData;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getCurrentBookingData(bookingData) {
  try {
    if (bookingData._id) {
      const pipeline = [];
      if (bookingData._id) {
        pipeline.push({ $match: { _id: mongoose.Types.ObjectId(bookingData._id) } });
      }
      if (bookingData.bookingDate) {
        pipeline.push({ $match: { bookingDate: new Date(bookingData.bookingDate) } });
      }
      pipeline.push(
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
        // {
        //   $lookup: {
        //     from: 'users',
        //     localField: 'userId',
        //     foreignField: '_id',
        //     as: 'userData'
        //   }
        // },
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
        // {
        //   $lookup: {
        //     from: 'vehicles',
        //     localField: 'userVehicleId',
        //     foreignField: '_id',
        //     as: 'userVehicleData'
        //   }
        // },
        {
          $project: {
            vehicleId: 1,
            bookingNo: 1,
            vehicleTypeId: 1,
            userVehicleId: 1,
            adminId: 1,
            userId: 1,
            driverId: 1,
            teamId: 1,
            genderType: 1,
            eventTypeId: 1,
            seviceTypeId: 1,
            coDriverId: 1,
            // userData: { $arrayElemAt: ["$userData", 0] },
            driverData: { $arrayElemAt: ["$driverData", 0] },
            vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
            userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
            coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
            booKingAmount: 1,
            promoAmount: 1,
            note: 1,
            totalDistance: 1,
            tripType: 1,
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
            promoAmount: 1,
            booKingAmount: 1,
            promoAmount: 1,
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
            driverEarningAmount: 1
          }
        }
      );
      console.log(bookingDataSend, "CCCCCCCCCCCCCCCCCCC");
      const bookingDataSend = await Model.Booking.aggregate(pipeline);
      return bookingDataSend;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    return false
  }
};

async function registerDevice(body, driverId, isDriver) {
  if (!body.deviceType || !body.deviceToken)
    return false;
  body.deviceType = (body.deviceType).toUpperCase();
  const device = await Model.Device.findOne({ driverId: driverId });
  if (device) {
    try {
      await Model.Device.updateOne({ _id: device._id }, { deviceToken: body.deviceToken, deviceType: body.deviceType });
    } catch (error) {
      console.log(error);
    }
  } else {
    let deviceBody;
    if (isDriver) deviceBody = { driverId: driverId, deviceType: body.deviceType, deviceToken: body.deviceToken, isDriver: true };
    else deviceBody = { driverId: driverId, deviceType: body.deviceType, deviceToken: body.deviceToken, isDriver: true };
    const Device = new Model.Device(deviceBody);
    try {
      await Device.save();
    } catch (error) {
      console.log(error);
    }
  }
};

async function signUpForgotPassword(req, res) {

  if (!req.body.phone || !req.body.type)
    return res.ok(false, Constant.required, null);

  const userData = await Model.Driver.findOne({
    $or: [{ 'email': req.body.phone },
    { 'phone': req.body.phone }], isDeleted: false
  });

  if (userData) {
    const optData = await Model.Otp.findOne({ 'user': req.body.phone });

    if (optData)
      await Model.Otp.deleteMany({ 'user': req.body.phone });

    const Otp = await new Model.Otp({
      otp: Math.floor(100000 + Math.random() * 900000),
      user: req.body.phone, type: req.body.type
    }).save();

    if (req.body.type == 'email') {
      Service.EmailService.sendUserVerifyMail(req.body, Otp);
      return res.ok(true, Constant.verificationCodeSendInEmail, { otpId: Otp._id, otp: Otp.otp });
    }
    if (req.body.type == 'mobile' && req.body.phone) {
      Service.OtpService.sendSMS(req.body.countryCode, req.body.phone, "Wingmen code " + Otp.otp);
      return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
    }
    return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });

  } else {
    return res.ok(false, Constant.userNotFound, null);

  }
};

async function updateDocuments(req, res) {
  if (!req.body.numberPlate &&
    !req.body.insuranceDocuments &&
    !req.body.vehicalRegistration &&
    // !req.body.drivingCertificate &&
    !req.body.vehicleId && (req.body.vehicleId).length != 24)
    return res.ok(false, Constant.required, null);
  let document = {};
  if (req.body.license) {
    document.license = req.body.license;
    document.isLicenseUploaded = true;
  }

  if (req.body.numberPlate) {
    document.plateNumber = req.body.numberPlate;
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
  document.driverId = req.user._id;
  document.isDriverVehicle = true;
  const driverData = await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { profileStatus: 'COMPLETED' });
  let vehicleData = await Model.Vehicle.findOneAndUpdate({ _id: req.body.vehicleId }, { $set: document });
  vehicleData = await Model.Vehicle.findOne({ _id: req.body.vehicleId });
  let dataToSend = {
    driverData: driverData || {},
    vehicleData: vehicleData || {}
  };
  return res.success(true, null, dataToSend);
};

async function uploadFile(req, res) {
  try {
    let data = {};
    if (req.file && req.file.filename) {
      data.orignal = `${Constant.driverImage}/${req.file.filename}`;
      data.thumbNail = `${Constant.driverImage}/${req.file.filename}`;
    }
    return res.ok(true, null, data);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getProfile(req, res) {
  try {
    let dataToSend = {};
    let driverData = await Model.Driver.findOne({ _id: req.user._id });
    let bankData = await Model.Bank.findOne({ userId: req.user._id, isDeleted: false });
    let driverDocumentData = await Model.DriverDocument.findOne({ driverId: req.user._id });
    let pipeline = [];
    pipeline.push(
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      {
        $sort: {
          "createdAt": -1
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
          "transmissionTypeId": 1,
          "carFrontImage": 1,
          "carBackImage": 1,
          "carLeftImage": 1,
          "carRightImage": 1,
          "state": 1,
          "plateNumber": 1
        }
      });
    let vehicleData = await Model.Vehicle.aggregate(pipeline)
    dataToSend.driverData = driverData || {};
    dataToSend.driverDocumentData = driverDocumentData || {};
    dataToSend.bankData = bankData || {};
    if (vehicleData && vehicleData.length) {
      vehicleData = vehicleData[0];
    } else {
      vehicleData = {};
    }
    dataToSend.vehicleData = vehicleData || {};
    return res.ok(true, null, dataToSend)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getOrder(req, res) {
  const limit = req.body.limit ? req.body.limit : 10;
  const skip = req.body.skip ? req.body.skip : 0;
  const orderList = await Model.PlaceOrder.find({
    driver: req.user._id
  }).limit(limit).skip(limit * skip).populate('userId deliveryAddress').sort({
    createdAt: -1
  });
  return res.ok(true, null, orderList);
};

async function resetDriverPassword(req, res) {
  if (Validation.isDriverValid.isChangePasswordValid(req.body)) return res.ok(false, Constant.required, null);
  const driverData = await Model.Driver.findOne({
    _id: req.user._id
  });
  if (!driverData) return res.ok(false, Constant.driverNotFound, null);
  driverData.comparePassword(req.body.oldPassword, match => {
    if (!match) return res.ok(false, 'You have entered an wrong old password.', null);
    driverData.updatePassword(req.body.newPassword).then(hash => {

      Model.Driver.updateOne({
        _id: driverData._id
      }, {
        password: hash
      }).then(() => {
        return res.ok(true, null, null);
      }).catch(error => {
        console.log(error);
        return res.serverError(Constant.serverError);
      });
    });
  });
};

async function onOrderComplete(req, res) {
  if (!req.body.id) return res.ok(false, Constant.required, null);
  try {
    const update = {
      deliveryDate: moment().format(),
      status: 'Delivered'
    }
    await Model.PlaceOrder.findOneAndUpdate({
      _id: req.body.id
    }, {
      $set: update
    });
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function sendOtp(req, res) {
  try {
    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null)

    let otp = Math.floor(100000 + Math.random() * 900000)
    const optData = await Model.Otp({ otp: otp, phoneNo: req.body.phoneNo, countryCode: req.body.countryCode }).save();
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phoneNo, "Wingmen code " + optData.otp);
    return res.ok(true, null, optData);
  } catch (error) {
    console.log(error)
    return res.serverError(error)
  }
};

async function verifyOtp(req, res) {
  try {
    if (!req.body.otp)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp });
    if (otpData && otpData._id) {
      await Model.Otp.deleteOne({ "_id": otpData._id });
      return res.ok(true, null, otpData)
    } else {
      return res.ok(false, Constant.otpError, {})
    }
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function verifyOtpForgotPassword(req, res) {
  try {
    if (!req.body.otp)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp });
    if (otpData && otpData._id) {
      return res.ok(true, null, otpData)
    } else {
      return res.ok(false, Constant.otpError, {})
    }
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function forgotResetPassword(req, res) {
  try {
    if (Validation.isDriverValid.isForgotPasswordValid(req.body))
      return res.ok(false, Constant.required, null);
    const otpData = await Service.OtpService.verify(req.body);
    if (!otpData) {
      return res.ok(false, Constant.otpError, null);
    }
    const driverData = await Model.Driver.findOne({
      phone: otpData.phoneNo,
      countryCode: otpData.countryCode, isDeleted: false
    });
    if (driverData) {
      driverData.updatePassword(req.body.newPassword).then(hash => {

        Model.Driver.updateOne({
          _id: driverData._id
        }, {
          password: hash
        }).then(() => {
          return res.ok(true, null, null);
        }).catch(error => {
          return res.serverError(Constant.serverError);
        });
      });
    } else {
      return res.ok(false, Constant.userNotFound, null);
    }
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function register(req, res) {
  try {
    let dataToSend = {};
    if (Validation.isDriverValid.isDriverRegValid(req.body))
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
    driver.password = req.body.password;
    let driverData = await Model.Driver(driver).save();
    registerDevice(req.body, driverData._id, true);
    const encryptKey = await generateRandomString(5);
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(driverData._id), encryptKey: encryptKey
    });
    driverData.set('token', 'SED ' + tokenKey, { strict: false });
    dataToSend.driverData = driverData || {};
    dataToSend.vehicleData = {};
    await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $set: { token: tokenKey || null } })
    return res.ok(true, Constant.driverRegister, dataToSend)
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function loginDriver(req, res) {
  if (!req.body.phone || !req.body.password || !req.body.countryCode)
    return res.ok(false, Constant.required, null);
  let dataToSend = {};
  let driver = await Model.Driver.findOne({
    phone: req.body.phone,
    countryCode: req.body.countryCode,
    isDeleted: false
  })
  if (!driver) {
    return res.ok(false, Constant.userNotFound, null);
  }
  if (driver.isBlocked) {
    return res.ok(false, Constant.userBlocked, null);
  }
  await bcrypt.compare(req.body.password, driver.password, async (error, matchPassword) => {
    if (error || !matchPassword) {
      return res.ok(false, Constant.passwordNotMatch, null)
    } else {
      await Model.DriverChatMessage.deleteMany({ receiverId: driver._id })
      registerDevice(req.body, driver._id, true);
      let vehicleData = await Model.Vehicle.findOne({ driverId: driver._id });
      const encryptKey = await generateRandomString(5);
      let tokenKey = Service.JwtService.issue({
        _id: Service.HashService.encrypt(driver._id), encryptKey: encryptKey
      })
      driver.set('token', 'SED ' + tokenKey, { strict: false });
      await Model.Driver.findOneAndUpdate({ _id: driver._id }, { $set: { token: tokenKey || null } })
      if (driver.profileStatus != 'Approved') {
        dataToSend.driverData = driver || {};
        dataToSend.vehicleData = vehicleData || {};
        return res.ok(true, Constant.driverRegister, dataToSend)
      } else {
        dataToSend.driverData = driver || {};
        dataToSend.vehicleData = vehicleData || {};
        return res.ok(true, null, dataToSend)
      }
    }
  });
};

async function logout(req, res) {
  let activeStatus = false;
  const encryptKey = await generateRandomString(5);
  let tokenKey = Service.JwtService.issue({
    _id: Service.HashService.encrypt(req.user._id), encryptKey: encryptKey
  })
  await Model.Device.deleteMany({ driverId: req.user._id });
  await Model.DriverChatMessage.deleteMany({ receiverId: req.user._id })
  await Model.Driver.findOneAndUpdate({ _id: req.user._id },
    { activeStatus: activeStatus, tokenKey: tokenKey }, {});
  return res.ok(true, null, {});
};

async function updateDriver(req, res) {
  console.log("================fgfdgfdg", req.user, "============", req.body)
  // if (!req.body.email) return res.ok(false, Constant.required, {})
  let driver = await Model.Driver.findOne({
    _id: req.user._id,
    isDeleted: false
  })
  let dataToSend = {};
  if (!driver)
    return res.ok(false, Constant.driverNotFound, {})
  if (req.body.phone && !req.body.countryCode) {
    delete req.body.phone;
  }
  if (!req.body.phone && req.body.countryCode) {
    delete req.body.countryCode;
  }
  if (req.body.phone && req.body.countryCode) {
    const driverDataCheck = await Model.Driver.find({
      _id: { $nin: [req.body.id, req.body._id, req.user.id, req.user._id] },
      $and: [{ phone: req.body.phone, countryCode: req.body.countryCode }], isDeleted: false
    });
    if (driverDataCheck && driverDataCheck.length) return res.ok(false, Constant.phoneAlreadyExist, null);
    // if (driverDataCheck) {
    //     if (driverDataCheck.phone == req.body.phone) {
    //         return res.ok(false, Constant.phoneAlreadyExist, null);
    //     } else {
    //         return res.ok(false, Constant.driverAlreadyExist, null);
    //     }
    // }
  }
  if (req.body.email) {
    const driverDataCheck = await Model.Driver.findOne({
      _id: { $nin: [req.body.id, req.body._id, req.user.id, req.user._id] },
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
  if (req.body.phone) {
    req.body.isPhoneVerified = false;
  }
  if (req.body.password) {
    const data = await bcrypt.compare(req.body.password, driver.password)

    if (data == true && req.body.newPassword) {
      req.body.password = bcrypt.hashSync(req.body.newPassword, 10);
    } else {
      return res.ok(null, Constant.passwordNotMatch)
    }
  }
  if (req.body.latitude || req.body.longitude) {
    let location = {
      "type": "Point",
      "coordinates": [req.body.longitude, req.body.latitude]
    }
    req.body.driverLocation = location
  }
  if (req.file) {
    driver.image = `${Constant.driverImage}/${req.file.filename}`;
  }
  console.log("================", req.body)
  let driiver = await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: req.body }, { new: true });
  console.log({ driiver })
  let driverData = await Model.Driver.findOne({ _id: req.user._id });
  let vehicleData = await Model.Vehicle.findOne({ driverId: req.user._id });
  dataToSend = {
    driverData: driverData || {},
    vehicleData: vehicleData || {}
  }
  return res.ok(true, null, dataToSend);
};

async function updateDriverLocation(req, res) {
  try {
    if (Validation.isUserValidate.isDriverLocation(req.body))
      return res.ok(false, Constant.required, null);
    let driver = await Model.Driver.findOne({ _id: req.user._id, isDeleted: false })
    if (!driver)
      return res.ok(false, Constant.driverNotFound, {})
    if (req.body.latitude || req.body.longitude) {
      let location = {
        "type": "Point",
        "coordinates": [req.body.longitude, req.body.latitude]
      }
      req.body.driverLocation = location
    }
    let driverUpdate = await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: req.body }, { new: true });
    return res.ok(true, Constant.driverLocationUpdate, driverUpdate);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

/** if driver in co-pilot mode */
async function driverMode(req, res) {
  try {
    if (req.body.isCopilot == undefined || req.body.isCopilot == null)
      return res.ok(false, Constant.required, null);
    let setObj = {
      isCopilot: req.body.isCopilot ? true : false
    };

    let bookingData = await Model.Booking.find({
      $or: [
        { driverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } },
        { coDriverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } }],
      bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
    });
    if (bookingData && bookingData.length) {
      return res.ok(false, Constant.driverHasBusyOnBooking, {})
    }
    if (setObj.isCopilot) {
      setObj.isPilot = false;
      setObj.coDriverId = null;
    } else {
      setObj.isPilot = true;
    }
    if (!setObj.isCopilot) {
      let vehicleData = await Model.Vehicle.find({ driverId: mongoose.Types.ObjectId(req.user._id) });
      if (vehicleData && vehicleData.length == 0) {
        return res.ok(false, Constant.driverHasNotVehicle, {})
      }
    }
    let driverData = await Model.Driver.findOne({ _id: req.user._id });
    if (driverData && driverData.isPairedDriver && driverData.isCopilot != setObj.isCopilot) {
      return res.ok(false, Constant.unPairedFirst, {})
    } else {
      delete setObj.coDriverId;
    }
    if (driverData && driverData.coDriverId) {
      bookingData = await Model.Booking.find({
        $or: [
          { driverId: { $in: [mongoose.Types.ObjectId(driverData.coDriverId)] } },
          { coDriverId: { $in: [mongoose.Types.ObjectId(driverData.coDriverId)] } }],
        bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
      });
      if (bookingData && bookingData.length) {
        return res.ok(false, Constant.driverHasBusyOnBooking, {})
      }
    }
    if (driverData && driverData.isPairedDriver && driverData.isPilot) {
      return res.ok(false, Constant.unPairedFirst, {})
    }

    await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: setObj });
    driverData = await Model.Driver.findOne({ _id: req.user._id });
    return res.ok(true, null, driverData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function driverOnOff(req, res) {
  let activeStatus = false;
  if (req.body.activeStatus != undefined && req.body.activeStatus != null) {
    activeStatus = req.body.activeStatus ? true : false;
  }
  let available = true;
  let bookingData = await Model.Booking.find({
    $or: [
      { driverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } },
      { coDriverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } }],
    bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
  });
  if (bookingData && bookingData.length) {
    available = false;
  }
  const upadtedDriver = await Model.Driver.findOneAndUpdate({
    _id: req.user._id
  }, {
    activeStatus: activeStatus,
    available: available
  }, {
    new: true
  });
  upadtedDriver.activeStatus = activeStatus;
  return res.ok(true, null, upadtedDriver);
};

/** update driver lattitude and longitude */

async function updateDriverLongLat(driverData) {
  if (driverData && driverData.driverId && driverData.latitude && driverData.longitude) {
    let update = {
      latitude: driverData.latitude,
      longitude: driverData.longitude,
      driverLocation: {
        "type": "Point",
        coordinates: [
          driverData.longitude,
          driverData.latitude
        ]
      }
    }
    await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(driverData.driverId) }, { $set: update });
    return true;
  } else {
    return false;
  }
};

async function checkAskPairedRequesTime(driverData) {
  if (driverData && driverData.driverId) {
    let data = {};
    let criteria = {
      $or: [{ driverId: driverData.driverId }, { receiverId: driverData.driverId }],
      expiryDate: {
        $gte: new Date(moment())
      }
    }
    data = await Model.PairedDriverRequest.findOne(criteria);
    if (data) {
      let isShowGenratePopUp = true;
      let isShowOtpPopUp = false;
      let sendObj = { expiryDate: data.expiryDate || null, isShowPopUp: true }
      let driver = {};
      if ((data.driverId).toString() == (driverData.driverId).toString()) {
        isShowGenratePopUp = false;
        isShowOtpPopUp = true;
      }
      if (!isShowOtpPopUp) {
        driver = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(data.driverId) });
        sendObj.isShowOtpPopUp = isShowOtpPopUp;
        sendObj.isShowGenratePopUp = isShowGenratePopUp;
        sendObj.driverData = driver;
        return sendObj;
      } else {
        driver = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(data.receiverId) });
        sendObj.isShowOtpPopUp = isShowOtpPopUp;
        sendObj.isShowGenratePopUp = isShowGenratePopUp;
        sendObj.driverData = driver;
        return sendObj;
      }
    } else {
      criteria = {
        $or: [{ driverId: driverData.driverId }, { receiverId: driverData.driverId }]
      }
      let count = await Model.PairedDriverRequest.countDocuments(criteria);
      if (count) {
        await Model.PairedDriverRequest.deleteMany(criteria);
      }
      return { isShowPopUp: false };
    }
  } else {
    return { isShowPopUp: false };
  }
};

async function checkDriver(req, res) {
  if (!(req.body.phone && req.body.countryCode)) return res.ok(null, Constant.required)
  await Model.Driver.findOne({
    $and: [{
      phone: req.body.phone
    }, {
      countryCode: req.body.countryCode
    }],
    isDeleted: false

  }).then(match => {
    if (match != null) {
      res.send({
        status: 1,
        message: 'your are already register'
      })
    } else {
      res.send({
        status: 0,
        message: 'you are not register'
      })
    }
  }).catch(err => {
    res.send(err)
  })
};

async function nearByDriver(req, res) {
  try {
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
    const driver = await Model.Driver.findOne({ _id: req.user._id });
    if (!driver) {
      res.ok(false, Constant.driverNotFound, {})
    }
    if (Validation.isDriverValid.isValidLatLong(req.body))
      return res.ok(false, Constant.required, null);
    let criteria = {
      _id: { $nin: [req.user._id] },
      isPairedDriver: false,
      isBlocked: false,
      isDeleted: false,
      available: true,
      activeStatus: true,
      isApproved: true,
      driverLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [req.body.longitude, req.body.latitude
            ]
          },
          $minDistance: 0,
          $maxDistance: adminData ? adminData.area : 500
        }
      }
    }
    if (driver.isCopilot) {
      criteria.isCopilot = false;
      criteria.isPilot = true;
    }
    if (driver.isPilot) {
      criteria.isPilot = false;
      criteria.isCopilot = true;
    }
    const driverData = await Model.Driver.find(criteria)

    if (driverData && driverData.length) {
      res.ok(true, Constant.nearByDriver, driverData);
    } else {
      res.ok(false, Constant.driverNotFound, {})
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function driverForBooking(req, res) {
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  await Model.driver.findOne({
    driverLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [req.body.longitude, req.body.latitude
          ]
        },
        $minDistance: 0,
        $maxDistance: adminData ? adminData.area : 500
      }
    }
  }).then(driver => {
    console.log('driver is ', driver);
  })
};

async function getVehicleType(req, res) {
  try {
    let dataToSend = {};
    const query = { isDeleted: false, isBlocked: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;
    const vehicleTypeCount = await Model.VehicleType.countDocuments(query);
    dataToSend.vehicleTypeCount = vehicleTypeCount || 0;
    const vehicleTypeData = await Model.VehicleType.find(query).sort({ createdAt: -1 })
    dataToSend.vehicleTypeData = vehicleTypeData || [];
    const transmissionTypeCount = await Model.TransmissionType.countDocuments(query);
    dataToSend.transmissionTypeCount = transmissionTypeCount || 0;
    const trannsmissionTypeData = await Model.TransmissionType.find(query).sort({ createdAt: -1 })
    dataToSend.trannsmissionTypeData = trannsmissionTypeData || [];
    const stateCount = await Model.State.countDocuments(query);
    dataToSend.stateCount = stateCount || 0;
    const stateData = await Model.State.find(query).sort({ createdAt: -1 })
    dataToSend.stateData = stateData || [];
    dataToSend.vehicleColors = Constant.vehicleColors || [];
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function addVehicle(req, res) {
  try {

    if (Validation.isDriverValid.isaddVehicleValid(req.body))
      return res.ok(false, Constant.required, null);

    req.body.driverId = req.user._id;
    let coordinates = [];
    let location = {};
    if (req.body.latitude && req.body.longitude) {
      coordinates.push(Number(req.body.longitude))
      coordinates.push(Number(req.body.latitude))
      location.type = "Point";
      location.coordinates = coordinates
    }
    req.body.location = location;
    req.body.isDriverVehicle = true;
    const vehicleData = await new Model.Vehicle(req.body).save();
    return res.ok(true, null, vehicleData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getVehicles(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    query.driverId = req.user._id;
    let limit = parseInt(req.query.limit || 10);
    let skip = parseInt(req.query.skip || 0);
    const count = await Model.Vehicle.countDocuments(query);
    let pipeline = [];
    if (req.query._id && req.query._id.length == 24) {
      pipeline.push({ $match: { _id: req.query._id } })
    }
    pipeline.push(
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { isDeleted: false } },
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
          //"numberPlate":1,
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
ADD FAVORITE DRIVER API'S
*/
async function addFavoriteUnFavoriteDriver(req, res) {
  try {

    if (Validation.isDriverValid.isaddFavoriteValid(req.body))
      return res.ok(false, Constant.required, null);
    console.log("######fav", req.body)
    if (!req.body.isFavorite) {
      await Model.FavoriteDriver.deleteMany({
        driverId: mongoose.Types.ObjectId(req.user._id),
        favoriteDriverId: mongoose.Types.ObjectId(req.body.favoriteDriverId)
      });
      return res.ok(true, null, {});
    } else {
      await Model.FavoriteDriver.findOneAndUpdate({
        driverId: req.user._id,
        favoriteDriverId: req.body.favoriteDriverId
      }, { $set: { isFavorite: req.body.isFavorite, isDeleted: false, isBlocked: false } }, { new: true, upsert: true });
      return res.ok(true, null, {});
    }
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getFavoriteDriverList(req, res) {
  try {
    const query = { isDeleted: false };
    if (req.body._id && req.body._id.length == 24) query._id = req.body._id;
    if (req.query.isFavorite != undefined && req.query.isFavorite != null)
      query.isFavorite = req.body.isFavorite;
    query.driverId = req.user._id;
    let limit = parseInt(req.body.limit || 10);
    let skip = parseInt(req.body.skip || 0);
    const count = await Model.FavoriteDriver.countDocuments(query);
    let pipeline = [];
    if (req.body._id && (req.body._id).length == 24) {
      pipeline.push({ $match: { _id: mongoose.Types.ObjectId(req.body._id) } })
    }
    if (req.body.isFavorite != undefined && req.body.isFavorite != null) {
      pipeline.push({ $match: { isFavorite: req.body.isFavorite } })
    }
    pipeline.push(
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { isDeleted: false } },
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
          from: 'drivers',
          localField: 'driverId',
          foreignField: '_id',
          as: 'driverData'
        }
      },
      {
        $lookup: {
          from: 'drivers',
          localField: 'favoriteDriverId',
          foreignField: '_id',
          as: 'favoriteDriverData'
        }
      },
      {
        $project: {
          "id": 1,
          "driverId": 1,
          "favoriteDriverId": 1,
          "driverData": { $arrayElemAt: ["$driverData", 0] },
          "favoriteDriverData": { $arrayElemAt: ["$favoriteDriverData", 0] },
          "isFavorite": 1,
          "createdAt": 1
        }
      });
    const favoriteData = await Model.FavoriteDriver.aggregate(pipeline)
    let dataToSend = {
      count: count,
      favoriteData: favoriteData
    }
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
ADD PAIRED DRIVER API'S
*/
async function askForPaired(req, res) {
  try {
    if (Validation.isDriverValid.isaskPairedDriverValid(req.body))
      return res.ok(false, Constant.required, null);
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(req.user._id) })
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(req.body.pairedDriverId) })
    const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(req.user._id) });
    if (!driverData) {
      res.ok(false, Constant.driverNotFound, {})
    }
    const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(req.body.pairedDriverId) });
    if (!coDriverData) {
      res.ok(false, Constant.driverNotFound, {})
    }
    let criteria = { driverId: req.user._id };
    Model.PairedDriverRequest.deleteMany(criteria);

    await Model.PairedDriverRequest({
      driverId: req.user._id,
      receiverId: req.body.pairedDriverId,
      expiryDate: new Date(moment().add(1, 'm'))
    }).save();
    let payload = {
      title: 'You have new pairing request.',
      message: Constant.bookingMessages.askTopairedDriver,
      eventType: Constant.eventType.pairedNotification,
      driverId: req.user._id,
      driverData: driverData,
      coDriverData: coDriverData,
      receiverId: req.body.pairedDriverId,
      isDriverNotification: true,
      isNotificationSave: false
    }
    if (coDriverData && coDriverData.isNotification) {
      const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) });
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

    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null);

    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null)
    let otp = Math.floor(100000 + Math.random() * 900000)
    const optData = await Model.Otp({
      otp: otp,
      phoneNo: req.body.phoneNo,
      countryCode: req.body.countryCode,
      driverId: req.body.pairedDriverId
    }).save();
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phoneNo, "Wingmen code " + optData.otp);
    return res.ok(true, Constant.otpSuccessfully, optData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function acceptPairedAndSendOtp(req, res) {
  try {
    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null);

    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null)
    let otp = Math.floor(100000 + Math.random() * 900000)
    const optData = await Model.Otp({
      otp: otp, phoneNo: req.body.phoneNo,
      countryCode: req.body.countryCode, driverId: req.user._id
    }).save();
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phoneNo, "Wingmen code " + optData.otp);
    return res.ok(true, Constant.otpSuccessfully, optData);
  } catch (error) {
    return res.serverError(error)
  }
};

async function addCoDriver(req, res) {
  try {
    let setObj = {};
    let driverId = null;
    let coDriverId = null;
    if (Validation.isDriverValid.isaddPairedDriverValid(req.body))
      return res.ok(false, Constant.required, null);
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp, driverId: req.body.pairedDriverId });
    if (otpData && otpData._id) {
      await Model.Otp.deleteOne({ "_id": otpData._id });
    }
    if (!otpData) {
      return res.ok(false, Constant.otpError, {})
    }
    let criteria = {
      $or: [{ driverId: req.user._id }, { receiverId: req.user._id }]
    }
    Model.PairedDriverRequest.deleteMany(criteria);
    const driver = await Model.Driver.findOne({ _id: req.user._id });
    if (!driver) {
      res.ok(false, Constant.driverNotFound, {})
    }
    if (driver.isPilot) {
      driverId = driver._id;
      coDriverId = req.body.pairedDriverId;
    } else {
      driverId = req.body.pairedDriverId;
      coDriverId = driver._id;
    }
    const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverId) });
    if (!driverData) {
      res.ok(false, Constant.driverNotFound, {})
    }
    if (driverData && driverData.isPairedDriver) {
      res.ok(false, Constant.driverAlreadyPaired, driverData)
    }
    const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(coDriverId) }).populate({ path: 'coDriverId' });
    if (!coDriverData) {
      res.ok(false, Constant.driverNotFound, {})
    }
    if (coDriverData && coDriverData.isPairedDriver) {
      res.ok(false, Constant.driverAlreadyPaired, {})
    }
    if (driverData.isPilot == coDriverData.isPilot) {
      res.ok(false, Constant.bothDriverPilot, {})
    }
    if (driverData.isCopilot == coDriverData.isCopilot) {
      res.ok(false, Constant.bothDriverCopilot, {})
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
    // for accept ride
    // if (bookingData && bookingData.length) {
    //   return res.ok(false, Constant.driverHasBusyOnBooking, {})
    // }
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
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(req.user._id) })
    await Model.DriverChatMessage.deleteMany({ receiverId: mongoose.Types.ObjectId(req.body.pairedDriverId) })
    const isFavorite = await Model.FavoriteDriver.countDocuments({
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id), favoriteDriverId: mongoose.Types.ObjectId(req.body.pairedDriverId) },
      { favoriteDriverId: mongoose.Types.ObjectId(req.user._id), driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) }]
    })
    let payload = {
      title: 'You are paired successfully.',
      message: Constant.bookingMessages.pired,
      eventType: Constant.eventType.pairedSuccessfullyNotification,
      driverId: req.user._id,
      driverData: driverData,
      coDriverData: coDriverData,
      receiverId: req.body.pairedDriverId,
      isDriverNotification: true,
      isNotificationSave: false,
      isFavorite: isFavorite ? true : false
    };
    if (coDriverData && coDriverData.isNotification) {
      const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) });
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
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    return res.ok(true, null, await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(coDriverId) }, { $set: setObj }, { lean: true }).populate({ path: 'coDriverId' }));
  } catch (error) {
    console.log(error, '');
    return res.ok(Constant.serverError);
  }
};

async function removeCoDriver(req, res) {
  try {
    let setObj = {};
    let driverId = null;
    let coDriverId = null;
    if (Validation.isDriverValid.isRemovePairedDriverValid(req.body))
      return res.ok(false, Constant.required, null);
    const driver = await Model.Driver.findOne({ _id: req.user._id });
    if (!driver) {
      res.ok(false, Constant.driverNotFound, {})
    }
    if (driver.isPilot) {
      driverId = driver._id;
      coDriverId = req.body.pairedDriverId;
    } else {
      driverId = req.body.pairedDriverId;
      coDriverId = driver._id;
    }
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
    let payload = {
      title: 'You are unpaired successfully.',
      message: Constant.bookingMessages.unPaired,
      eventType: Constant.eventType.unPairedNotification,
      driverId: req.user._id,
      driverData: driverData,
      coDriverData: coDriverData,
      receiverId: req.body.pairedDriverId,
      isDriverNotification: true,
      isNotificationSave: false
    };
    if (coDriverData && coDriverData.isNotification) {
      const coDriverDeviceData = await Model.Device.find({ driverId: mongoose.Types.ObjectId(req.body.pairedDriverId) });
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
    return res.success(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getCoDriverList(req, res) {
  try {
    let dataToSend = {};
    const driverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(req.user._id) });
    if (!driverData) {
      res.ok(false, Constant.driverNotFound, {})
    }
    const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverData.coDriverId) });
    let isFavorite = await Model.FavoriteDriver.countDocuments({
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id), favoriteDriverId: mongoose.Types.ObjectId(driverData.coDriverId) },
      { favoriteDriverId: mongoose.Types.ObjectId(req.user._id), driverId: mongoose.Types.ObjectId(driverData.coDriverId) }]
    })
    dataToSend.isFavorite = isFavorite ? true : false;
    dataToSend.driverData = driverData || {};
    dataToSend.coDriverData = coDriverData || {};
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
DRIVER ALLOCATION
*/
async function availableFreeDriver(bookingData, userData, extraObj) {
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  let criteria = {
    available: true,
    isApproved: true,
    activeStatus: true,
    isBlocked: false,
    isDeleted: false,
    isCopilot: false,
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
  //for driver and co-driver paired

  // if (bookingData.isCoDriverRequired && bookingData.isDriverRequired) {
  //   criteria.isPairedDriver = true;
  //   criteria.isCopilot = true;
  // } else {
  //   criteria.isCopilot = false;
  //   criteria.isPairedDriver = false;
  // }
  if (bookingData.genderType == 'MALE' || bookingData.genderType == 'FEMALE') {
    criteria.genderType = bookingData.genderType;
  }
  console.log("availableFreeDriver", JSON.stringify(criteria))
  const driverData = await Model.Driver.find(criteria, { _id: 1, coDriverId: 1, isNotification: 1 }, {});
  console.log('===driverrrrData', driverData);
  if (driverData && driverData.length > 0) {
    let finalDriverData = []; let finalDriverDataIds = []; let driverDataNotification = [];
    for (let i = 0; i < driverData.length; i++) {
      finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i]._id))
      driverDataNotification.push({
        driverId: (driverData[i]._id).toString(),
        isNotification: driverData[i].isNotification
      });
      finalDriverData.push({ _id: driverData[i]._id });
      if (driverData[i].coDriverId) {
        finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i].coDriverId))
        driverDataNotification.push({
          driverId: (driverData[i].coDriverId).toString(),
          isNotification: driverData[i].isNotification
        });
        finalDriverData.push({ _id: driverData[i].coDriverId });
      }
    }
    console.log("===0", driverData)
    sendBulkNotificationToDrivers(bookingData, finalDriverData, [], userData)
    sendBulkPushToDrivers(bookingData, finalDriverDataIds, [], driverDataNotification);
    return true;
  } else {
    return false;
  }
};

async function availableFreeEventDriver(bookingData, userData, extraObj) {
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  let criteria = {
  //   available: true,
  //   isApproved: true,
  //   activeStatus: true,
    isBlocked: false,
    isDeleted: false,
  //   isCopilot: false,
    
  //   driverLocation: {
  //     $near: {
  //       $geometry: {
  //         type: "Point",
  //         coordinates: [bookingData.pickUplongitude,
  //         bookingData.pickUplatitude
  //         ]
  //       },
  //       $minDistance: 0,
  //       $maxDistance: adminData ? adminData.area : 500
  //     }
    _id: bookingData.driverData._id
    // }
  };
  //for driver and co-driver paired

  // if (bookingData.isCoDriverRequired && bookingData.isDriverRequired) {
  //   criteria.isPairedDriver = true;
  //   criteria.isCopilot = true;
  // } else {
  //   criteria.isCopilot = false;
  //   criteria.isPairedDriver = false;
  // }
  // console.log(bookingData.driverData);
  // console.log(bookingData.driverData.phone);
  // return true;
  if (bookingData.genderType == 'MALE' || bookingData.genderType == 'FEMALE') {
    criteria.genderType = bookingData.genderType;
  }
  // console.log("availableFreeDriver", JSON.stringify(criteria)) 
  const driverData = await Model.Driver.find(criteria, { _id: 1, coDriverId: 1, isNotification: 1 }, {});
  console.log('===driverrrrData', driverData);
  // return;
  if (driverData && driverData.length > 0) {
    let finalDriverData = []; let finalDriverDataIds = []; let driverDataNotification = [];
    for (let i = 0; i < driverData.length; i++) {
      finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i]._id))
      driverDataNotification.push({
        driverId: (driverData[i]._id).toString(),
        isNotification: driverData[i].isNotification
      });
      finalDriverData.push({ _id: driverData[i]._id });
      if (driverData[i].coDriverId) {
        finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i].coDriverId))
        driverDataNotification.push({
          driverId: (driverData[i].coDriverId).toString(),
          isNotification: driverData[i].isNotification
        });
        finalDriverData.push({ _id: driverData[i].coDriverId });
      }
    }
    console.log("===0", driverData);
    const driverBusy = await Model.Driver.findOneAndUpdate({_id: driverData._id}, {available: false})
    sendBulkNotificationToDrivers(bookingData, finalDriverData, [], userData)
    sendBulkPushToDrivers(bookingData, finalDriverDataIds, [], driverDataNotification);
    return true;
  } else {
    return false;
  }
};

async function availableFreeDriver2(bookingData, userData, extraObj) {
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  let criteria = {
    available: true,
    isApproved: true,
    activeStatus: true,
    isBlocked: false,
    isDeleted: false,
    // isCopilot: true,
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
  if (bookingData.genderType == 'MALE' || bookingData.genderType == 'FEMALE') {
    criteria.genderType = bookingData.genderType;
  }
  console.log("availableFreeDriver", JSON.stringify(criteria))
  const driverData = await Model.Driver.find(criteria, { _id: 1, coDriverId: 1, isNotification: 1 }, {});
  console.log('===driverrrrData', driverData);
  if (driverData && driverData.length > 0) {
    let finalDriverData = []; let finalDriverDataIds = []; let driverDataNotification = [];
    for (let i = 0; i < driverData.length; i++) {
      finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i]._id))
      driverDataNotification.push({
        driverId: (driverData[i]._id).toString(),
        isNotification: driverData[i].isNotification
      });
      finalDriverData.push({ _id: driverData[i]._id });
      if (driverData[i].coDriverId) {
        finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i].coDriverId))
        driverDataNotification.push({
          driverId: (driverData[i].coDriverId).toString(),
          isNotification: driverData[i].isNotification
        });
        finalDriverData.push({ _id: driverData[i].coDriverId });
      }
    }
    console.log("===0", driverData)
    sendBulkNotificationToDrivers2(bookingData, finalDriverData, [], userData)
    sendBulkPushToDrivers2(bookingData, finalDriverDataIds, [], driverDataNotification);
    return true;
  } else {
    return false;
  }
};

// SCHEDULED RIDE API'S

async function availableFreeScheduledDriver(bookingData, sendUserData, extraObj) {
  console.log("here");
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  let criteria1 = {
    available: true,
    isApproved: true,
    activeStatus: true,
    isBlocked: false,
    isDeleted: false,
    isCopilot: false,
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
  if (bookingData.genderType == 'MALE' || bookingData.genderType == 'FEMALE') {
    criteria1.genderType = bookingData.genderType;
  }
  const driverData = await Model.Driver.find(criteria1, { _id: 1, coDriverId: 1, email: 1 }, {});
  // console.log('===driverrrrData', driverData);
  if (driverData && driverData.length > 0) {
    let finalDriverData = []; let finalDriverDataIds = []; 
    for (let i = 0; i < driverData.length; i++) {
      finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i]._id))
      driverId = (driverData[i]._id).toString();
        Service.EmailService.sendScheduleDriverRequestMail(driverData[i], bookingData);
      finalDriverData.push({ _id: driverData[i]._id });
      if (driverData[i].coDriverId) {
        finalDriverDataIds.push(mongoose.Types.ObjectId(driverData[i].coDriverId))
        finalDriverData.push({ _id: driverData[i].coDriverId });
      }
    }
    return true;
  } else {
    return false;
  }
};

async function availableFreeScheduledCoDriver(req, res) {
  const query = {
    bookingId: req.body._id
  }
  const bookingData = await Model.Future.findOne(query);  
  const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, { area: 1 }, {})
  let criteria2 = {
    available: true,
    isApproved: true,
    activeStatus: true,
    isBlocked: false,
    isDeleted: false,
    isCopilot: true,
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
  const CodriverData = await Model.Driver.find(criteria2, { _id: 1, coDriverId: 1, email: 1 }, {});
  if (CodriverData && CodriverData.length > 0) {
    let finalCoDriverData = []; let finalCoDriverDataIds = [];
  for (let i = 0; i < CodriverData.length; i++) {
    finalCoDriverDataIds.push(mongoose.Types.ObjectId(CodriverData[i]._id))
    coDriverId = (CodriverData[i]._id).toString();
      Service.EmailService.sendScheduleCoDriverRequestMail(CodriverData[i], bookingData);
      // return res.ok(true, Constant.verificationCodeSendInEmail, driverData);
    finalCoDriverData.push({ _id: CodriverData[i]._id });
    if (CodriverData[i].coDriverId) {
      finalCoDriverDataIds.push(mongoose.Types.ObjectId(CodriverData[i].coDriverId))
      finalCoDriverData.push({ _id: CodriverData[i].coDriverId });
    }
  }
  return res.ok(true, {}, {});
}
};

async function viewScheduledRide(req, res) {
  await Model.Future.findById(req.body._id, (err, result) => {
    if (err) {
        let apiResponse = Service.generate.generate(true, 'Error', 500, err)
        res.send(apiResponse)
    } else if (result == undefined || result == null || result == '') {
        let apiResponse = Service.generate.generate(true, 'No booking Found', 500, null)
        res.send(apiResponse)
    } else {
        let apiResponse = Service.generate.generate(true, 'Success', 200, result)
        res.send(apiResponse)
    }
})
    .populate([{ path: 'seviceTypeId' }, { path: 'userId' }, { path: 'userVehicleId' }, { path: 'driverId' }, { path: 'vehicleId' }, { path: 'promoId' }])
}

async function assignScheduledRide(req,res){
  if(!req.body.phone && req.body.countryCode){
    return res.ok(false, Constant.required, null);
  }
  const userData = await Model.Driver.findOne({ 'phone': req.body.phone });
  if (userData) {
    const optData = await Model.Otp.findOne({ 'user': req.body.phone });

    if (optData)
      await Model.Otp.deleteMany({ 'user': req.body.phone }); 

    const Otp = await new Model.Otp({
      otp: Math.floor(100000 + Math.random() * 900000),
      user: req.body.phone, type: req.body.type
    }).save();
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phone, "Wingmen code " + Otp.otp);
    return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
  } else {
    return res.ok(false, Constant.userNotFound, null);
  }
}

async function ScheduledRideVerifyOtp(req, res) {
  try {
    if (!req.body.otp)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp });

    if (otpData && otpData._id) {
      await Model.Otp.deleteOne({ "_id": otpData._id });
      const ScheduledDriverNo = otpData.user;
      const ScheduledDriverId = await Model.Driver.findOne({'phone': ScheduledDriverNo});
      bookingID = req.body.bookingId;
      const DriverId = ScheduledDriverId._id;
      const query = await Model.Future.find();
      const element = {};
      for (let i = 0; i < query.length; i++) {
        const element = query[i].driverId;
        console.log(element);
        console.log(DriverId);
      
        if(String(element) === String(DriverId)) {
          console.log("if");
          // return;
          return res.ok(false, 'You have already registered for an Scheduled Booking', null)
        }
        else{
          console.log("else");
          // return;
          await Model.Future.findOneAndUpdate({_id: bookingID}, { driverId: DriverId})
          return res.ok(true, 'success', {})
          }
        }
      }
      const ScheduledRide = await Model.Future.findById({ _id: mongoose.Types.ObjectId(bookingID)});
      
      if (ScheduledRide.driverId !== null) {
        return res.ok(true, 'Already taken', null);
      }
      return res.ok(true, 'success', {});
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function ScheduledConfirmBookingStatus(req, res) {
  try {
  
    const bookingOrder = await Model.Future.find();
    for (let index = 0; index < bookingOrder.length; index++)
    {
        const element = bookingOrder[index].bookingDate;

        const elementa = element.toString();
        scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
        scheduleDate1 = scheduleDate.toString();
        // console.log(scheduleDate1);
        const then = moment(scheduleDate1);
      
        const date = new Date(Date.now());
        const element1 = date.toString();
        const now = moment(element1);
        // console.log(element1);
     
        const date1 = new Date(scheduleDate1);
      
        const date2 = new Date(element1);
      
        console.log(getDifferenceInHours(date1, date2));
        function getDifferenceInHours(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return Math.floor(diffInMs / (1000 * 60 * 60));
      }


    if(getDifferenceInHours(date1, date2) < 3)
    {
      console.log("Deadline Arrived Sending Notifications");
      console.log(bookingOrder[index]._id);

      Model.Future.findOne({ _id: bookingOrder[index]._id })
        .then(doc => {
          console.log(doc);
  
        // Inserting the doc in destination collection
          Model.Booking.insertMany([doc])
            .then(d => {
                console.log("Saved Successfully");
            })
            .catch(error => {
                console.log(error);
            })
  
        // Removing doc from the source collection
        Model.Future.deleteOne({ _id: doc._id })
            .then(d => {
                console.log("Removed succesfully")
            })
            .catch(error => {
                console.log(error);
            });
      })
      


      const driverId = bookingOrder[index].driverId;
      const driverData = await Model.Driver.findOne(driverId);
      const driverEmail = driverData.email;
      Service.EmailService.sendScheduledDriverConfirmation(driverEmail);
      Service.OtpService.sendSMS( driverData.countryCode, driverData.phone, `Your Scheduled Ride as Driver will begin in 2 hours.`);

      const CodriverId = bookingOrder[index].coDriverId;
      const CodriverData = await Model.Driver.findOne(CodriverId);
      const CodriverEmail = CodriverData.email;
      Service.EmailService.sendScheduledCoDriverConfirmation(CodriverEmail);
      Service.OtpService.sendSMS(CodriverData.countryCode, CodriverData.phone, `Your Scheduled Ride as Driver will begin in 2 hours.`);
    }
  }

  } catch (error) {
    res.ok(false, Constant.error, error
      );
  }
};

async function ScheduledRideCoDriverVerifyOtp(req, res) {
  try {
    if (!req.body.otp)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp });
    if (otpData && otpData._id) {
      await Model.Otp.deleteOne({ "_id": otpData._id });
      const ScheduledCoDriverNo = otpData.user;
      const ScheduledCoDriverId = await Model.Driver.findOne({'phone': ScheduledCoDriverNo});
      bookingID = req.body.bookingId;
      CoDriverId = ScheduledCoDriverId._id;
      const query = await Model.Future.find();
      const element = {};
      for (let i = 0; i < query.length; i++) {
        const element = query[i].coDriverId;
        if(String(element) === String(CoDriverId)) {
          return res.ok(false, 'You have already registered for an Scheduled Booking', null)
        }
        else{
          await Model.Future.findOneAndUpdate({_id: bookingID}, { coDriverId: CoDriverId});
          return res.ok(true, 'success', {})
        }
      }
    }
    const ScheduledRide = await Model.Future.findById({ _id: mongoose.Types.ObjectId(bookingID)});
      
      if (ScheduledRide.coDriverId !== null) {
        return res.ok(true, 'Already taken', null);
      }
      return res.ok(true, 'success', {});
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
};

async function Reminder48(req, res) {
  const bookingOrder = await Model.Future.find();
  for (let index = 0; index < bookingOrder.length; index++)
  {
    const element = bookingOrder[index].bookingDate;
    const elementa = element.toString();
    scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
    scheduleDate1 = scheduleDate.toString();
    const then = moment(scheduleDate1);

    const date = new Date(Date.now());
    const element1 = date.toString();
    const now = moment(element1);

    const date1 = new Date(scheduleDate1);

    const date2 = new Date(element1);

    // console.log("======");
    console.log(getDifferenceInHours(date1, date2));
    // console.log("======");
    function getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return Math.floor(diffInMs / (1000 * 60 * 60));
    }

    if(getDifferenceInHours(date1, date2) == 48) {
      const query1 = {
        _id: bookingOrder[index]._id
      }
      const bookingData = await Model.Future.findOne(query1);
      const query2 = {
        _id: bookingData.driverId,
      }
      const query3 = {
        _id: bookingData.coDriverId,
      }
      const driverData = await Model.Driver.findOne(query2);
      const coDriverData = await Model.Driver.findOne(query3);
      if(!driverData) {
        return false;
      }
      if(!coDriverData) {
        return false;
      }
      const smsData = {
        phone: driverData.phone,
        countryCode: driverData.countryCode
      }
      const smsData1 = {
        phone:coDriverData.phone,
        countryCode: coDriverData.countryCode
      }
      if(!(smsData.phone && smsData.countryCode))
      {
        return false;
      }
      if(!(smsData1.phone && smsData1.countryCode))
      {
        return false;
      }
      if (smsData.phone && smsData.countryCode) {
        Service.OtpService.sendSMS(
          smsData.countryCode,
          smsData.phone,
          `Your Scheduled Ride as Driver is scheduled to 2 days from now.`
        );
        return true;
      }
      if (smsData1.phone && smsData1.countryCode) 
      {
        Service.OtpService.sendSMS(
          smsData1.countryCode,
          smsData1.phone,
          `Your Scheduled Ride as CoDriver is scheduled to 2 days from now.`
        );
        return true;
      }
      else{
        return false;
      }
    }
  }  
} 

async function Reminder24(req, res) {
  const bookingOrder = await Model.Future.find();
  for (let index = 0; index < bookingOrder.length; index++)
  {
    const element = bookingOrder[index].bookingDate;
    const elementa = element.toString();
    scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
    scheduleDate1 = scheduleDate.toString();
    const then = moment(scheduleDate1);

    const date = new Date(Date.now());
    const element1 = date.toString();
    const now = moment(element1);

    const date1 = new Date(scheduleDate1);

    const date2 = new Date(element1);
    // console.log("======");
    console.log(getDifferenceInHours(date1, date2));
    // console.log("======");
    function getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return Math.floor(diffInMs / (1000 * 60 * 60));
    }

    if(getDifferenceInHours(date1, date2) == 24) {
      const query1 = {
        _id: bookingOrder[index]._id
      }
      const bookingData = await Model.Future.findOne(query1);
      const query2 = {
        _id: bookingData.driverId,
      }
      const query3 = {
        _id: bookingData.coDriverId,
      }
      const driverData = await Model.Driver.findOne(query2);
      const coDriverData = await Model.Driver.findOne(query3);
      if(!driverData) {
        return false;
      }
      if(!coDriverData) {
        return false;
      }
      const smsData = {
        phone: driverData.phone,
        countryCode: driverData.countryCode
      }
      const smsData1 = {
        phone:coDriverData.phone,
        countryCode: coDriverData.countryCode
      }
      if (smsData.phone && smsData.countryCode) {
        Service.OtpService.sendSMS(
          smsData.countryCode,
          smsData.phone,
          `Your Scheduled Ride as Driver is scheduled to 1 day from now.`
        );
        return true;
      }
      if (smsData1.phone && smsData1.countryCode) {
        Service.OtpService.sendSMS(
          smsData1.countryCode,
          smsData1.phone,
          `Your Scheduled Ride as CoDriver is scheduled to 1 day from now.`
        );
        return true;
      }
      else{
        return false;
      }
    }
  }  
}

async function Reminder6(req, res) {
  const bookingOrder = await Model.Future.find();
  for (let index = 0; index < bookingOrder.length; index++)
  {
    const element = bookingOrder[index].bookingDate;
    const elementa = element.toString();
    scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
    scheduleDate1 = scheduleDate.toString();
    const then = moment(scheduleDate1);

    const date = new Date(Date.now());
    const element1 = date.toString();
    const now = moment(element1);

    const date1 = new Date(scheduleDate1);

    const date2 = new Date(element1);
    console.log(getDifferenceInHours(date1, date2));
    function getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return Math.floor(diffInMs / (1000 * 60 * 60));
    }

    if(getDifferenceInHours(date1, date2) == 6) {
      const query1 = {
        _id: bookingOrder[index]._id
      }
      const bookingData = await Model.Future.findOne(query1);
      const query2 = {
        _id: bookingData.driverId,
      }
      const query3 = {
        _id: bookingData.coDriverId,
      }
      const driverData = await Model.Driver.findOne(query2);
      const coDriverData = await Model.Driver.findOne(query3);
      if(!driverData) {
        console.log("here3");
        return false;
      }
      if(!coDriverData) {
        return false;
      }
      const smsData = {
        phone: driverData.phone,
        countryCode: driverData.countryCode
      }
      const smsData1 = {
        phone:coDriverData.phone,
        countryCode: coDriverData.countryCode
      }
      if (smsData.phone && smsData.countryCode) {
        Service.OtpService.sendSMS(
          smsData.countryCode,
          smsData.phone,
          `Your Scheduled Ride as Driver is scheduled to 6 hours from now.`
        );
        return true;
      }
      if (smsData1.phone && smsData1.countryCode) {
        Service.OtpService.sendSMS(
          smsData1.countryCode,
          smsData1.phone,
          `Your Scheduled Ride as CoDriver is scheduled to 6 hours from now.`
        );
        return true;
      }
      else{
        return false;
      }
    }
  }  
}

async function cancelScheduledBooking(req, res) {
  const idToRemove = req.user._id;
  const bookingData1 = await Model.Future.findOne({_id: req.body.bookingId});
  console.log(bookingData1.driverId);
  console.log(bookingData1.coDriverId);
  console.log(idToRemove);  
  if(String(idToRemove) == String(bookingData1.driverId)){
    const bookingFinalData = await Model.Future.update( { _id: req.body.bookingId }, { $unset: { driverId: 1 } } );
    availableFreeScheduledDriver(bookingData1);
    return res.ok(true, Constant.driverRemove, {});
  }
  if(String(idToRemove) == String(bookingData1.coDriverId)) {
    const bookingFinalData = await Model.Future.update( { _id: req.body.bookingId }, { $unset: { coDriverId: 1} } )
    availableFreeScheduledCoDriver(bookingData1);
    return res.ok(true, Constant.CodriverRemove, {});
  }
    if(String(idToRemove) !== String(bookingData1.coDriverId) && String(idToRemove) !== String(bookingData1.driverId)) {
      return res.ok(false, Constant.notFound, {});
    }
};

async function sendBroadcastMailtoDrivers(req, res) {
  try {
    let data = req.body.data;
    let users = [];
    for (let i = 0; i < data.length; i++) {
      element = data[i];
      const SMS = await Model.Driver.findById(element);
      DriverTitle = req.body.title;
      DriverDescription = req.body.description;
      DriverPhone = SMS.phone;
      DriverCountryCode = SMS.countryCode;
      const query = {
        driverId: SMS._id
      }
      const DriverDeviceData = await Model.Device.findOne(query);
      console.log(DriverDeviceData);
      if(req.body.type == 'sms') {
      if(DriverPhone === "invalid"){
        continue;
      }
      else
      {
      Service.OtpService.sendSMS(
        DriverCountryCode,
        DriverPhone,
        `${DriverTitle}, ${DriverDescription}`)
      }
      }
      else {
        console.log("==========");
        sendBroacastPushToDrivers(SMS, DriverDeviceData, DriverTitle, DriverDescription);
      }
    }
    console.log(users);
    return res.ok(true, 'success', {});
  } catch (error) {
    return res.ok(false, 'Error', error)
  }
}



/*
CHANGE BOOKING STATUS
*/
async function driverAvailabelStausUpdate(driverData) {
  let available = true;
  let bookingData = await Model.Booking.find({
    $or: [
      { driverId: { $in: [mongoose.Types.ObjectId(driverData._id)] } },
      { coDriverId: { $in: [mongoose.Types.ObjectId(driverData._id)] } }],
    bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
  });
  if (bookingData && bookingData.length) {
    available = false;
  }
  await Model.Driver.findOneAndUpdate({
    _id: driverData._id
  }, {
    available: available
  }, {
    new: true
  });
  return true;
};

async function driverAvailabelStausCheck(driverData) {
  let available = true;
  let bookingData = await Model.Booking.find({
    $or: [
      { driverId: { $in: [mongoose.Types.ObjectId(driverData._id)] } },
      { coDriverId: { $in: [mongoose.Types.ObjectId(driverData._id)] } }],
    bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
  });
  if (bookingData && bookingData.length) {
    available = false;
  }
  return available;
};

async function SendTipLink(data) {
  try {
    const query = {
      bookingId: data.bookingId,
      userId: data.userId,
    };
    // console.log(query);
    // console.log('here');
    const bookingData = await Model.Transaction.findOne(query);
    const query1 = {
      _id: bookingData.userId,
    };
    const userData = await Model.User.findById(query1);
    const responseSend = {
      cardId: bookingData.cardId,
      bookingId: bookingData.bookingId,
      userId: bookingData.userId,
    };
    const smsData = {
      phone: userData.phone,
      countryCode: userData.countryCode,
    };
    if (smsData.phone && smsData.countryCode) {
      Service.OtpService.sendSMS(
        smsData.countryCode,
        smsData.phone,
        `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
      );

      return res.ok(
        true,
        Constant.sendSMSforTip,
        `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
      );
    }
    return res.ok(
      true,
      Constant.sendSMSforTip,
      `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
    );
  } catch (error) {
    // return res.ok(false, Constant.serverError, null);
  }
}

async function SendGuestTipLink(data) {
  try {
    const query = {
      bookingId: data.bookingId,
      userId: data.userId,
    };
    // console.log(query);
    // console.log('here');
    const bookingData = await Model.Transaction.findOne(query);
    // const query1 = {
    //   _id: bookingData.userId,
    // };
    // const userData = await Model.User.findById(query1);
    const responseSend = {
      cardId: bookingData.cardId,
      bookingId: bookingData.bookingId,
      userId: bookingData.userId,
    };
    const smsData = {
      phone: userData.phone,
      countryCode: userData.countryCode,
    };
    if (smsData.phone && smsData.countryCode) {
      Service.OtpService.sendSMS(
        smsData.countryCode,
        smsData.phone,
        `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
      );

      return res.ok(
        true,
        Constant.sendSMSforTip,
        `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
      );
    }
    return res.ok(
      true,
      Constant.sendSMSforTip,
      `https://wingmen-booking-nu.vercel.app/tips/${responseSend.bookingId}/${responseSend.userId}/${responseSend.cardId}`
    );
  } catch (error) {
    // return res.ok(false, Constant.serverError, null);
  }
}

async function changeBookingStatus(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let message = '';
    let driverMessage = '';
    let driverData = null;
    let coDriverData = null;
    let eventType = Constant.eventType.default;
    let saveObj = {};
    let title = Constant.bookingMessages.wingMenTitle;

    if (req.file) setObj.driverJobCompletedImage = `${Constant.driverJobImage}/${req.file.filename}`;

    if (Validation.isDriverValid.isValidChangeBookingStatus(req.body))
      return res.ok(false, Constant.required, null);
    // console.log("changeBookingStatus", req.body.bookingStatus)
    let bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
    if(bookingData.isEventBooking === true) {
      let driver = await Model.Driver.findOne({ _id: req.user._id });
      if (!driver) {
        return res.ok(false, Constant.notAllowedAcceptBooking, null);
      }
      // console.log(bookingData.id);
      //1306
      // if (driver.isPilot && driver.isPairedDriver) {
      //   return res.ok(false, Constant.notAllowedAcceptBooking, null);
      // }
      if (driver.isPilot) {
        driverData = driver;
        saveObj.statusMoveByDriver = true;
        if (driver.coDriverId)
          coDriverData = await Model.Driver.findOne({ _id: driver.coDriverId });
        } else {
        coDriverData = driver;
        saveObj.statusMoveByCoDriver = true;
        if (driver.coDriverId)
          driverData = await Model.Driver.findOne({ _id: driver.coDriverId });
      }

    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus == req.body.bookingStatus) {

      return res.ok(false, Constant.alreadyChangedBookingStatus, null);
    }
    if (Constant.bookingStatusNumber[bookingData.bookingStatus] > Constant.bookingStatusNumber[req.body.bookingStatus]) {
      return res.ok(false, Constant.alreadyChangedBookingStatus, null);
    }
    // const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(bookingData.userId) });
    // console.log("userData", userData);
    // if (!userData) {
    //   return res.ok(false, Constant.userNotFound, null);
    // }
    // console.log(bookingData.id);
    switch (req.body.bookingStatus) {
      case Constant.bookingStatus.STARTED:
        setObj.bookingStatus = Constant.bookingStatus.STARTED;
        message = Constant.bookingMessages.tripStarted;
        eventType = Constant.eventType.driverStartBooking;
        driverMessage = Constant.bookingMessages.tripStarted;
        break;
      case Constant.bookingStatus.ONGOING:
        setObj.bookingStatus = Constant.bookingStatus.ONGOING;
        eventType = Constant.eventType.driverOngoingBooking;
        message = Constant.bookingMessages.tripOngoing;
        driverMessage = Constant.bookingMessages.tripOngoing;
        break;
      case Constant.bookingStatus.ARRIVED:
        setObj.bookingStatus = Constant.bookingStatus.ARRIVED;
        eventType = Constant.eventType.driverArrivedBooking;
        message = Constant.bookingMessages.tripArrived;
        driverMessage = Constant.bookingMessages.tripArrived;
        break;
      case Constant.bookingStatus.COMPLETED:
        setObj.bookingStatus = Constant.bookingStatus.COMPLETED;
        eventType = Constant.eventType.driverCompletedBooking;
        message = Constant.bookingMessages.tripCompleted;
        driverMessage = Constant.bookingMessages.tripCompleted;
        if (bookingData.isReferralCodeUsed) {
          const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
            referralAmountSender: 1,
            referralAmountReceiver: 1
          });
          // await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          //   { $inc: { walletAmount: (adminData.referralAmountReceiver || 0) } });
          // if (bookingData.referralUserId) {
          //   await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.referralUserId) },
          //     { $inc: { walletAmount: (adminData.referralAmountSender || 0) } });
          // }
        }
        await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
        if (driverData)
          await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCompletedBooking: 1 } });
        if (coDriverData)
          await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCompletedBooking: 1 } });

        break;
      case Constant.bookingStatus.CANCELED:
        message = Constant.bookingMessages.tripCanceled;
        driverMessage = Constant.bookingMessages.tripCanceled;
        eventType = Constant.eventType.driverCancelBooking;
        await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
        if (driverData)
          await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCanceledBooking: 1 } });
        if (coDriverData)
          await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCanceledBooking: 1 } });
        if (bookingData.paymentMode == Constant.paymentMode.wallet ||
          bookingData.paymentMode == Constant.paymentMode.card) {
        //   await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        //     { $inc: { walletAmount: (bookingData.totalAmount) } });
        // }
        // if (bookingData.paymentMode == Constant.paymentMode.cash) {
        //   await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        //     { $inc: { walletAmount: (bookingData.walletAmount) } });
        }
        setObj.bookingStatus = Constant.bookingStatus.CANCELED;
        setObj.isCanceledByDriver = true;
        break;
      default:
        break;
    }
    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    let earningObj = {
      bookingStatus: setObj.bookingStatus
    }
    await Model.DriverEaring.update({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) },
      { $set: earningObj }, { multi: true });

    if (driverData) {
      saveObj.driverId = driverData._id;
      await driverAvailabelStausUpdate(driverData);
    }
    if (coDriverData) {
      saveObj.coDriverId = coDriverData._id;
      await driverAvailabelStausUpdate(coDriverData);
    }

    saveObj.bookingStatus = setObj.bookingStatus;
    saveObj.bookingId = bookingData._id;
    await Model.BookingDriverHistory(saveObj).save();
    await Model.BookingDriverRequestLog(saveObj).save();

    // console.log(bookingData.id);

    bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
    //send text message
    if (req.body.bookingStatus) {
      const userCountryCode = bookingData.countryCode;
      const userPhone = bookingData.phoneNo;
      console.log(`+${userCountryCode}`, userPhone, "________________________");
      Service.OtpService.bookingSms1(
        `+${userCountryCode}`,
        userPhone,
        `Hello ${bookingData.firstName},\nThank you for allowing Wingmen to have your back! We hope you had a great experience. - Team Wingmen`
      );

      // console.log('Thank you for allowing Wingmen to have your back! We hope you had a great experience. - Team Wingmen');

      // //SEND MESSAGE FOT TIP
      const data = {
        bookingId: bookingData._id,
        userId: bookingData.userId,
      };
      // SendGuestTipLink(data);
    }

    let payload = {
      title: title,
      message: message,
      eventType: eventType,
      driverId: req.user._id,
      driverData: driverData || {},
      coDriverData: coDriverData || {},
      bookingData: bookingData,
      bookingId: bookingData._id,
      // userData: userData,
      receiverId: bookingData._id,
      isUserNotification: true,
      isNotificationSave: true
    };

    payload.socketType = Constant.socketType.user;
    // process.emit("sendNotificationToUser", payload);
    // payload.isNotificationSave = false;
    // if (userData && userData.isNotification) {
    //   const userDeviceData = await Model.Device.find({ userId: mongoose.Types.ObjectId(userData._id) });
    //   if (userDeviceData && userDeviceData.length) {
    //     for (let i = 0; i < userDeviceData.length; i++) {
    //       payload.token = userDeviceData[i].deviceToken;
    //       if (userDeviceData[i].deviceType == 'IOS') {
    //         Service.PushNotificationService.sendIosPushNotification(payload);
    //       } else if (userDeviceData[i].deviceType == 'ANDROID') {
    //         Service.PushNotificationService.sendAndroidPushNotifiction(payload);
    //       }
    //     }
    //   }

    // }
    let bookingDataSend = await getCurrentBookingData(bookingData)
    payload = {
      title: title,
      message: driverMessage,
      eventType: Constant.eventType.tripStatusChange,
      driverId: req.user._id,
      bookingId: bookingData._id,
      bookingData: bookingDataSend,
      isDriverNotification: true,
      isNotificationSave: true
    };

    if (bookingData.coDriverId && driver.isPilot) {
      payload.receiverId = bookingData.coDriverId;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
      payload.isNotificationSave = false;
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

    } else if (bookingData.driverId) {
      payload.receiverId = bookingData.driverId;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
      payload.isNotificationSave = false;
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

    }
    return res.ok(true, null, dataToSend);
  }
  else {
    let driver = await Model.Driver.findOne({ _id: req.user._id });
    if (!driver) {
      return res.ok(false, Constant.notAllowedAcceptBooking, null);
    }
    // console.log(bookingData.id);
    //1306
    // if (driver.isPilot && driver.isPairedDriver) {
    //   return res.ok(false, Constant.notAllowedAcceptBooking, null);
    // }
    if (driver.isPilot) {
      driverData = driver;
      saveObj.statusMoveByDriver = true;
      if (driver.coDriverId)
        coDriverData = await Model.Driver.findOne({ _id: driver.coDriverId });
    } else {
      coDriverData = driver;
      saveObj.statusMoveByCoDriver = true;
      if (driver.coDriverId)
        driverData = await Model.Driver.findOne({ _id: driver.coDriverId });
    }

    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus == req.body.bookingStatus) {

      return res.ok(false, Constant.alreadyChangedBookingStatus, null);
    }
    if (Constant.bookingStatusNumber[bookingData.bookingStatus] > Constant.bookingStatusNumber[req.body.bookingStatus]) {
      return res.ok(false, Constant.alreadyChangedBookingStatus, null);
    }
    const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(bookingData.userId) });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    // console.log(bookingData.id);
    switch (req.body.bookingStatus) {
      case Constant.bookingStatus.STARTED:
        setObj.bookingStatus = Constant.bookingStatus.STARTED;
        message = Constant.bookingMessages.tripStarted;
        eventType = Constant.eventType.driverStartBooking;
        driverMessage = Constant.bookingMessages.tripStarted;
        break;
      case Constant.bookingStatus.ONGOING:
        setObj.bookingStatus = Constant.bookingStatus.ONGOING;
        eventType = Constant.eventType.driverOngoingBooking;
        message = Constant.bookingMessages.tripOngoing;
        driverMessage = Constant.bookingMessages.tripOngoing;
        break;
      case Constant.bookingStatus.ARRIVED:
        setObj.bookingStatus = Constant.bookingStatus.ARRIVED;
        eventType = Constant.eventType.driverArrivedBooking;
        message = Constant.bookingMessages.tripArrived;
        driverMessage = Constant.bookingMessages.tripArrived;
        break;
      case Constant.bookingStatus.COMPLETED:
        setObj.bookingStatus = Constant.bookingStatus.COMPLETED;
        eventType = Constant.eventType.driverCompletedBooking;
        message = Constant.bookingMessages.tripCompleted;
        driverMessage = Constant.bookingMessages.tripCompleted;
        if (bookingData.isReferralCodeUsed) {
          const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
            referralAmountSender: 1,
            referralAmountReceiver: 1
          });
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: (adminData.referralAmountReceiver || 0) } });
          if (bookingData.referralUserId) {
            await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.referralUserId) },
              { $inc: { walletAmount: (adminData.referralAmountSender || 0) } });
          }
        }
        await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
        if (driverData)
          await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCompletedBooking: 1 } });
        if (coDriverData)
          await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCompletedBooking: 1 } });

        break;
      case Constant.bookingStatus.CANCELED:
        message = Constant.bookingMessages.tripCanceled;
        driverMessage = Constant.bookingMessages.tripCanceled;
        eventType = Constant.eventType.driverCancelBooking;
        await Model.chatMessage.deleteMany({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) })
        if (driverData)
          await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalCanceledBooking: 1 } });
        if (coDriverData)
          await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalCanceledBooking: 1 } });
        if (bookingData.paymentMode == Constant.paymentMode.wallet ||
          bookingData.paymentMode == Constant.paymentMode.card) {
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: (bookingData.totalAmount) } });
        }
        if (bookingData.paymentMode == Constant.paymentMode.cash) {
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: (bookingData.walletAmount) } });
        }
        setObj.bookingStatus = Constant.bookingStatus.CANCELED;
        setObj.isCanceledByDriver = true;
        break;
      default:
        break;
    }
    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    let earningObj = {
      bookingStatus: setObj.bookingStatus
    }
    await Model.DriverEaring.update({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) },
      { $set: earningObj }, { multi: true });

    if (driverData) {
      saveObj.driverId = driverData._id;
      await driverAvailabelStausUpdate(driverData);
    }
    if (coDriverData) {
      saveObj.coDriverId = coDriverData._id;
      await driverAvailabelStausUpdate(coDriverData);
    }

    saveObj.bookingStatus = setObj.bookingStatus;
    saveObj.bookingId = bookingData._id;
    await Model.BookingDriverHistory(saveObj).save();
    await Model.BookingDriverRequestLog(saveObj).save();

    // console.log(bookingData.id);

    bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
    //send text message
    if (req.body.bookingStatus === Constant.bookingStatus.COMPLETED) {
      const userCountryCode = userData.countryCode;
      const userPhone = userData.phone;
      console.log(userCountryCode, userPhone, "________________________");
      Service.OtpService.bookingSms(
        userCountryCode,
        userPhone,
        `Hello ${userData.firstName},\nThank you for allowing Wingmen to have your back! We hope you had a great experience. - Team Wingmen`
      );

      // console.log('Thank you for allowing Wingmen to have your back! We hope you had a great experience. - Team Wingmen');

      // //SEND MESSAGE FOT TIP
      const data = {
        bookingId: bookingData._id,
        userId: bookingData.userId,
      };
      // console.log(data, 'bookingstatus');
      SendTipLink(data);
    }

    let payload = {
      title: title,
      message: message,
      eventType: eventType,
      driverId: req.user._id,
      driverData: driverData || {},
      coDriverData: coDriverData || {},
      bookingData: bookingData,
      bookingId: bookingData._id,
      userData: userData,
      receiverId: userData._id,
      isUserNotification: true,
      isNotificationSave: true
    };

    payload.socketType = Constant.socketType.user;
    process.emit("sendNotificationToUser", payload);
    payload.isNotificationSave = false;
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

    let bookingDataSend = await getCurrentBookingData(bookingData)
    payload = {
      title: title,
      message: driverMessage,
      eventType: Constant.eventType.tripStatusChange,
      driverId: req.user._id,
      bookingId: bookingData._id,
      bookingData: bookingDataSend,
      isDriverNotification: true,
      isNotificationSave: true
    };

    if (bookingData.coDriverId && driver.isPilot) {
      payload.receiverId = bookingData.coDriverId;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
      payload.isNotificationSave = false;
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

    } else if (bookingData.driverId) {
      payload.receiverId = bookingData.driverId;
      payload.socketType = Constant.socketType.driver;
      process.emit("sendNotificationToDriver", payload);
      payload.isNotificationSave = false;
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

    }
    return res.ok(true, null, dataToSend);
    }
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function acceptedBookingStatus(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let saveObj = {
      bookingStatus: Constant.bookingStatus.ACCEPTED
    };
    let driverData = null;
    let coDriverData = null;
    let earingObj = {};
    let isSharePercentageDriverCoDriver = false;

    if (Validation.isDriverValid.isValidDriverAcceptBooking(req.body))
      return res.ok(false, Constant.required, null);

    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false },
      {
        area: 1,
        sharePercentage: 1,
        driverSharePercentage: 1,
        coDriverSharePercentage: 1
      }, {})
    setObj.bookingStatus = Constant.bookingStatus.ACCEPTED;

    let bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    if (bookingData && bookingData.bookingStatus != Constant.bookingStatus.PENDING) {
      return res.ok(false, Constant.noLongerAvailable, null);
    }
    // if(bookingData && moment(bookingData.bookingDate).diff(moment().utc())<1){
    //     return res.ok(false,Constant.noLongerAvailable,null);
    // }
    const bookingDataCount = await Model.Booking.countDocuments({
      _id: { $nin: [mongoose.Types.ObjectId(bookingData._id)] },
      userId: mongoose.Types.ObjectId(bookingData.userId),
      bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] },
      isTripAllocated: true
    });
    if (bookingDataCount) {
      return res.ok(false, Constant.userAlreadyInAnotherTrip, null);
    }
    console.log("######user", req.user._id)
    let criteria = {
      _id: req.user._id,
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
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A-": "no driver 2327" });
    }
    let driver = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(req.user._id) });
    console.log("--------------")
    console.log(driver)
    if (!driver) {
      return res.ok(false, Constant.notAllowedAcceptBooking, { "A": "no driver 2333" });
    }
    //2606
    /*if (driver.isPilot && driver.isPairedDriver) {
      console.log("check1")
      return res.ok(false, Constant.notAllowedAcceptBooking, {"B" : "no driver 2338"});
    }*/
    if (driver.isPilot) {
      driverData = driver;
      saveObj.statusMoveByDriver = true;
      coDriverData = await Model.Driver.findOne({ coDriverId: mongoose.Types.ObjectId(driver._id) });
    } else {
      coDriverData = driver;
      saveObj.statusMoveByCoDriver = true;
      if (coDriverData)
        driverData = await Model.Driver.findOne({ coDriverId: mongoose.Types.ObjectId(driver._id) });
    }
    /*if (bookingData.isDriverRequired && driverData && (!driverData.isPilot || driverData.isPairedDriver)) {
      console.log("check2")
      return res.ok(false, Constant.notAllowedAcceptBooking, { "C": "no driver 2352" });
    }*/
    /*if (bookingData.isCoDriverRequired && !coDriverData.isCopilot) {
      console.log("check3")
      return res.ok(false, Constant.notAllowedAcceptBooking, { "D": "no driver 2356" });
    }*/
    /*if (bookingData.isDriverRequired && bookingData.isCoDriverRequired &&
      (!coDriverData.isCopilot || !coDriverData.isPairedDriver)) {
      return res.ok(false, Constant.notAllowedAcceptBooking, { "E": "no driver 2360" });
    }*/
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
      let checkAvailabelty = await driverAvailabelStausCheck(driverData);
      if (!checkAvailabelty) {
        return res.ok(false, Constant.notAllowedAcceptBooking, { "F": "no driver 2382" });
      }
    }
    if (coDriverData) {
      let checkAvailabelty = await driverAvailabelStausCheck(coDriverData);
      if (!checkAvailabelty) {
        return res.ok(false, Constant.notAllowedAcceptBooking, { "G": "no driver 2388" });
      }
    }
    const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(bookingData.userId) });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    //send text message
    // const userCountryCode = userData.countryCode
    // const userPhone = userData.phone
    // console.log(userCountryCode, userPhone, '________________________');
    // Service.OtpService.bookingSms(userCountryCode, userPhone,
    //   `Hello ${userData.firstName},\nYour ride just got accepted. Wingmen ${driverData.firstName} is on its way to pick you up. In case of any trouble give us a call at 1800000000 -Team Wingmen`);

    if (bookingData.paymentMode == Constant.paymentMode.wallet ||
      bookingData.paymentMode == Constant.paymentMode.cash) {
      //setObj.paymentStatus=Constant.paymentStatus.completed;
    }
    await Model.Booking.update({ _id: req.body.bookingId }, { $set: setObj }, { lean: true });
    // if(bookingData.paymentMode==Constant.paymentMode.wallet){
    //     if(bookingData.totalAmount<=userData.walletAmount){
    //        await Model.User.update({_id: mongoose.Types.ObjectId(bookingData.userId)},
    //            {$inc:{walletAmount:-(bookingData.totalAmount)}});
    //     }else{
    //        await Model.User.update({_id:mongoose.Types.ObjectId(bookingData.userId)},
    //            {$inc:{pendingAmount:(bookingData.totalAmount)}});
    //     }
    // }
    if (driverData) {
      await Model.Driver.findOneAndUpdate({ _id: driverData._id }, { $inc: { totalBooking: 1 } });
      saveObj.driverId = driverData._id;
      await driverAvailabelStausUpdate(driverData);
    }
    if (coDriverData) {
      await Model.Driver.findOneAndUpdate({ _id: coDriverData._id }, { $inc: { totalBooking: 1 } });
      saveObj.coDriverId = coDriverData._id;
      //send message to co-driver about ride
      // const sendMessage = {
      //   driverId: mongoose.Types.ObjectId(driverData._id),
      //   coDriverId: mongoose.Types.ObjectId(coDriverData._id),
      //   message: req.body.bookingId
      // }
      // const data = await Model.DriverChatMessage(sendMessage).save();
      // console.log(data, '_____________________________________________________________________________________________________');
      await driverAvailabelStausUpdate(coDriverData);
    }
    saveObj.bookingId = bookingData._id;

    await Model.BookingDriverHistory(saveObj).save();
    await Model.BookingDriverRequestLog(saveObj).save();

    bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
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
      earingObj.bookingLocalDate = bookingData.bookingLocalDate;
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
      console.log()
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
      earingObj.bookingLocalDate = bookingData.bookingLocalDate;
      await Model.DriverEaring(earingObj).save();
    }
    let title = Constant.bookingMessages.wingMenTitle;
    let payload = {
      title: title,
      message: Constant.bookingMessages.tripAccepted,
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
    console.log("######userplayload", payload.driverId)
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
    console.log('===7', payload);
    process.emit("sendNotificationToUser", payload);
    let bookingDataSend = await getCurrentBookingData(bookingData);
    payload = {
      title: Constant.bookingMessages.wingMenTitle,
      message: Constant.bookingMessages.tripStatusChange,
      eventType: Constant.eventType.tripStatusChange,
      driverId: req.user._id,
      bookingData: bookingDataSend,
      bookingId: bookingData._id,
      isDriverNotification: true,
      isNotificationSave: false
    };

    if (bookingData.coDriverId && driver.isPilot) {
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
      payload.bookingData = bookingData;
      process.emit("sendNotificationToDriver", payload);
    } else if (bookingData.driverId) {
      console.log('===8', bookingData);
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
      payload.bookingData = bookingData;
      process.emit("sendNotificationToDriver", payload);
    }
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function addCoDriverOnRide(req, res) {
  try {
    if (Validation.isDriverValid.isValidAddCoDriverOnRide(req.body)) {
      return res.ok(false, Constant.required, null);
    } else {
      const bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) })
      const userData = bookingData.userData
      if (bookingData.isTripAllocated === true) {
        console.log(bookingData.isSheduledBooking, "_______________");
        availableFreeDriver2(bookingData, userData, {});
      } else if (bookingData.isSheduledBooking) {
        process.emit('scheduleBooking', bookingData);
      }
      return res.ok(true, 'Notification send successfully');
    }
  } catch (error) {
    return res.ok(Constant.serverError);
  }
}

async function getCoDriverBetweenRide(req, res) {
  try {
    if (Validation.isDriverValid.isValidDriverAcceptBooking(req.body)) {
      return res.ok(false, Constant.required, null);
    } else {
      const bookingDetail = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
      if (bookingDetail.bookingStatus === 'PENDING' ||
        bookingDetail.bookingStatus === 'ACCEPTED' ||
        bookingDetail.bookingStatus === 'ARRIVED' ||
        bookingDetail.bookingStatus === 'STARTED' ||
        bookingDetail.bookingStatus === 'ONGOING') {

        // turn driver into codriver
        let setObj = {
          isCopilot: true
        };
        let bookingData = await Model.Booking.find({
          $or: [
            { driverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } },
            { coDriverId: { $in: [mongoose.Types.ObjectId(req.user._id)] } }],
          bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
        });
        if (bookingData && bookingData.length) {
          return res.ok(false, Constant.driverHasBusyOnBooking, {})
        }
        if (setObj.isCopilot) {
          setObj.isPilot = false;
          setObj.coDriverId = null;
        } else {
          setObj.isPilot = true;
        }
        if (!setObj.isCopilot) {
          let vehicleData = await Model.Vehicle.find({ driverId: mongoose.Types.ObjectId(req.user._id) });
          if (vehicleData && vehicleData.length == 0) {
            return res.ok(false, Constant.driverHasNotVehicle, {})
          }
        }
        let driverData = await Model.Driver.findOne({ _id: req.user._id });
        if (driverData && driverData.isPairedDriver && driverData.isCopilot != setObj.isCopilot) {
          return res.ok(false, Constant.unPairedFirst, {})
        } else {
          delete setObj.coDriverId;
        }
        if (driverData && driverData.coDriverId) {
          bookingData = await Model.Booking.find({
            $or: [
              { driverId: { $in: [mongoose.Types.ObjectId(driverData.coDriverId)] } },
              { coDriverId: { $in: [mongoose.Types.ObjectId(driverData.coDriverId)] } }],
            bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] }
          });
          if (bookingData && bookingData.length) {
            return res.ok(false, Constant.driverHasBusyOnBooking, {})
          }
        }
        if (driverData && driverData.isPairedDriver && driverData.isPilot) {
          return res.ok(false, Constant.unPairedFirst, {})
        }

        await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: setObj });
        driverData = await Model.Driver.findOne({ _id: req.user._id });
        // end turn driver into co-driver

        //add co-driver in driver
        let setObj2 = {};
        let driverId = bookingDetail.driverId;
        let coDriverId = null;

        const driver = await Model.Driver.findOne({ _id: req.user._id });
        if (!driver) {
          res.ok(false, Constant.driverNotFound, {})
        }
        if (driver.isPilot) {
          // driverId = driver._id;
          // coDriverId = req.body.pairedDriverId;
        } else {
          driverId = bookingDetail.driverId;
          coDriverId = driver._id;
        }
        const driverData2 = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverId) });
        if (!driverData2) {
          res.ok(false, Constant.driverNotFound, {})
        }
        if (driverData2 && driverData2.isPairedDriver) {
          res.ok(false, Constant.driverAlreadyPaired, driverData2)
        }
        const coDriverData = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(coDriverId) }).populate({ path: 'coDriverId' });
        if (!coDriverData) {
          res.ok(false, Constant.driverNotFound, {})
        }
        if (coDriverData && coDriverData.isPairedDriver) {
          res.ok(false, Constant.driverAlreadyPaired, {})
        }
        if (driverData2.isPilot == coDriverData.isPilot) {
          res.ok(false, Constant.bothDriverPilot, {})
        }
        if (driverData2.isCopilot == coDriverData.isCopilot) {
          res.ok(false, Constant.bothDriverCopilot, {})
        }
        setObj2 = {
          isPairedDriver: true,
          coDriverId: coDriverId
        }
        await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(driverId) }, { $set: setObj2 }, { lean: true });
        setObj2 = {
          isPairedDriver: true,
          coDriverId: driverId
        }
        await Model.Driver.findOneAndUpdate({ _id: mongoose.Types.ObjectId(coDriverId) }, { $set: setObj2 }, { lean: true });
        // end add cordiver in driver


        // booking id update for co-driver
        const booking = {
          coDriverId: req.user._id
        }
        await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(bookingDetail._id) }, { $set: booking }, { lean: true });
        // end booking id update for co-driver



        //add driver earing to co-driver

        //edit for driver
        const driverEarning = await Model.DriverEaring.findOne({ bookingId: mongoose.Types.ObjectId(bookingDetail._id), isDriver: true });
        console.log(driverEarning, 'driverEarning');
        const shareAmount = driverEarning.driverEarningAmount / 2
        const driverEarningUpdate = {
          driverEarningAmount: shareAmount
        }
        await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(bookingDetail._id) }, { $set: driverEarningUpdate })
        // add for co-driver
        earingObj = {};
        earingObj.bookingId = bookingDetail._id;
        earingObj.driverId = req.user._id;
        earingObj.userId = bookingDetail.userId;
        earingObj.bookingStatus = bookingDetail.bookingStatus;
        earingObj.paymentMode = bookingDetail.paymentMode;
        earingObj.paymentStatus = bookingDetail.paymentStatus;
        earingObj.bookingDate = bookingDetail.bookingDate;
        earingObj.bookingCreatedDate = bookingDetail.createdAt;
        earingObj.driverEarningAmount = shareAmount;
        earingObj.isCoDriver = true;
        earingObj.bookingLocalDate = bookingDetail.bookingLocalDate;
        await Model.DriverEaring(earingObj).save();

        //end add driver earing to co-driver

        console.log(bookingDetail, '___________________________________________');
        return res.ok(true, null, driverData);

      } else {
        return res.ok(false, Constant.bookingMessages.tripCompleted, null);
      }
    }
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
}

async function ignoreBookingStatus(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    if (Validation.isDriverValid.isValidDriverIgnoreBooking(req.body))
      return res.ok(false, Constant.required, null);
    const driverData = await Model.Driver.findOne({ _id: req.user._id });
    setObj.bookingStatus = Constant.bookingStatus.COMPLETED;
    await Model.BookingDriverRequestLog({
      driverId: driverData.driverId,
      bookingId: req.body.bookingId, bookingStatus: setObj.bookingStatus
    }).save();
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
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
CRON FOR AUTO ALLOCATION API'S
*/
async function getUserDataAndPassToAutoAlloction(bookingData, userData) {
  try {
    if (bookingData.bookingStatus === Constant.bookingStatus.CANCELED) {
      //DO nothing
    } else {
      const bookingDataCount = await Model.Booking.countDocuments({
        userId: mongoose.Types.ObjectId(bookingData.userId),
        bookingStatus: { $nin: ['COMPLETED', 'CANCELED'] },
        isTripAllocated: true
      });
      if (bookingDataCount) {
        await Model.Booking.findOneAndUpdate({ _id: bookingData._id }, {
          $set: {
            isTripAllocated: true, isSheduledBooking: false
          }
        });
        // cronJob.sendNotificationToUserForCancelBookingDelayTime(bookingData);
      } else {
        await Model.Booking.findOneAndUpdate({ _id: bookingData._id }, {
          $set: {
            isTripAllocated: true,
            isSheduledBooking: false
          }
        });
        let payload = {
          title: Constant.bookingMessages.autoAllocationStart,
          message: Constant.bookingMessages.autoAllocationStart,
          eventType: Constant.eventType.autoAllocationStart,
          userId: bookingData.userId,
          userData: userData,
          bookingId: bookingData._id,
          receiverId: bookingData.userId,
          isUserNotification: true,
          isNotificationSave: false
        };
        if (userData && userData.isNotification) {
          const userDeviceData = await Model.Device.find({ userId: mongoose.Types.ObjectId(bookingData.userId) });
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
        process.emit("sendNotificationToUser", payload);
        await availableFreeDriver(bookingData, userData, {});
      }

    }
    return true;
  } catch (error) {
    console.log(error);
    return false
  }
}

async function getCurrentBookingDataForAutoAllocation(bookingDataObj) {
  try {
    if (bookingDataObj) {
      const pipeline = [];
      if (bookingDataObj && bookingDataObj._id) {
        pipeline.push({ $match: { _id: mongoose.Types.ObjectId(bookingDataObj._id) } });
      }
      if (bookingDataObj && bookingDataObj.bookingDate) {
        pipeline.push({ $match: { bookingDate: new Date(bookingDataObj.bookingDate) } });
      }
      if (bookingDataObj && bookingDataObj.isCronTrue) {
        pipeline.push({
          $match: {
            bookingDate: {
              $lte: new Date(moment().add(2, 'm')),
            }
          }
        });
        pipeline.push({
          $match: {
            bookingStatus: 'PENDING',
            isTripAllocated: false, isSheduledBooking: true
          }
        });
      }
      pipeline.push(
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
            bookingNo: 1,
            vehicleTypeId: 1,
            userVehicleId: 1,
            adminId: 1,
            userId: 1,
            driverId: 1,
            teamId: 1,
            genderType: 1,
            eventTypeId: 1,
            seviceTypeId: 1,
            coDriverId: 1,
            userData: { $arrayElemAt: ["$userData", 0] },
            driverData: { $arrayElemAt: ["$driverData", 0] },
            vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
            userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
            coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
            booKingAmount: 1,
            promoAmount: 1,
            totalDistance: 1,
            paymentMode: 1,
            tripType: 1,
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
            pickUplatitude: 1,
            pickUplongitude: 1,
            dropUplatitude: 1,
            dropUplongitude: 1,
            pickUpAddress: 1,
            dropUpAddress: 1,
            pickUplatitude: 1,
            pickUplongitude: 1,
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
            isCoDriverRequired: 1,
            isDriverRequired: 1,
            genderType: 1,
            promoAmount: 1,
            booKingAmount: 1,
            promoAmount: 1,
            timezone: 1,
            driverEarningAmount: 1
          }
        }
      );
      const bookingData = await Model.Booking.aggregate(pipeline);
      return bookingData;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function cronForAutoAllocation(bookingDataObj) {
  try {
    if (bookingDataObj && bookingDataObj.bookingId) {
      const bookingData = await getCurrentBookingDataForAutoAllocation({ 
        isCronTrue: false, _id: bookingDataObj.bookingId
      });
      if (bookingData.bookingStatus === Constant.bookingStatus.CANCELED) {
          // Do nothing
      } else {
          if (bookingData && bookingData.length) {
            for (let i = 0; i < bookingData.length; i++) {
              setTimeout(getUserDataAndPassToAutoAlloction(bookingData[i], bookingData[i].userData || null), 1000);
            }
          }
      }
    }
    return true;
  } catch (error) {
    return false
  }
};

/*
BOOKING API'S
*/
async function getAllBooking(req, res) {
  try {
    if (Validation.isUserValidate.isValidBookings(req.body))
      return res.ok(false, Constant.required, null);
    let pipeline = [];
    const query = { isDeleted: false };
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
    if (req.body.isEventBooking != undefined) {
      query.isEventBooking = req.body.isEventBooking ? true : false
      pipeline.push({ $match: { isEventBooking: query.isEventBooking } });
    }
    query.$or = [{ driverId: mongoose.Types.ObjectId(req.user._id) },
    { coDriverId: mongoose.Types.ObjectId(req.user._id) }];
    pipeline.push({
      $match: {
        $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
        { coDriverId: mongoose.Types.ObjectId(req.user._id) }]
      }
    });
    const limit = parseInt(req.body.limit) || 10;
    const skip = parseInt(req.body.skip) || 0;

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
          coDriverId: 1,
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          booKingAmount: 1,
          promoAmount: 1,
          totalDistance: 1,
          tripType: 1,
          transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          dropUpAddressFirst: 1,
          dropUplatitudeSecond: 1,
          paymentMode: 1,
          isCompleteByCustomer: 1,
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          note: 1,
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
          eta: 1,
          totalDistanceInKm: 1,
          actualAmount: 1,
          walletAmount: 1,
          isTip: 1,
          driverEarningAmount: 1
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
    if (Validation.isUserValidate.isValidBookingDetails(req.body))
      return res.ok(false, Constant.required, null);
    //{$match:{driverId:req.user._id}},
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
          from: 'vehicleType',
          localField: 'vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleTypeData'
        }
      },
      // {
      //   $lookup: {
      //     from: 'bookings',
      //     localField: 'firstName',
      //     foreignField: 'firstName',  
      //     as: 'userData'
      //   }
      // },
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
          vehicleTypeId: 1,
          userVehicleId: 1,
          adminId: 1,
          bookingNo: 1,
          userId: 1,
          seviceTypeId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          genderType: 1,
          // userData: { $arrayElemAt: ["$userData", 0] },
          vehicleTypeData: { $arrayElemAt: ["$vehicleTypeData", 0] },
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
          note: 1,
          tripType: 1,
          isRoundTrip: 1,
          isSingleTrip: 1,
          eventTypeData: 1,
          coDriverId: 1,
          teamData: 1,
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
          isCompleteByCustomer: 1,
          droupUpLocationFour: 1,
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
          isEventBooking: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          totalDistance: 1,
          paymentMode: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          actualAmount: 1,
          walletAmount: 1,
          pendingAmount: 1,
          promoAmount: 1,
          booKingAmount: 1,
          timezone: 1,
          eta: 1,
          totalDistanceInKm: 1,
          isTip: 1,
          driverEarningAmount: 1
        }
      }
    ];
    const userData1 = await Model.Booking.findOne({_id: req.body._id});
    const userData = { 
      firstName: userData1.firstName,
      lastName: userData1.lastName,
      phone: userData1.phoneNo,
      email: userData1.email,
      countryCode: userData1.countryCode,
      longitude: userData1.dropUplongitude,
      latitude: userData1.dropUplatitude,
      address: userData1.dropUpAddress,
    }
    const bookingData = await Model.Booking.aggregate(pipeline);
    let dataToSend = { ...bookingData[0], userData}
    // if (bookingData && bookingData.length) {
    //   dataToSend = bookingData[0], || {};
    // }
    return res.success(true, null, dataToSend);
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
    const skip = parseInt(req.body.skip) || 0;
    const limit = parseInt(req.body.limit) || 10;
    const count = await Model.DriverNotification.countDocuments({ receiverId: req.user._id, isDeleted: false });
    let pipeline = [
      { $match: { receiverId: mongoose.Types.ObjectId(req.user._id) } },
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
          from: 'admins',
          localField: 'adminId',
          foreignField: '_id',
          as: 'adminData'
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
          createdAt: 1,
          message: 1,
          isRead: 1,
          eventType: 1
        }
      }
    ];
    if (req.query.isRead != undefined) {
      pipeline.push({ $match: { isRead: false } });
    }
    const notificationData = await Model.DriverNotification.aggregate(pipeline);
    return res.success(true, null, notificationData, count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function clearNotification(req, res) {
  try {
    if (Validation.isUserValidate.isValidId(req.body))
      return res.ok(false, Constant.required, null);
    //await Model.DriverNotification.findOneAndUpdate({_id: req.body._id},req.body);
    await Model.DriverNotification.deleteMany({ _id: req.body._id })
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function clearAllNotification(req, res) {
  try {
    //await Model.DriverNotification.update({receiverId: req.user._id},req.body,{multi:true});
    await Model.DriverNotification.deleteMany({ receiverId: req.user._id });
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function enableDisableNotification(req, res) {
  try {
    let setObj = {};
    if (req.body.isNotification != undefined && req.body.isNotification != null) {
      setObj.isNotification = req.body.isNotification ? true : false;
    }
    await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: setObj }, {});
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
RATING AND REVIEW API'S
*/
async function ratingAndReviewToUser(req, res) {
  try {
    if (Validation.isDriverValid.isValidId(req.body))
      return res.ok(false, Constant.required, null);
    let saveObj = {};
    if (req.body.customerReview) {
      saveObj.customerReview = req.body.customerReview;
      saveObj.isCustomerReviewed = true;
    } else {
      saveObj.isCustomerReviewed = true;
    }
    if (req.body.customerRating != undefined) {
      saveObj.customerRating = req.body.customerRating;
      saveObj.isCustomerRated = true;
    } else {
      saveObj.isCustomerRated = true;
    }
    await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, {
      $set: saveObj
    });
    let bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body._id) });
    // if (bookingData && saveObj.isCustomerRated) {
    //   let userData = await Model.User.findOne({ _id: bookingData.userId });
    //   let setObj = {
    //     rating: userData.rating + saveObj.customerRating,
    //     totalRatedBooking: userData.totalRatedBooking + 1,
    //     avgRating: parseFloat(((userData.rating + saveObj.customerRating) / (userData.totalRatedBooking + 1)).toFixed(1))
    //   };
    //   await Model.User.findOneAndUpdate({ _id: bookingData.userId }, { $set: setObj });
    // }
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getUserData(userData) {
  try {
    if (userData.userId) {
      const user = await Model.User.findOne({ _id: mongoose.Types.ObjectId(userData.userId) });
      return user;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};

async function getDriverData(driverData) {
  try {
    if (driverData.driverId) {
      const driver = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverData.driverId) }, {
        firstName: 1,
        lastName: 1,
        image: 1,
        phone: 1,
        countryCode: 1
      });
      return driver;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};

async function getCoDriverData(driverData) {
  try {
    if (driverData.receiverId) {
      const driver = await Model.Driver.findOne({ _id: mongoose.Types.ObjectId(driverData.receiverId) }, {
        firstName: 1,
        lastName: 1,
        image: 1,
        phone: 1,
        countryCode: 1
      });
      return driver;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};

async function getAllChatMessages(req, res) {
  try {
    if (
      !req.body.bookingId ||
      (req.body.bookingId).length != 24
    )
      return res.ok(false, Constant.required, null);

    let dataToSend = {};
    const pipeline = [
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { bookingId: mongoose.Types.ObjectId(req.body.bookingId) } },
      {
        $sort: {
          "createdAt": 1
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
          as: 'cDriverData'
        }
      },
      {
        $project: {
          userId: 1,
          driverId: 1,
          bookingId: 1,
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          message: 1,
          receiverId: 1
        }
      }
    ];
    const chatMessage = await Model.chatMessage.aggregate(pipeline);
    dataToSend.chatMessage = chatMessage || [];
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getAllChatMessagesForDriver(req, res) {
  try {
    if (
      !req.body.driverId ||
      (req.body.driverId).length != 24
    )
      return res.ok(false, Constant.required, null);

    let dataToSend = {};
    const pipeline = [
      {
        $match: {
          $or: [{
            driverId: mongoose.Types.ObjectId(req.user._id),
            receiverId: mongoose.Types.ObjectId(req.body.driverId)
          },
          {
            driverId: mongoose.Types.ObjectId(req.body.driverId),
            receiverId: mongoose.Types.ObjectId(req.user._id)
          }]
        }
      },
      {
        $sort: {
          "createdAt": 1
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
          userId: 1,
          driverId: 1,
          coDriverId: 1,
          driverData: { $arrayElemAt: ["$driverData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          message: 1,
          receiverId: 1
        }
      }
    ];
    const chatMessage = await Model.DriverChatMessage.aggregate(pipeline);
    dataToSend.chatMessage = chatMessage || [];
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getPayemntHistory(req, res) {
  try {
    let dataToSend = {};
    let pipeline = [];
    let months = [{ month: "01", name: "Jan" },
    { month: "02", name: "Fab" },
    { month: "03", name: "Mar" },
    { month: "04", name: "Apr" },
    { month: "05", name: "May" },
    { month: "06", name: "Jun" },
    { month: "07", name: "Jul" },
    { month: "08", name: "Aug" },
    { month: "09", name: "Sep" },
    { month: "10", name: "Oct" },
    { month: "11", name: "Nov" },
    { month: "12", name: "Desc" }];
    let days = [{ day: "Mo", name: "M" },
    { day: "Tu", name: "T" },
    { day: "We", name: "W" },
    { day: "Th", name: "T" },
    { day: "Fr", name: "F" },
    { day: "Sa", name: "S" },
    { day: "Su", name: "S" }];
    // {$match:{$or:[{driverId:mongoose.Types.ObjectId(req.user._id)},
    //     {coDriverId:mongoose.Types.ObjectId(req.user._id)}]}},
    //{$match:{isEventBooking:false}},

    pipeline = [
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { bookingStatus: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalAmount: { "$sum": "$driverEarningAmount" }
        }
      }
    ];
    const totalData = await Model.DriverEaring.aggregate(pipeline);
    if (totalData && totalData.length) {
      dataToSend.totalAmount = totalData[0].totalAmount || 0;
    } else {
      dataToSend.totalAmount = 0;
    }
    if (req.body.isYear) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%Y", date: "$bookingLocalDate" } },
            year: { $first: { "$dateToString": { format: "%Y", date: "$bookingLocalDate" } } },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      const yearData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.yearData = [];
      let currentYear = parseInt(moment().format("YYYY"));
      let obj = _.minBy(yearData, function (o) { return o.year; });
      let minYear = obj ? parseInt(obj.year) : currentYear;

      while (minYear <= currentYear) {
        let tempObj = _.find(yearData, { year: (minYear).toString() });
        if (tempObj) {
          dataToSend.yearData.push({ year: minYear, totalAmount: tempObj.totalAmount });
        } else {
          dataToSend.yearData.push({ year: minYear, totalAmount: 0 });
        }
        minYear++;
      }
    }
    if (req.body.isMonth) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('year')),
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%m", date: "$bookingLocalDate" } },
            month: { $first: { "$dateToString": { format: "%m", date: "$bookingLocalDate" } } },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      console.log("pipeline", JSON.stringify(pipeline))
      const monthData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.monthData = [];
      for (let i = 0; i < months.length; i++) {
        let obj = _.find(monthData, { month: months[i].month });
        if (obj) {
          dataToSend.monthData.push({ month: months[i].name, totalAmount: obj.totalAmount });
        } else {
          dataToSend.monthData.push({ month: months[i].name, totalAmount: 0 });
        }
      }
    }
    if (req.body.isWeek) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('week').add(1, 'd')),
              $lte: new Date(moment().endOf('week').add(1, 'd'))
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%d", date: "$bookingLocalDate" } },
            date: { $first: "$bookingLocalDate" },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      const weakData = await Model.DriverEaring.aggregate(pipeline);
      console.log(pipeline);
      let finalWeekData = [];
      for (let i = 0; i < weakData.length; i++) {
        finalWeekData.push({ day: moment(weakData[i].date).format("dd"), totalAmount: weakData[i].totalAmount })
      }
      dataToSend.weakData = [];
      for (let i = 0; i < days.length; i++) {
        let obj = _.find(finalWeekData, { day: days[i].day });
        if (obj) {
          dataToSend.weakData.push({ day: days[i].name, totalAmount: obj.totalAmount });
        } else {
          dataToSend.weakData.push({ day: days[i].name, totalAmount: 0 });
        }
      }
    }

    // add money to driver earing
    const driverid = await { driverId: mongoose.Types.ObjectId(req.user._id) };
    const DriverPayoutId = await Model.DriverPayout.findOne({ driverId: req.user._id });
    if (DriverPayoutId === null) {
      let query = {
        driverId: driverid.driverId,
        driverAllTimeWallet: dataToSend.totalAmount,
      }
      const data = await Model.DriverPayout(query).save();
      console.log(data, '____');
    } else {
      if (driverid.driverId == DriverPayoutId.driverId) {
        let query = {
          driverId: driverid.driverId,
          driverAllTimeWallet: dataToSend.totalAmount,
        }
        const data = await Model.DriverPayout(query).save();
        console.log(data, '____');
      } else {
        let query = {
          driverAllTimeWallet: dataToSend.totalAmount,
        }
        await Model.DriverPayout.findOneAndUpdate({ _id: DriverPayoutId.id }, query);
      }
    }

    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function getPayemntHistoryList(req, res) {
  try {
    console.log("getPayemntHistoryList _____________________________________________________");
    let dataToSend = {};
    let skip = parseInt(req.body.skip) || 0;
    let limit = parseInt(req.body.limit) || 0;
    let pipeline = [];
    let criteria = {};
    // {$match:{$or:[{driverId:mongoose.Types.ObjectId(req.user._id)},
    //{coDriverId:mongoose.Types.ObjectId(req.user._id)}]}},
    //{$match:{isEventBooking:false}},
    if (req.body.isYear) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        {
          $match: {
            bookingLocalDate: {
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $sort: {
            "bookingCreatedDate": -1
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
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'bookingData'
          }
        },
        {
          $project: {
            _id: 1,
            driverEarningAmount: 1,
            userFirstName: { $arrayElemAt: ["$userData.firstName", 0] },
            userLastName: { $arrayElemAt: ["$userData.lastName", 0] },
            userImage: { $arrayElemAt: ["$userData.image", 0] },
            paymentStatus: { $arrayElemAt: ["$bookingData.paymentStatus", 0] },
            paymentMode: { $arrayElemAt: ["$bookingData.paymentMode", 0] },
            bookingStatus: { $arrayElemAt: ["$bookingData.bookingStatus", 0] },
            bookingDate: { $arrayElemAt: ["$bookingData.bookingDate", 0] },
            bookingNo: { $arrayElemAt: ["$bookingData.bookingNo", 0] },
            booKingAmount: { $arrayElemAt: ["$bookingData.booKingAmount", 0] },
            promoAmount: { $arrayElemAt: ["$bookingData.promoAmount", 0] },
            totalAmount: { $arrayElemAt: ["$bookingData.totalAmount", 0] },
            pendingAmount: { $arrayElemAt: ["$bookingData.pendingAmount", 0] },
            timezone: { $arrayElemAt: ["$bookingData.timezone", 0] },
            walletAmount: { $arrayElemAt: ["$bookingData.walletAmount", 0] },
            actualAmount: { $arrayElemAt: ["$bookingData.actualAmount", 0] },
            isTipAmount: 1,
            isTipPr: 1,
          }
        }
      ];
      criteria = {
        driverId: mongoose.Types.ObjectId(req.user._id),
        bookingLocalDate: {
          $lte: new Date(moment().endOf('year'))
        }
      }
      const yearCount = await Model.DriverEaring.countDocuments(criteria);
      const yearData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.yearData = yearData || [];
      dataToSend.yearCount = yearCount || 0;
    }
    if (req.body.isMonth) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('year')),
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $sort: {
            "bookingCreatedDate": -1
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
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'bookingData'
          }
        },
        {
          $project: {
            _id: 1,
            driverEarningAmount: 1,
            userFirstName: { $arrayElemAt: ["$userData.firstName", 0] },
            userLastName: { $arrayElemAt: ["$userData.lastName", 0] },
            userImage: { $arrayElemAt: ["$userData.image", 0] },
            paymentStatus: { $arrayElemAt: ["$bookingData.paymentStatus", 0] },
            paymentMode: { $arrayElemAt: ["$bookingData.paymentMode", 0] },
            bookingStatus: { $arrayElemAt: ["$bookingData.bookingStatus", 0] },
            bookingDate: { $arrayElemAt: ["$bookingData.bookingDate", 0] },
            bookingNo: { $arrayElemAt: ["$bookingData.bookingNo", 0] },
            booKingAmount: { $arrayElemAt: ["$bookingData.booKingAmount", 0] },
            promoAmount: { $arrayElemAt: ["$bookingData.promoAmount", 0] },
            totalAmount: { $arrayElemAt: ["$bookingData.totalAmount", 0] },
            pendingAmount: { $arrayElemAt: ["$bookingData.pendingAmount", 0] },
            timezone: { $arrayElemAt: ["$bookingData.timezone", 0] },
            walletAmount: { $arrayElemAt: ["$bookingData.walletAmount", 0] },
            actualAmount: { $arrayElemAt: ["$bookingData.actualAmount", 0] },
            isTipAmount: 1,
            isTipPr: 1,
          }
        }
      ];
      criteria = {
        driverId: mongoose.Types.ObjectId(req.user._id),
        bookingLocalDate: {
          $gte: new Date(moment().startOf('year')),
          $lte: new Date(moment().endOf('year')),
        }
      }
      const monthCount = await Model.DriverEaring.countDocuments(criteria);

      const monthData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.monthData = monthData || [];
      dataToSend.monthCount = monthCount || 0;
    }
    if (req.body.isWeek) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('week').add(1, 'd')),
              $lte: new Date(moment().endOf('week').add(1, 'd'))
            },
          }
        },
        {
          $sort: {
            "bookingCreatedDate": -1
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
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'bookingData'
          }
        },
        {
          $project: {
            _id: 1,
            driverEarningAmount: 1,
            userFirstName: { $arrayElemAt: ["$userData.firstName", 0] },
            userLastName: { $arrayElemAt: ["$userData.lastName", 0] },
            userImage: { $arrayElemAt: ["$userData.image", 0] },
            paymentStatus: { $arrayElemAt: ["$bookingData.paymentStatus", 0] },
            paymentMode: { $arrayElemAt: ["$bookingData.paymentMode", 0] },
            bookingStatus: { $arrayElemAt: ["$bookingData.bookingStatus", 0] },
            bookingDate: { $arrayElemAt: ["$bookingData.bookingDate", 0] },
            bookingNo: { $arrayElemAt: ["$bookingData.bookingNo", 0] },
            booKingAmount: { $arrayElemAt: ["$bookingData.booKingAmount", 0] },
            promoAmount: { $arrayElemAt: ["$bookingData.promoAmount", 0] },
            totalAmount: { $arrayElemAt: ["$bookingData.totalAmount", 0] },
            pendingAmount: { $arrayElemAt: ["$bookingData.pendingAmount", 0] },
            timezone: { $arrayElemAt: ["$bookingData.timezone", 0] },
            walletAmount: { $arrayElemAt: ["$bookingData.walletAmount", 0] },
            actualAmount: { $arrayElemAt: ["$bookingData.actualAmount", 0] },
            isTipAmount: 1,
            isTipPr: 1,
          }
        }
      ];
      criteria = {
        driverId: mongoose.Types.ObjectId(req.user._id),
        bookingLocalDate: {
          $gte: new Date(moment().startOf('week').add(1, 'd')),
          $lte: new Date(moment().endOf('week').add(1, 'd'))
        }
      }
      const weekCount = await Model.DriverEaring.countDocuments(criteria);

      const weakData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.weakData = weakData || [];
      dataToSend.weekCount = weekCount || 0;
    }
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function getPayemntDetail(req, res) {
  try {
    let dataToSend = {};
    let pipeline = [];
    let months = [{ month: "01", name: "Jan" },
    { month: "02", name: "Fab" },
    { month: "03", name: "Mar" },
    { month: "04", name: "Apr" },
    { month: "05", name: "May" },
    { month: "06", name: "Jun" },
    { month: "07", name: "Jul" },
    { month: "08", name: "Aug" },
    { month: "09", name: "Sep" },
    { month: "10", name: "Oct" },
    { month: "11", name: "Nov" },
    { month: "12", name: "Desc" }];
    let days = [{ day: "Mo", name: "M" },
    { day: "Tu", name: "T" },
    { day: "We", name: "W" },
    { day: "Th", name: "T" },
    { day: "Fr", name: "F" },
    { day: "Sa", name: "S" },
    { day: "Su", name: "S" }];
    // {$match:{$or:[{driverId:mongoose.Types.ObjectId(req.user._id)},
    //     {coDriverId:mongoose.Types.ObjectId(req.user._id)}]}},
    //{$match:{isEventBooking:false}},

    pipeline = [
      { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { bookingStatus: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalAmount: { "$sum": "$driverEarningAmount" }
        }
      }
    ];
    const totalData = await Model.DriverEaring.aggregate(pipeline);
    if (totalData && totalData.length) {
      dataToSend.totalAmount = totalData[0].totalAmount || 0;
    } else {
      dataToSend.totalAmount = 0;
    }
    if (true) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%Y", date: "$bookingLocalDate" } },
            year: { $first: { "$dateToString": { format: "%Y", date: "$bookingLocalDate" } } },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      const yearData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.yearData = [];
      let currentYear = parseInt(moment().format("YYYY"));
      let obj = _.minBy(yearData, function (o) { return o.year; });
      let minYear = obj ? parseInt(obj.year) : currentYear;

      while (minYear <= currentYear) {
        let tempObj = _.find(yearData, { year: (minYear).toString() });
        if (tempObj) {
          dataToSend.yearData.push({ year: minYear, totalAmount: tempObj.totalAmount });
        } else {
          dataToSend.yearData.push({ year: minYear, totalAmount: 0 });
        }
        minYear++;
      }
    }
    if (true) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('year')),
              $lte: new Date(moment().endOf('year')),
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%m", date: "$bookingLocalDate" } },
            month: { $first: { "$dateToString": { format: "%m", date: "$bookingLocalDate" } } },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      console.log("pipeline", JSON.stringify(pipeline))
      const monthData = await Model.DriverEaring.aggregate(pipeline);
      dataToSend.monthData = [];
      for (let i = 0; i < months.length; i++) {
        let obj = _.find(monthData, { month: months[i].month });
        if (obj) {
          dataToSend.monthData.push({ month: months[i].name, totalAmount: obj.totalAmount });
        } else {
          dataToSend.monthData.push({ month: months[i].name, totalAmount: 0 });
        }
      }
    }
    if (true) {
      pipeline = [
        { $match: { driverId: mongoose.Types.ObjectId(req.user._id) } },
        { $match: { bookingStatus: 'COMPLETED' } },
        {
          $match: {
            bookingLocalDate: {
              $gte: new Date(moment().startOf('week').add(1, 'd')),
              $lte: new Date(moment().endOf('week').add(1, 'd'))
            },
          }
        },
        {
          $group: {
            _id: { "$dateToString": { format: "%d", date: "$bookingLocalDate" } },
            date: { $first: "$bookingLocalDate" },
            totalAmount: { "$sum": "$driverEarningAmount" }
          }
        }
      ];
      const weakData = await Model.DriverEaring.aggregate(pipeline);
      let finalWeekData = [];
      for (let i = 0; i < weakData.length; i++) {
        finalWeekData.push({ day: moment(weakData[i].date).format("dd"), totalAmount: weakData[i].totalAmount })
      }
      dataToSend.weakData = [];
      for (let i = 0; i < days.length; i++) {
        let obj = _.find(finalWeekData, { day: days[i].day });
        if (obj) {
          dataToSend.weakData.push({ day: days[i].name, totalAmount: obj.totalAmount });
        } else {
          dataToSend.weakData.push({ day: days[i].name, totalAmount: 0 });
        }
      }
    }

    // add money to driver earing
    const driverid = await { driverId: mongoose.Types.ObjectId(req.user._id) };
    const DriverPayoutId = await Model.DriverPayout.findOne({ driverId: req.user._id });
    if (DriverPayoutId === null) {
      let query = {
        driverId: driverid.driverId,
        driverAllTimeWallet: dataToSend.totalAmount,
      }
      const data = await Model.DriverPayout(query).save();
      console.log(data, '____');
    } else {
      if (driverid.driverId == DriverPayoutId.driverId) {
        let query = {
          driverId: driverid.driverId,
          driverAllTimeWallet: dataToSend.totalAmount,
        }
        const data = await Model.DriverPayout(query).save();
        console.log(data, '____');
      } else {
        let query = {
          driverAllTimeWallet: dataToSend.totalAmount,
        }
        await Model.DriverPayout.findOneAndUpdate({ _id: DriverPayoutId.id }, query);
      }
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getWithdrawPaymrntHistory(req, res) {
  try {
    const DriverPayout = await Model.DriverPayout.findOne({ driverId: req.body.driverId });
    if (DriverPayout === null) {
      return res.serverError(Constant.serverError);
    } else {
      const DriverPayout = await Model.DriverPayout.findOne({ driverId: req.body.driverId });
      return res.success(true, null, DriverPayout);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}

async function withdrawPayment(req, res) {
  try {
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    const DriverPayout = await Model.DriverPayout.findOne({ driverId: req.body.driverId });

    if (req.body.withdrawAmount > DriverPayout.driverAllTimeWallet) {
      return res.Error('your anount is bigger then wallet amount');
    } else {
      let withdrawArr = []
      console.log();
      if (DriverPayout.withdrawHistory.length > 0) {
        for (let i = 0; i < DriverPayout.withdrawHistory.length; i++) {
          const element = DriverPayout.withdrawHistory[i];
          let oldobj = {
            withdrawAmount: element.withdrawAmount,
            payoutDone: element.payoutDone,
            createdAt: element.createdAt
          }
          withdrawArr.push(oldobj)
        }
        let newobj = {
          withdrawAmount: req.body.withdrawAmount,
          payoutDone: false,
          createdAt: (`${date}/${month}/${year}`)
        }
        withdrawArr.push(newobj)
        //push old value using for loop to one array the push new value in same array and store
      } else {
        //stre value directy in array
        let newobj = {
          withdrawAmount: req.body.withdrawAmount,
          payoutDone: false,
          createdAt: (`${date}/${month}/${year}`)
        }
        withdrawArr.push(newobj)
      }

      let arr = [];
      console.log(withdrawArr.length, 'withdrawArr.length;');
      for (let i = 0; i < withdrawArr.length; i++) {
        arr.push(parseFloat(withdrawArr[i].withdrawAmount))
      }
      var sum = arr.reduce(function (a, b) {
        return a + b;
      }, 0);

      console.log(sum);
      payout = DriverPayout.driverPayout = sum;
      avaibal = DriverPayout.driverAvailableBalance = parseFloat(DriverPayout.driverAllTimeWallet) - parseFloat(sum)


      const paymentWithdraw = await Model.DriverPayout.findOneAndUpdate(
        { driverId: req.body.driverId },
        {
          $set: { withdrawHistory: withdrawArr, driverPayout: payout, driverAvailableBalance: avaibal }
        });

      console.log(paymentWithdraw, '___________');
      return res.success(true, null, paymentWithdraw);
    }




  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
}


async function getRatingList(req, res) {
  try {
    let dataToSend = {};
    let skip = parseInt(req.body.skip) || 0;
    let limit = parseInt(req.body.limit) || 0;
    let pipeline = [];
    let criteria = {};
    criteria = {
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
      { coDriverId: mongoose.Types.ObjectId(req.user._id) }]
    }
    const totalBooking = await Model.Booking.countDocuments(criteria);
    dataToSend.totalBooking = totalBooking || 0;

    criteria = {
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
      { coDriverId: mongoose.Types.ObjectId(req.user._id) }],
      bookingStatus: 'COMPLETED'
    }
    const totalCompleteBooking = await Model.Booking.countDocuments(criteria);
    dataToSend.totalCompleteBooking = totalCompleteBooking || 0;

    criteria = {
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
      { coDriverId: mongoose.Types.ObjectId(req.user._id) }],
      bookingStatus: 'CANCELED'
    }
    const totalCancelBooking = await Model.Booking.countDocuments(criteria);
    dataToSend.totalCancelBooking = totalCancelBooking || 0;

    criteria = {
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
      { coDriverId: mongoose.Types.ObjectId(req.user._id) }],
      isDriverRated: true
    }
    const totalUser = await Model.Booking.countDocuments(criteria);
    dataToSend.totalUser = totalUser || 0;


    criteria = { _id: mongoose.Types.ObjectId(req.user._id) }
    const driverData = await Model.Driver.findOne(criteria, { rating: 1, avgRating: 1 });
    dataToSend.driverData = driverData || 0;

    pipeline = [
      {
        $match: {
          $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
          { coDriverId: mongoose.Types.ObjectId(req.user._id) }]
        }
      },
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
        $project: {
          _id: 1,
          userFirstName: { $arrayElemAt: ["$userData.firstName", 0] },
          userLastName: { $arrayElemAt: ["$userData.lastName", 0] },
          userImage: { $arrayElemAt: ["$userData.image", 0] },
          paymentStatus: 1,
          paymentMode: 1,
          note: 1,
          bookingStatus: 1,
          bookingDate: 1,
          bookingNo: 1,
          timezone: 1,
          isCoDriverRequired: 1,
          isDriverRequired: 1,
          driverRating: 1,
          customerRating: 1,
          driverEarningAmount: 1
        }
      }
    ];
    criteria = {
      $or: [{ driverId: mongoose.Types.ObjectId(req.user._id) },
      { coDriverId: mongoose.Types.ObjectId(req.user._id) }]
    }
    const ratingListCount = await Model.Booking.countDocuments(criteria);
    const ratingList = await Model.Booking.aggregate(pipeline);
    dataToSend.ratingList = ratingList || [];
    dataToSend.ratingListCount = ratingListCount || 0;

    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
startRideWithOtp
*/
async function startRideWithOtp(req, res) {
  try {
    //otp verification
    if (!req.body.otp, !req.body.phoneNo)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "otp": req.body.otp, "phoneNo": req.body.phoneNo });
    //booking details
    if (otpData && otpData._id) {
      if (Validation.isUserValidate.isValidBookingDetails(req.body))
        return res.ok(false, Constant.required, null);
      //{$match:{driverId:req.user._id}},
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
            from: 'vehicleType',
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
            vehicleTypeId: 1,
            userVehicleId: 1,
            adminId: 1,
            bookingNo: 1,
            userId: 1,
            seviceTypeId: 1,
            driverId: 1,
            teamId: 1,
            eventTypeId: 1,
            genderType: 1,
            userData: { $arrayElemAt: ["$userData", 0] },
            vehicleTypeData: { $arrayElemAt: ["$vehicleTypeData", 0] },
            seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
            driverData: { $arrayElemAt: ["$driverData", 0] },
            vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
            userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
            coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
            transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
            note: 1,
            tripType: 1,
            isRoundTrip: 1,
            isSingleTrip: 1,
            eventTypeData: 1,
            coDriverId: 1,
            teamData: 1,
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
            isCompleteByCustomer: 1,
            droupUpLocationFour: 1,
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
            totalDistance: 1,
            paymentMode: 1,
            customerReview: 1,
            isDriverReviewed: 1,
            isCustomerReviewed: 1,
            totalAmount: 1,
            actualAmount: 1,
            walletAmount: 1,
            pendingAmount: 1,
            promoAmount: 1,
            booKingAmount: 1,
            timezone: 1,
            eta: 1,
            totalDistanceInKm: 1,
            driverEarningAmount: 1
          }
        }
      ];
      const bookingData = await Model.Booking.aggregate(pipeline);
      let BookingDetails = {};
      if (bookingData && bookingData.length) {
        BookingDetails = bookingData[0] || {};
      }
      //response send
      await Model.Otp.deleteOne({ "phoneNo": req.body.phoneNo });
      return res.success(true, null, { otpData, BookingDetails });
    } else {
      return res.ok(false, Constant.otpError, {})
    }
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
}


// bank detail

async function addBank(req, res) {
  try {
    if (Validation.isUserValidate.isaddBankValid(req.body)) return res.ok(false, Constant.required, null);
    req.body.userId = req.user._id;
    let bankData = await new Model.Bank(req.body).save();
    bankData = await Model.Bank.findOne({ _id: bankData._id });
    return res.ok(true, null, bankData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function editBank(req, res) {
  try {
    if (Validation.isDriverValid.isEditBankValid(req.body))
      return res.ok(false, Constant.required, null);

    let bankData = await Model.Bank.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true });
    return res.ok(true, null, bankData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getBankDetail(req, res) {
  try {
    if (Validation.isUserValidate.isgetBankValid(req.body))
      return res.ok(false, Constant.required, null);
    const bankid = req.body.driverId
    const data = await Model.Bank.findOne({ 'userId': bankid, "isDeleted": false, })
    return res.ok(false, "Your bank detail", data);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};


// async function createDriverPayoutAccount(req, res) {
//   try {
//     let driverData = await Model.Driver.findOne({ _id: req.user._id });
//     console.log(driverData);
//     const account = await stripe.accounts.create({
//       country: 'US',
//       type: 'custom',
//       email: driverData.email,
//       business_type: 'individual',
//       business_profile: {
//         mcc: "7512",
//         name: "Wingmen",
//         product_description: "Mobile phone application connecting customers to drivers who will take them and their car wherever they need to go. ",
//         support_email: "info@mywngmn.com",
//         support_phone: "+18556996466",
//         support_url: "https://mywngmn.com",
//         url: "https://mywngmn.com"
//       },
//       // industry:"car_rentals",
//       capabilities: {
//         card_payments: {
//           requested: true,
//         },
//         transfers: {
//           requested: true,
//         },
//       },
//       tos_acceptance: {
//         date: Math.floor(Date.now() / 1000),
//         ip: req.connection.remoteAddress, // Assumes you're not using a proxy
//       },
//     });
//     return res.success(true, null, account);
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// }

// async function createDriverPayoutAccount1(req, res) {
//   try {
//     let data = {};
//     let driverData = await Model.Driver.findOne({ _id: req.user._id });
//     console.log(driverData);

//     if (req.file && req.file.filename) {
//       data.orignal = `${Constant.driverImage}/${req.file.filename}`;
//       data.thumbNail = `${req.file.filename}`;
//     }
//     // const docFile = `../../uploads/driverDocument/${data.thumbNail}`
//     // console.log(docFile,'docFile');

//     const file = await stripe.files.create({
//       purpose: 'account_requirement',
//       file: {
//         data: fs.readFileSync(`server/uploads/driverDocument/${data.thumbNail}`),
//         name: data.thumbNail,
//         type: 'application/octet-stream',
//       },
//     });
//     console.log(file, 'Upolad File');

//     if (file === null || file === '') {
//       return res.error(true, "image not upload",);
//     } else {
//       const account = await stripe.accounts.create({
//         country: 'US',
//         type: 'custom',
//         email: driverData.email,
//         business_type: 'individual',
//         business_profile: {
//           mcc: "7512",
//           name: driverData.firstName + ' ' +driverData.lastName,
//           product_description: "Mobile phone application connecting customers to drivers who will take them and their car wherever they need to go. ",
//           support_email: "info@mywngmn.com",
//           support_phone: "+18556996466",
//           support_url: "https://mywngmn.com",
//           url: "https://mywngmn.com"
//         },
//         individual: {
//           dob: {
//             day: 01,
//             month: 01,
//             year: 1901
//           },
//           address: {
//             city: driverData.city || "Los Angeles",
//             country: driverData?.country || "us",
//             line1: "1194 E 35th St, Los Angeles, CA 90011, United States ", //driverData.address,
//             line2: "Los Angeles, CA 90011", //driverData.address,
//             postal_code: driverData?.zipCode || "10011",
//             state: driverData.state || "california"
//           },
//           email: driverData.email,
//           first_name: driverData.firstName,
//           last_name: driverData.lastName,
//           gender: driverData.gender.toLowerCase(),
//           phone: "(415) 856-4852", //driverData.phone,
//           ssn_last_4: "0000"
//         },

//         external_account: {
//           object: 'bank_account',
//           country: driverData?.country || "us",
//           account_holder_name: driverData.firstName,
//           account_holder_type: 'individual',
//           routing_number: "110000000",
//           account_number: "000999999991"
//         },
//         capabilities: {
//           transfers: {
//             requested: true,
//           },
//         },
//         tos_acceptance: {
//           date: Math.floor(Date.now() / 1000),
//           ip: req.connection.remoteAddress, // Assumes you're not using a proxy
//         },
//       });
//       return res.success(true, null, account);
//     }
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// }


// async function uploadStripDocument(req, res) {
//   try {
//     let data = {};
//     if (req.file && req.file.filename) {
//       data.orignal = `${Constant.driverImage}/${req.file.filename}`;
//       data.thumbNail = `${req.file.filename}`;
//     }
//     // const docFile = `../../uploads/driverDocument/${data.thumbNail}`
//     // console.log(docFile,'docFile');

//     const file = await stripe.files.create({
//       purpose: 'account_requirement',
//       file: {
//         data: fs.readFileSync(`server/uploads/driverDocument/${data.thumbNail}`),
//         name: data.thumbNail,
//         type: 'application/octet-stream',
//       },
//     }, {
//       stripeAccount: 'acct_1JVBdo2HkR04uKX3',
//     });

//     console.log(file);

//     if (file === null || file === '') {
//       return res.error(true, "image not upload",);
//     } else {
//       const person = await stripe.accounts.updatePerson(
//         'acct_1JVBdo2HkR04uKX3',
//         'person_4JVBdp00yXyrvHR3',
//         {
//           documents: {
//             bank_account_ownership_verification: {
//               files: file?.id,
//             },
//           }
//         }
//       );
//       return res.success(true, null, person);
//     }
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// }

// async function updatePayoutDriver(req, res) {
//   try {
//     const updateAccount = await stripe.accounts.update(
//       "acct_1JUnW32EPxJ1bDRB", // stripe id for update
//       {
//         tos_acceptance: {
//           date: Math.floor(Date.now() / 1000),
//           ip: req.connection.remoteAddress, // Assumes you're not using a proxy
//         },
//       }
//     );
//     return res.json(true, null, updateAccount);

//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// }

//create bank in stripe
async function createStripeAccountStandard(req, res) {
  try {
    let driverData = await Model.Driver.findOne({ _id: req.user._id });
    console.log(driverData);
    const account = await stripe.accounts.create({
      country: 'US',
      type: 'express',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });

    if (account === null || account === '') {
      return res.error(true, 'Error while creating account.');
    } else {
      const addStripeId = {
        stripeDriverId: account.id
      }
      let bankData = await Model.Driver.findOneAndUpdate({ _id: req.user._id }, { $set: addStripeId });

      const accountLinks = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://mywngmn.com',
        return_url: 'https://mywngmn.com',
        type: 'account_onboarding',
      });

      return res.success(true, null, accountLinks);
    }
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
}

async function getStripeAccountDetail(req, res) {
  try {
    const account = await stripe.accounts.retrieve(
      req.user.stripeDriverId
    );
    return res.success(true, null, account);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
}

async function deleteStripeAccountDetail(req, res) {
  try {
    const account = await stripe.accounts.del(
      req.body.stripeDriverId
    );
    return res.success(true, null, account);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
}

async function assignEventDrivers(req, res) {

  const bookingData = await Model.EventDriver.find();
  for (let index = 0; index < bookingData.length; index++)
  {
    const element = bookingData[index].bookingDate;
    const elementa = element.toString();
    eventDate = new Date(moment(elementa).subtract(5.5, 'h'));
    eventDate1 = eventDate.toString();
    const then = moment(eventDate1);

    const date = new Date(Date.now());
    const element1 = date.toString();
    const now = moment(element1);

    const date1 = new Date(eventDate1);

    const date2 = new Date(element1);

    // console.log("======");
    // console.log(getDifferenceInHours(date1, date2));
    // console.log(date1);
    // console.log(date2);
    // console.log("======");
    function getDifferenceInHours(date1, date2) {
    const diffInMs = Math.abs(date2 - date1);
    return Math.floor(diffInMs / (1000 * 60 * 60));
    }

    if(getDifferenceInHours(date1, date2) < 3)
    {

      Model.EventDriver.findOne({ eventId: bookingData[index].eventId })
        .then(doc => {
          Model.EventBooking.findOneAndUpdate({_id: doc.eventId}, {$set: {driverTeam: doc.driverTeam, CodriverTeam: doc.CodriverTeam}})
            .then(d => {
                // console.log("Saved Successfully");
            })
            .catch(error => {
                console.log(error);
            })
        // Removing doc from the source collection
        // Model.EventDriver.deleteOne({ eventId: doc.eventId })
        //     .then(d => {
        //         console.log("Removed succesfully")
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     });
      })
    }
  }
}