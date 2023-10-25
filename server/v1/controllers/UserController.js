const _ = require('lodash');
const path = require('path');
const stripePay = require('stripe');
const mongoose = require('mongoose');
const shortId = require('shortid');
const bcrypt = require('bcrypt-nodejs');
const randomstring = require('randomstring');
const moment = require('moment');
const Model = require('../../models/index');
const Service = require('../../services/index');
const Validation = require('../Validations/index');
const Constant = require('../../Constant');
const config = require('../../config/config');
const driverController = require('./DriverController');
const { response } = require('express');
const userController = require('./Admin/user/userController');
const { UserController } = require('.');
// const stripe = stripePay(config.stripKeyTest);
const stripe = stripePay(config.stripKey);
// const stripeTest = stripePay(config.stripKeyTest);

exports.checkUserAuth = checkUserAuth;
exports.checkUser = checkUser;
exports.checkGuestUser = checkGuestUser;
exports.register = register;
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.verifyOtpForgotPassword = verifyOtpForgotPassword;
exports.completeProcess = completeProcess;
exports.signIn = signIn;
exports.socialLogin = socialLogin;
exports.logout = logout;
exports.upadateUser = upadateUser;
exports.forgotPassword = forgotPassword;
exports.forgotPasswordWeb = forgotPasswordWeb;
exports.forgotChangePasswordWeb = forgotChangePasswordWeb;
exports.getProfile = getProfile;
exports.deviceRegister = deviceRegister;
exports.changePassword = changePassword;
exports.updateUserProfile = updateUserProfile;
exports.updateUserFullProfile = updateUserFullProfile;
exports.uploadFile = uploadFile;
exports.getVehicleType = getVehicleType;
exports.getServiceType = getServiceType;
exports.addVehicle = addVehicle;
exports.editVehicle = editVehicle;
exports.deleteVehicle = deleteVehicle;
exports.getVehicles = getVehicles;
exports.createBooking = createBooking;
exports.createScheduledBooking = createScheduledBooking;
exports.getCurrentBookingData = getCurrentBookingData;
exports.createBookingPaymentCheck = createBookingPaymentCheck;
exports.applyPromCode = applyPromCode;
exports.createEventBooking = createEventBooking;
exports.finalCompleteByUser = finalCompleteByUser;
exports.getAllBooking = getAllBooking;
exports.getBookingDetails = getBookingDetails;
exports.getCurrentBookingStatus = getCurrentBookingStatus;
exports.getAllNotification = getAllNotification;
exports.clearNotification = clearNotification;
exports.clearAllNotification = clearAllNotification;
exports.enableDisableNotification = enableDisableNotification;
exports.ratingAndReviewToDriver = ratingAndReviewToDriver;
exports.getAutoReview = getAutoReview;
exports.autoRatingAndReviewToDriver = autoRatingAndReviewToDriver;
exports.signUpForgotPassword = signUpForgotPassword;
exports.getAppVersion = getAppVersion;
exports.getContactUs = getContactUs;
exports.getTeam = getTeam;
exports.getEventType = getEventType;
exports.cancelBooking = cancelBooking;
exports.cancelEventBooking = cancelEventBooking;
exports.getUserData = getUserData;
exports.getAllChatMessages = getAllChatMessages;
exports.sendChatBulkPushToUser = sendChatBulkPushToUser;
exports.setUpIntent = setUpIntent;
exports.addCard = addCard;
exports.addEventCard = addEventCard;
exports.getEventBookingById = getEventBookingById;
exports.getCardById = getCardById;
exports.deleteCard = deleteCard;
exports.updateDefaultCard = updateDefaultCard;
exports.getAllCard = getAllCard;
exports.chargeStrip = chargeStrip;
exports.chargeWallet = chargeWallet;
exports.contactUs = contactUs;
exports.subscribe = subscribe;
exports.searchZipCode = searchZipCode;
exports.verifyRideOtp = verifyRideOtp;
exports.tipToDriver = tipToDriver;
exports.tipFromWebsite = tipFromWebsite
exports.generateOtpForRide = generateOtpForRide;
exports.userRefundList = userRefundList;
exports.PromoLogCreate = PromoLogCreate;
exports.getAdminVehicle = getAdminVehicle;
exports.getAllTeamBookings = getAllTeamBookings;
exports.getDriverRate = getDriverRate;
exports.getTotalAmount = getTotalAmount;
exports.eventTotalPay = eventTotalPay;
exports.paymentByDefault = paymentByDefault;

/*
STRIP API'S
*/
async function generateRandomString(noOfChars) {
  return randomstring.generate(noOfChars);
};


async function chargeStrip(opts) {
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
    // console.log("ammount####", obj)
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

async function refundStrip(refundObj) {
  console.log(refundObj, "#################################");
  let response = { status: false, data: {} }
  try {
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

async function chargeStripTest(opts) {
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
    console.log("ammount####", obj.amount)
    let chargeData = await stripeTest.paymentIntents.create(obj);

    if (chargeData && chargeData.id) {
      response.data.paymentId = chargeData.id;
      response.data.amount = chargeData.amount;
      response.data.captureMethod = chargeData.capture_method;
      response.data.stripeCustomerId = chargeData.customer;
      response.status = true
      return response;
    } else {
      return response;
    }
  } catch (error) {
    return response;
  }
}

async function retrieveCardData(opts) {
  let response = { status: false, data: {} }
  try {
    let cardDetails = await stripe.paymentMethods.retrieve(opts.stripePaymentMethod);
    return cardDetails;
  } catch (error) {
    return response;
  }
}

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

async function setUpIntent(req, res) {
  try {
    let dataToSend = {};
    const setupIntent = await stripe.setupIntents.create({ usage: 'off_session' });
    dataToSend.setupIntent = setupIntent || {};
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function addCard(req, res) {
  try {
    if (Validation.isUserValidate.isValidAddCard(req.body))
      return res.ok(false, Constant.required, null);
    const userData = await Model.User.findOne({ _id: req.user._id }, { email: 1, _id: 1 });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const cardDataCheck = await Model.Card.findOne({
      userId: mongoose.Types.ObjectId(req.user._id),
      isDeleted: false, isBlocked: false
    });

    let stripePaymentMethod = req.body.stripePaymentMethod;
    let description = `Create customer ${userData.email} -${userData._id}`;
    let meta_data = req.body.meta_data || null;
    let opts = {
      stripePaymentMethod: stripePaymentMethod,
      description: description,
      meta_data: meta_data,
      name: req.user.firstName,
      email: req.user.email
    }
    let cardResult = await retrieveCardData(opts);
    if (cardResult && !cardResult.card.brand) {
      return res.ok(false, Constant.stripCardRetriveDataError, null);
    }
    cardData = {
      stripePaymentMethod: stripePaymentMethod,
      last4Digits: cardResult.card.last4,
      brand: cardResult.card.brand,
      funding: cardResult.card.funding,
      expiryDate: cardResult.card.exp_month + '-' + cardResult.card.exp_year,
      userId: req.user._id
    }
    let result = await checkCardDetails(cardData);
    if (!result) {
      let stripeDetail = await createStripeCustomer(opts)
      if (!stripeDetail.status) {
        return res.ok(false, Constant.stripCardError, null);
      }
      cardData.userId = req.user._id;
      cardData.stripeCustomerId = stripeDetail.data.id;
      if (!cardDataCheck) {
        cardData.isDefault = true;
      }
    }
    card = await Model.Card(cardData).save();
    const oldCard = await Model.User.findOne({ '_id': req.user._id })
    let arr = []
    for (let i = 0; i < oldCard.userCard.length; i++) {
      arr.push(oldCard.userCard[i]);
    }
    arr.push(card.id)
    const finalData = await Model.User.updateOne({ '_id': mongoose.Types.ObjectId(req.user._id) }, { $set: { userCard: arr } })
    return res.ok(true, null, finalData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function addEventCard(req, res) {
  try {
    if (Validation.isUserValidate.isValidAddCard(req.body))
      return res.ok(false, Constant.required, null);
    const userData = await Model.EventBooking.findOne({ _id: req.user._id });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
    const cardDataCheck = await Model.Card.findOne({
      userId: mongoose.Types.ObjectId(req.user._id),
      isDeleted: false, isBlocked: false
    });
    let stripePaymentMethod = req.body.stripePaymentMethod;
    let description = `Create customer ${userData.email} -${userData._id}`;
    let meta_data = req.body.meta_data || null;
    let opts = {
      stripePaymentMethod: stripePaymentMethod,
      description: description,
      meta_data: meta_data,
      name: req.user.firstName,
      email: req.user.email
    }
    let cardResult = await retrieveCardData(opts);
    if (cardResult && !cardResult.card.brand) {
      return res.ok(false, Constant.stripCardRetriveDataError, null);
    }
    cardData = {
      stripePaymentMethod: stripePaymentMethod,
      last4Digits: cardResult.card.last4,
      brand: cardResult.card.brand,
      funding: cardResult.card.funding,
      expiryDate: cardResult.card.exp_month + '-' + cardResult.card.exp_year,
      userId: req.user._id
    }
    let result = await checkCardDetails(cardData);
    if (!result) {
      let stripeDetail = await createStripeCustomer(opts)
      if (!stripeDetail.status) {
        return res.ok(false, Constant.stripCardError, null);
      }
      cardData.userId = req.user._id;
      cardData.stripeCustomerId = stripeDetail.data.id;
      if (!cardDataCheck) {
        cardData.isDefault = true;
      }
    }
    card = await Model.Card(cardData).save();
    const oldCard = await Model.EventBooking.findOne({ '_id': req.user._id });
    let arr = []
    // if(!oldCard) {
    //   const finalData = await Model.EventManager.updateOne({ '_id': mongoose.Types.ObjectId(req.user._id) }, { $set: { userCard: arr } });
    //   console.log(finalData);
    //   return res.ok(true, null, finalData);
    // }
    // for (let i = 0; i < oldCard.userCard.length; i++) {
    //   arr.push(oldCard.userCard[i]);
    // }
    arr.push(card.id)
    const finalData = await Model.EventBooking.findOneAndUpdate({ '_id': mongoose.Types.ObjectId(req.user._id) }, { $set: { userCard: arr } });
    const eventData = await Model.EventBooking.findOne({ '_id': mongoose.Types.ObjectId(req.user._id) });
    // console.log(`+${eventData.countryCode}`);
    // const CC = +eventData.countryCode;
    // console.log(CC);
    // if (eventData.phone && eventData.countryCode) {
    //   Service.OtpService.sendSMS(
    //     `+${eventData.countryCode}`,
    //     eventData.phone,
    //     // <a href=`http://192.168.29.202:3002/eventbooking/${}`>Your Event Booking is successfully done</a>
    //     // `<a href="http://192.168.29.202:3002/eventbooking/${data._id}" target="_blank">Tap here to accept the ride</a>`
    //     `http://192.168.29.202:3001/eventbooking/${eventData._id}`
    //   );
    // }
    return res.ok(true, null, finalData);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function deleteCard(req, res) {
  try {
    if (Validation.isUserValidate.isValidCardId(req.body))
      return res.ok(false, Constant.required, null);

    await Model.Card.deleteOne({
      _id: mongoose.Types.ObjectId(req.body.cardId),
      userId: mongoose.Types.ObjectId(req.user._id)
    })
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function updateDefaultCard(req, res) {
  try {

    if (Validation.isUserValidate.isValidCardId(req.body))
      return res.ok(false, Constant.required, null);

    await Model.Card.update({ userId: mongoose.Types.ObjectId(req.user._id) },
      { $set: { isDefault: false } }, { multi: true });
    await Model.Card.update({
      _id: mongoose.Types.ObjectId(req.body.cardId),
      userId: mongoose.Types.ObjectId(req.user._id)
    }, { $set: { isDefault: true } });

    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getAllCard(req, res) {
  try {
    let dataToSend = {};
    const criteria = { isDeleted: false, isBlocked: false };
    if (req.body.cardId && req.body.cardId.length == 24)
      criteria._id = mongoose.Types.ObjectId(req.body.cardId);
    criteria.userId = mongoose.Types.ObjectId(req.user._id);

    let limit = parseInt(req.body.limit || 10);
    let skip = parseInt(req.body.skip || 0);

    const count = await Model.Card.countDocuments(criteria);
    dataToSend.count = count || 0;

    const cardData = await Model.Card.find(criteria).limit(limit).skip(skip).sort({ createdAt: -1 });
    dataToSend.cardData = cardData || [];

    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function chargeWallet(req, res) {
  try {
    if (Validation.isUserValidate.isValidChargeWallet(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.amount < 1) {
      return res.ok(false, Constant.minimumAmount, null);
    }
    const userData = await Model.User.findOne({ _id: req.user._id }, { email: 1, _id: 1, firstName: 1, lastName: 1 });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }

    const cardData = await Model.Card.findOne({
      _id: mongoose.Types.ObjectId(req.body.cardId),
      userId: mongoose.Types.ObjectId(req.user._id),
      isDeleted: false, isBlocked: false
    });
    if (!cardData) {
      return res.ok(false, Constant.invalidStripCard, null);
    }
    console.log("####", req.body)
    let amount = parseFloat((parseFloat(req.body.amount)).toFixed(2));
    let paymentObj = {
      amount: amount,
      stripeCustomerId: cardData.stripeCustomerId,
      stripePaymentMethod: cardData.stripePaymentMethod,
      description: `Payemnt for wallet ${userData.firstName} ${userData.lastName}-${userData.email}`
    }
    let paymentData = await chargeStrip(paymentObj)
    console.log("%%%%%%%%%paymentData", paymentData)
    if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
      paymentObj.trxId = paymentData.data.paymentId;
      paymentObj.captureMethod = paymentData.data.captureMethod;
      paymentObj.chargeId = paymentData.data.chargeId;
      paymentObj.paymentStatus = Constant.paymentStatus.completed;
      paymentObj.userId = userData._id;
      paymentObj.cardId = cardData._id;
      await Model.WalletTransaction(paymentObj).save();
      await Model.User.update({ _id: mongoose.Types.ObjectId(req.user._id) },
        { $inc: { walletAmount: (req.body.amount) } });
      return res.ok(true, Constant.walletCharged, {});
    } else {
      return res.ok(false, Constant.invalidStripCard, null);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function sendChatBulkPushToUserDelayTime(userId, socketData) {
  setTimeout(async function () {
    console.log("delay chat 10 second")
  }, 1000);
}

async function sendChatBulkPushToUser(userId, socketData) {
  try {
    if (userId) {
      const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(userId) }, { isNotification: 1 });
      let isNotification = userData ? userData.isNotification : false;
      if (isNotification) {
        const userDeviceData = await Model.Device.find({ userId: mongoose.Types.ObjectId(userId) });
        if (userDeviceData && userDeviceData.length) {
          for (let i = 0; i < userDeviceData.length; i++) {
            if (userDeviceData[i].deviceType == 'IOS') {
              let payload = {
                token: userDeviceData[i].deviceToken,
                title: 'New message',
                message: socketData.message,
                body: socketData.message,
                eventType: Constant.eventType.chatSendToUser,
                isUserNotification: true,
                isNotificationSave: false,
                isDriverDataPass: true
              }
              _.extend(payload, socketData);
              Service.PushNotificationService.sendIosPushNotification(payload);
            } else if (userDeviceData[i].deviceType == 'ANDROID') {
              let payload = {
                token: userDeviceData[i].deviceToken,
                title: 'New message',
                message: socketData.message,
                body: socketData.message,
                eventType: Constant.eventType.chatSendToUser,
                isUserNotification: true,
                isNotificationSave: false,
                isDriverDataPass: true
              }
              _.extend(payload, socketData);
              Service.PushNotificationService.sendAndroidPushNotifiction(payload);
            }
            await sendChatBulkPushToUserDelayTime(userId, socketData);
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

async function generateReferralCode(noOfChars) {
  let referralCode = randomstring.generate(noOfChars);
  ;
  let data = await Model.User.findOne({ referralCode: referralCode })
  if (data) {
    await generateReferralCode(noOfChars);
  } else {
    return referralCode;
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

async function registerDevice(body, userId, isUser) {
  if (!body.deviceType || !body.deviceToken)
    return false;
  body.deviceType = (body.deviceType).toUpperCase();
  const device = await Model.Device.findOne({ userId: userId });
  if (device) {
    try {
      await Model.Device.updateOne({ _id: device._id }, {
        deviceToken: body.deviceToken,
        deviceType: body.deviceType
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    let deviceBody;
    if (isUser) deviceBody = {
      userId: userId,
      deviceType: body.deviceType,
      deviceToken: body.deviceToken,
      isUser: true
    };
    else deviceBody = { driverId: userId, deviceType: body.deviceType, deviceToken: body.deviceToken, isUser: true };
    const Device = new Model.Device(deviceBody);
    try {
      await Device.save();
    } catch (error) {
      console.log(error);
    }
  }
};

async function socialLoginValidateWithUserRegister(req, res) {
  let location = {
    coordinates: [req.body.latitude || 0, req.body.longitude || 0]
  }

  if (req.file) {
    req.body.path = req.file.path
  }

  req.body.location = location;
  await Model.User(req.body).save().then(async (user) => {
    if (user) {
      registerDevice(req.body, user._id, true)
      const encryptKey = await generateRandomString(5);
      let tokenKey = Service.JwtService.issue({
        _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey
      });
      user.set('token', 'SEC ' + tokenKey, { strict: false });
      const token = user.token || '';
      await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { token: tokenKey || null } })
      return res.ok(true, null, { user, token });
    }
  })
};

async function deviceRegister(req, res) {
  const device = await Model.Device.findOne({
    userId: req.user._id
  });
  if (device) {
    try {
      await Model.Device.updateOne({
        _id: device._id
      }, {
        pushToken: req.body.pushToken
      });
      return res.ok(true, null, null);
    } catch (error) {
      console.log(error);
      return res.serverError(Constant.serverError);
    }
  } else {
    req.body.userId = req.user._id;
    const Device = new Model.Device(req.body);
    try {
      await Device.save();
      return res.ok(true, null, null);
    } catch (error) {
      console.log(error);
      return res.serverError(Constant.serverError);
    }
  }
};

/*
 * Register API'S Start
 */
//CHECK FOR ADMIN AUTHORIZATION

async function checkUserAuth(req, res) {
  try {
    const UserCheck = req.user
    let apiResponse = Service.generate.generate(true, 'Success', 200, UserCheck)
    res.send(apiResponse)
  } catch (error) {
    let apiResponse = Service.generate.generate(true, 'Error', 200, error)
    res.send(apiResponse)
  }
};

async function checkUser(req, res) {
  if (!(req.body.phone && req.body.countryCode)) return res.ok(null, Constant.required)
  await Model.User.findOne({
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

async function checkGuestUser(req, res) {
  if (!(req.body.phone)) return res.ok(null, Constant.required)
  await Model.User.findOne({
    $and: [{
      phone: req.body.phone,
      guestUser: true
    }],
  }).then(match => {
    if (match != null) {
      res.send({
        status: 1,
        message: 'you are already a Guest User'
      })
    } else {
      res.send({
        status: 0,
        message: 'you are not a Guest User'
      })
    }
  }).catch(err => {
    res.send(err)
  })
};

async function sendOtp(req, res) {
  const optData = await Model.Otp.findOne({ 'user': req.body.phone });

  if (optData)
    await Model.Otp.deleteMany({ 'user': req.body.phone });

  const Otp = await new Model.Otp({
    otp: Math.floor(100000 + Math.random() * 900000),
    user: req.body.phone, phone: req.body.phone, countryCode: req.body.body, type: req.body.type
  }).save();

  if (req.body.type == 'email') {
    Service.EmailService.sendUserVerifyMail(req.body, Otp);
    return res.ok(true, Constant.verificationCodeSendInEmail, { otpId: Otp._id, otp: Otp.otp });
  }
  if (req.body.phone) {
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phone, "Wingmen code " + Otp.otp);
    return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
  }
  return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
}



async function register(req, res) {

  if (!req.body.phone || !req.body.type)
    return res.ok(false, Constant.required, null);

  const userData = await Model.User.findOne({
    $or: [{ 'email': req.body.phone },
    { 'phone': req.body.phone }], isDeleted: false
  });

  // if (userData) {
  //   if (userData.email == req.body.phone) {
  //     return res.ok(false, Constant.emailAlreadyExist, null);
  //   } else if (userData.phone == req.body.phone) {
  //     return res.ok(false, Constant.phoneAlreadyExist, null);
  //   } else {
  //     return res.ok(false, Constant.userAlreadyExist, null);
  //   }
  // }

  const optData = await Model.Otp.findOne({ 'user': req.body.phone });

  if (optData)
    await Model.Otp.deleteMany({ 'user': req.body.phone });

  const Otp = await new Model.Otp({
    otp: Math.floor(100000 + Math.random() * 900000),
    user: req.body.phone, phone: req.body.phone, countryCode: req.body.body, type: req.body.type
  }).save();

  if (req.body.type == 'email') {
    Service.EmailService.sendUserVerifyMail(req.body, Otp);
    return res.ok(true, Constant.verificationCodeSendInEmail, { otpId: Otp._id, otp: Otp.otp });
  }
  if (req.body.phone) {
    Service.OtpService.sendSMS(req.body.countryCode, req.body.phone, "Wingmen code " + Otp.otp);
    return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
  }
  return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });

};


async function signUpForgotPassword(req, res) {
  try {
    console.log("==========", req.body)
    if (!req.body.phone || !req.body.type)
      return res.ok(false, Constant.required, null);

    const userData = await Model.User.findOne({
      $or: [{ 'email': req.body.phone },
      { 'phone': req.body.phone }], isDeleted: false
    });
    console.log({ userData })
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
        console.log("in mobile------------------------")
        Service.OtpService.sendSMS(req.body.countryCode, req.body.phone, "Wingmen code " + Otp.otp);
        // return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });
        return res.ok(true, 'OTP sent successfully', { otpId: Otp._id, otp: Otp.otp });
      }
      return res.ok(true, Constant.verificationCodeSendInPhone, { otpId: Otp._id, otp: Otp.otp });

    } else {
      return res.ok(false, Constant.userNotFound, null);

    }
  } catch (error) {
    console.log({ error })
    return res.ok(false, error, null);
  }

};

async function verifyOtp(req, res) {
  try {

    if (Validation.isUserValidate.isVerifyOtpValid(req.body))
      return res.ok(false, Constant.required, null);

    const otpData = await Service.OtpService.verify(req.body);
    if (!otpData) {
      return res.ok(false, Constant.otpError, null);
    }
    return res.ok(true, null, {});
  } catch (error) {
    return res.ok(false, error, null);
  }
};

async function verifyRideOtp(req, res) {
  try {
    if (!req.body.phoneNo)
      return res.ok(false, Constant.required, null)
    const otpData = await Model.Otp.findOne({ "phoneNo": req.body.phoneNo });

    console.log(otpData, 'otp data');
    // if (Validation.isUserValidate.isVerifyOtpValid(req.body))
    //   return res.ok(false, Constant.required, null);

    // const otpData = await Service.OtpService.verify(req.body);
    // if (!otpData) {
    //   return res.ok(false, Constant.otpError, null);
    // }
    return res.ok(true, null, otpData);
  } catch (error) {
    return res.ok(false, error, null);
  }
};

async function verifyOtpForgotPassword(req, res) {
  try {

    if (Validation.isUserValidate.isVerifyOtpValid(req.body))
      return res.ok(false, Constant.required, null);

    const otpData = await Service.OtpService.verifyWithOutDelete(req.body);
    if (!otpData) {
      return res.ok(false, Constant.otpError, null);
    }
    return res.ok(true, null, otpData);
  } catch (error) {
    return res.ok(false, error, null);
  }
};

async function forgotPassword(req, res) {
  if (Validation.isUserValidate.isForgotPasswordValid(req.body))
    return res.ok(false, Constant.required, null);
  const otpData = await Service.OtpService.verify(req.body);
  if (!otpData) {
    return res.ok(false, Constant.otpError, null);
  }
  const userData = await Model.User.findOne({
    $or: [{ 'email': otpData.user }, { 'phone': otpData.user }],
    isDeleted: false
  });
  if (userData) {
    userData.updatePassword(req.body.newPassword).then(hash => {

      Model.User.updateOne({
        _id: userData._id
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

};

async function completeProcess(req, res) {

  console.log(req.body)
  if (Validation.isUserValidate.isSignUpValid(req.body)) return res.ok(false, Constant.required, null);
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
  /*req.body.image = '';
  if (req.file && req.file.filename) {
      req.body.image = `${Constant.userImage}/${req.file.filename}`;
  }*/

  req.body.profileStatus = 'COMPLETED';

  if (req.body.isPhoneVerified != undefined) {
    req.body.isPhoneVerified = JSON.parse(req.body.isPhoneVerified) ? true : false
  }
  if (req.body.singUpType != undefined) {
    req.body.singUpType = req.body.singUpType == 'MOBILE' ? 'MOBILE' : 'EMAIL';
  }
  let coordinates = []
  let location = {}
  if (req.body.latitude && req.body.longitude) {
    coordinates.push(Number(req.body.longitude))
    coordinates.push(Number(req.body.latitude))
    location.type = "Point";
    location.coordinates = coordinates
  }

  req.body.location = location;
  if (req.body.referralUserCode) {
    req.body.referralUserCode = req.body.referralUserCode;
    let referralCodeData = await Model.User.findOne({ referralCode: req.body.referralUserCode });
    if (referralCodeData) {
      req.body.referralUserId = referralCodeData._id;
      req.body.referralUserCode = referralCodeData.referralCode || null;
    } else {
      return res.ok(false, Constant.invalidReferral, null);
    }
  }
  req.body.referralCode = await generateReferralCode(6);
  try {
    const user = await new Model.User(req.body).save();
    const encryptKey = await generateRandomString(5);
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey
    });
    user.set('token', 'SEC ' + tokenKey, { strict: false });
    await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { token: tokenKey || null } });
    await Model.User.findOneAndUpdate({ _id: user._id }, { guestUser: true});
    const notes = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
      notesOfTripType: 1,
      notesOfPassengers: 1
    });
    user.set('notes', notes || {}, { strict: false });

    registerDevice(req.body, user._id, true);
    return res.ok(true, null, user);
  } catch (error) {
    console.log(error);
  }
};

async function forgotPasswordWeb(req, res) {
  try {
    if (Validation.isUserValidate.isValidForgotPassword(req.body))
      return res.ok(false, Constant.required, {});
    const user = await Model.User.findOne({ email: req.body.email, isDeleted: false, isBlocked: false });
    if (!user)
      return res.ok(false, Constant.emailNotFound, {});
    const passwordResetToken = await generateRandomString(20);
    await Model.User.findOneAndUpdate({ _id: user._id }, {
      $set: {
        passwordResetToken: passwordResetToken,
        passwordResetTokenDate: new Date()
      }
    });
    const payloadData = {
      email: req.body.email,
      passwordResetToken: passwordResetToken
    }
    Service.EmailService.UserForgotEmail(payloadData);
    return res.ok(true, Constant.passwordResetLinkSendInYourEmail, {});
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }

};

async function forgotChangePasswordWeb(req, res) {
  try {
    if (Validation.isUserValidate.isValidForgotChangePassword(req.body))
      return res.ok(false, Constant.required, {});
    const user = await Model.User.findOne({ passwordResetToken: req.body.passwordResetToken });
    if (!user)
      return res.ok(false, Constant.invalidPasswordResetToken, null);
    const passwordResetToken = await generateRandomString(20);
    user.updatePass(req.body.password).then(hash => {
      Model.User.updateOne({ _id: user._id }, {
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
/*
 * Register API'S End
 */

/*
 SignIn API'S Start
*/
async function signIn(req, res) {
  if (Validation.isUserValidate.isSignInValid(req.body)) return res.ok(false, Constant.required, null);

  let user = await Model.User.findOne({ $or: [{ email: req.body.phone }, { phone: req.body.phone }], isDeleted: false }).populate({ path: 'userCard' });
  if (!user) return res.ok(false, Constant.userNotFound, null);
  if (user.isBlocked) {
    return res.ok(false, Constant.userBlocked, null);
  }
  user.comparePassword(req.body.password, async (match) => {
    // if (!match) return res.ok(false, Constant.invalidPassword, null);
    registerDevice(req.body, user._id, true);
    const encryptKey = await generateRandomString(5);
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey
    });
    user.set('token', 'SEC ' + tokenKey, { strict: false });
    await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { token: tokenKey || null } });
    const notes = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
      notesOfTripType: 1,
      notesOfPassengers: 1
    });
    user.set('notes', notes || {}, { strict: false });
    return res.ok(true, null, user);
  });
};

async function socialLogin(req, res) {
  if (Validation.isUserValidate.isSocialLoginInValid(req.body)) return res.ok(false, Constant.required, null);
  if (req.body.email) {
    const emailUser = await Model.User.findOne({
      email: req.body.email,
      providerId: { $nin: [req.body.providerId] },
      isDeleted: false
    });
    if (emailUser) {
      return res.ok(false, Constant.emailAlreadyExist, null);
    }
  }

  if (req.body.phone) {
    const phoneUser = await Model.User.findOne({
      phone: req.body.phone,
      providerId: { $nin: [req.body.providerId] }, isDeleted: false
    });
    if (phoneUser) {
      return res.ok(false, Constant.phoneAlreadyExist, null);
    }
  }

  let query = { providerId: req.body.providerId, isSocialLogin: true };

  req.body.isSocialLogin = true;
  await Model.User.findOne(query).then(async (user) => {
    if (!user) {
      socialLoginValidateWithUserRegister(req, res)
    } else {
      const encryptKey = await generateRandomString(5);
      let tokenKey = Service.JwtService.issue({
        _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey
      })
      user.set('token', 'SEC ' + tokenKey, { strict: false });
      await Model.User.findOneAndUpdate({ _id: user._id }, { $set: { token: tokenKey || null } });
      const notes = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
        notesOfTripType: 1,
        notesOfPassengers: 1
      });
      user.set('notes', notes || {}, { strict: false });
      return res.ok(true, Constant.login, user);
    }
  })
};

async function logout(req, res) {
  console.log('====1');
  const encryptKey = await generateRandomString(5);
  let tokenKey = Service.JwtService.issue({
    _id: Service.HashService.encrypt(req.user._id), encryptKey: encryptKey
  })
  console.log('==2', tokenKey);
  let a = await Model.Device.deleteMany({ userId: req.user._id });
  let b = await Model.User.findOneAndUpdate({ _id: req.user._id }, { tokenKey: tokenKey }, {});
  console.log('==3', a);
  console.log('==4', b);
  return res.ok(true, null, {});
};

/*
 SignIn API'S End
*/
async function upadateUser(req, res) {
  if (!req.body)
    return res.ok(false, null, Constant.required)
  let UserData = await Model.User.findOne({
    _id: req.user._id
  });

  req.body.profileStatus = "COMPLETED";
  if (req.body.password) {
    const data = await bcrypt.compare(req.body.password, UserData.password)
    if (data == true) {
      return res.ok(null, Constant.samePasswordNotAllowed)
    } else {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
  }
  if (req.file) req.body.image = `${Constant.userImage}/${req.file.filename}`;

  if (req.body.latitude || req.body.longitude) {
    let location = {
      coordinates: [req.body.latitude, req.body.longitude]
    }
    req.body.location = location
  }
  if (req.body.email) {
    const emailUser = await Model.User.findOne({
      email: req.body.email,
      _id: { $nin: [req.user._id] },
      isDeleted: false
    });
    if (emailUser) {
      return res.ok(false, Constant.emailAlreadyExist, null);
    }
  }
  if (req.body.phone) {
    const phoneUser = await Model.User.findOne({
      phone: req.body.phone,
      _id: { $nin: [req.user._id] }, isDeleted: false
    });
    if (phoneUser) {
      return res.ok(false, Constant.phoneAlreadyExist, null);
    }
  }
  if (req.body.email) {
    req.body.isVerified = false;
  }
  if (req.body.phone) {
    req.body.isPhoneVerified = false;
  }
  if (req.body.singUpType != undefined) {
    req.body.singUpType = req.body.singUpType == 'MOBILE' ? 'MOBILE' : 'EMAIL';
  }
  const otp = await Service.OtpService.issue();
  if (req.body.email) {
    Service.EmailService.sendUserVerifyMail({
      id: req.user._id,
      email: req.body.email
    }, otp);
  }
  await Model.User.findOneAndUpdate({ _id: req.user.id }, req.body);
  UserData = await Model.User.findOne({
    _id: req.user._id
  });
  return res.ok(true, Constant.updateUser, UserData);

};

async function getProfile(req, res) {
  let data = { totalBookingCount: 0 };
  data = await Model.User.findOne({ _id: req.user._id }).populate({ path: 'userCard' });
  let criteria = {
    userId: mongoose.Types.ObjectId(req.user._id),
    isEventBooking: false
  }
  let totalBookingCount = await Model.Booking.countDocuments(criteria);
  data = JSON.parse(JSON.stringify(data));
  data.totalBookingCount = totalBookingCount || 0;
  return res.ok(true, null, data);
};

async function changePassword(req, res) {
  if (Validation.isUserValidate.isChangePasswordValid(req.body)) return res.ok(false, Constant.required, null);
  const user = await Model.User.findOne({
    _id: req.user._id
  });
  if (!user) return res.ok(false, Constant.userNotFound, null);
  user.comparePassword(req.body.oldPassword, match => {
    if (!match) return res.ok(false, 'You have entered an wrong old password.', null);
    user.updatePassword(req.body.newPassword).then(hash => {

      Model.User.updateOne({
        _id: user._id
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

async function updateUserProfile(req, res) {
  if (req.file) req.body.image = `${Constant.userImage}/${req.file.filename}`;
  try {
    let UserData = await Model.User.findOne({
      _id: req.user._id
    });

    req.body.profileStatus = "COMPLETED";
    if (req.body.email) {
      const emailUser = await Model.User.findOne({
        email: req.body.email,
        _id: { $nin: [req.user._id] },
        isDeleted: false
      });
      if (emailUser) {
        return res.ok(false, Constant.emailAlreadyExist, null);
      }
    }
    if (req.body.phone) {
      const phoneUser = await Model.User.findOne({
        phone: req.body.phone,
        _id: { $nin: [req.user._id] }, isDeleted: false
      });
      if (phoneUser) {
        return res.ok(false, Constant.phoneAlreadyExist, null);
      }
    }
    if (req.body.email) {
      req.body.isVerified = false;
    }
    if (req.body.phone) {
      req.body.isPhoneVerified = false;
    }
    if (req.body.singUpType != undefined) {
      req.body.singUpType = req.body.singUpType == 'MOBILE' ? 'MOBILE' : 'EMAIL';
    }
    const otp = await Service.OtpService.issue();
    if (req.body.email) {
      Service.EmailService.sendUserVerifyMail({
        id: req.user._id,
        email: req.body.email
      }, otp);
    }
    await Model.User.findOneAndUpdate({
      _id: req.user._id
    }, req.body, {
      new: true
    });
    let user = await Model.User.findOne({ _id: req.user._id }).populate({ path: 'userCard' });
    const encryptKey = await generateRandomString(5);
    let tokenKey = Service.JwtService.issue({ _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey });
    user.set('token', 'SEC ' + tokenKey, { strict: false });
    await Model.User.findOneAndUpdate({ _id: req.user._id }, { $set: { token: tokenKey || null } })
    return res.ok(true, null, user);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function updateUserFullProfile(req, res) {
  if (req.file) req.body.image = `${Constant.userImage}/${req.file.filename}`;
  try {
    let UserData = await Model.User.findOne({
      _id: req.user._id
    });

    req.body.profileStatus = "COMPLETED";
    if (req.body.email) {
      const emailUser = await Model.User.findOne({
        email: req.body.email,
        _id: { $nin: [req.user._id] },
        isDeleted: false
      });
      if (emailUser) {
        return res.ok(false, Constant.emailAlreadyExist, null);
      }
    }
    if (req.body.phone) {
      const phoneUser = await Model.User.findOne({
        phone: req.body.phone,
        _id: { $nin: [req.user._id] }, isDeleted: false
      });
      if (phoneUser) {
        return res.ok(false, Constant.phoneAlreadyExist, null);
      }
    }
    if (req.body.email) {
      req.body.isVerified = false;
    }
    if (req.body.phone) {
      req.body.isPhoneVerified = false;
    }
    if (req.body.singUpType != undefined) {
      req.body.singUpType = req.body.singUpType == 'MOBILE' ? 'MOBILE' : 'EMAIL';
    }
    const otp = await Service.OtpService.issue();
    if (req.body.email) {
      Service.EmailService.sendUserVerifyMail({
        id: req.user._id,
        email: req.body.email
      }, otp);
    }
    await Model.User.findOneAndUpdate({
      _id: req.user._id
    }, req.body, {
      new: true
    });
    let user = await Model.User.findOne({
      _id: req.user._id
    });
    const encryptKey = await generateRandomString(5);
    let tokenKey = Service.JwtService.issue({ _id: Service.HashService.encrypt(user._id), encryptKey: encryptKey });
    user.set('token', 'SEC ' + tokenKey, { strict: false });
    await Model.User.findOneAndUpdate({ _id: req.user._id }, { $set: { token: tokenKey || null } })
    return res.ok(true, null, user);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function uploadFile(req, res) {
  try {
    let data = '';
    if (req.file && req.file.filename) {
      data = `${Constant.userImage}/${req.file.filename}`;
    }
    return res.ok(true, null, data);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getVehicleType(req, res) {
  try {
    let dataToSend = {};
    const query = { isDeleted: false, isBlocked: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = req.query.limit || 1000;
    const skip = req.query.skip || 0;
    const vehicleTypeCount = await Model.VehicleType.countDocuments(query);
    dataToSend.vehicleTypeCount = vehicleTypeCount || 0;
    const vehicleTypeData = await Model.VehicleType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 })
    dataToSend.vehicleTypeData = vehicleTypeData || [];
    const transmissionTypeCount = await Model.TransmissionType.countDocuments(query);
    dataToSend.transmissionTypeCount = transmissionTypeCount || 0;
    const trannsmissionTypeData = await Model.TransmissionType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 })
    dataToSend.trannsmissionTypeData = trannsmissionTypeData || [];
    const stateCount = await Model.State.countDocuments(query);
    dataToSend.stateCount = stateCount || 0;
    const stateData = await Model.State.find(query).limit(limit).skip(skip).sort({ createdAt: -1 })
    dataToSend.stateData = stateData || [];
    dataToSend.vehicleColors = Constant.vehicleColors || [];
    const notes = await Model.Admin.findOne({ isDeleted: false, isBlocked: false }, {
      notesOfTripType: 1,
      notesOfPassengers: 1
    });
    dataToSend.notes = notes || {};
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getServiceType(req, res) {
  try {
    const query = { isDeleted: false, isBlocked: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;
    const count = await Model.ServiceType.countDocuments(query);
    return res.success(true, null, await Model.ServiceType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function addVehicle(req, res) {
  try {

    if (Validation.isUserValidate.isaddVehicleValid(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.vehicleName === '') {
      return res.ok(true, 'vehicle name should not be null.', null);
    } else {
      req.body.userId = req.user._id;
      let coordinates = [];
      let location = {};
      if (req.body.latitude && req.body.longitude) {
        coordinates.push(Number(req.body.longitude))
        coordinates.push(Number(req.body.latitude))
        location.type = "Point";
        location.coordinates = coordinates
      }
      req.body.location = location;
      if (req.body.insuranceDocuments) {
        req.body.insuranceDocuments = req.body.insuranceDocuments;
        req.body.isInsuranceDocumentsUploaded = true;
      }
      let vehicleData = await new Model.Vehicle(req.body).save();
      vehicleData = await Model.Vehicle.findOne({ _id: vehicleData._id });
      return res.ok(true, null, vehicleData);
    }
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function editVehicle(req, res) {
  try {
    if (Validation.isUserValidate.isDeleteVehicleValid(req.body)) return res.ok(false, Constant.required, null);
    let vehicleData = await Model.Vehicle.findOneAndUpdate({ _id: req.body._id }, req.body);
    vehicleData = await Model.Vehicle.findOne({ _id: req.body._id });
    return res.ok(true, null, vehicleData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function deleteVehicle(req, res) {
  try {

    if (Validation.isUserValidate.isDeleteVehicleValid(req.body)) return res.ok(false, Constant.required, null);
    await Model.Vehicle.findOneAndUpdate({ _id: req.body._id }, { $set: { isDeleted: true } });
    return res.ok(true, null, {});
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function getVehicles(req, res) {
  try {
    const query = { isDeleted: false };

    if (req.query._id && (req.query._id).length == 24) query._id = req.query._id;
    query.userId = req.user._id;
    let limit = parseInt(req.query.limit || 10);
    let skip = parseInt(req.query.skip || 0);
    const count = await Model.Vehicle.countDocuments(query);
    let pipeline = [];
    if (req.query._id && (req.query._id).length == 24) {
      pipeline.push({ $match: { _id: mongoose.Types.ObjectId(req.query._id) } })
    }
    pipeline.push(
      { $match: { userId: mongoose.Types.ObjectId(req.user._id) } },
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
SCHEDULED BOOKING API'S
*/
// async function createScheduledBooking(req, res) {
//   try {
//     req.body.userId = req.user._id;
//     let promoCodeData = null;
//     let isPromoApply = false
//     let promoUserdId = ''
//     let promoAmount = 0;
//     let isSharePercentageDriverCoDriver = false;
//     if (Validation.isUserValidate.isValidCreateBooking(req.body))
//       return res.ok(false, Constant.required, null);
//     if (req.body.totalDistance) {
//       req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1609;
//     } else {
//       req.body.totalDistanceInKm = 0;
//     }
//     if (!req.body.isSheduledBooking) {
//       req.body.bookingDate = moment().utc();
//     }
//     if (req.body.isSheduledBooking &&
//       req.body.bookingDate && (new Date(req.body.bookingDate) == "Invalid Date"
//         || moment().diff(req.body.bookingDate, 'seconds') > 0)) {
//       return res.ok(false, Constant.backDateNotAllowed, {});
//     }
//     // req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone || 330, 'm')
//     const userData = await Model.User.findOne({ _id: req.user._id });
//     if (!userData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
//     if (!adminData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     const serviceData = await Model.ServiceType.findOne({
//       _id: req.body.seviceTypeId,
//       isDeleted: false,
//       isBlocked: false
//     });
//     if (!serviceData) {
//       return res.ok(false, Constant.serviceTypeNotFound, null);
//     }
//     let vehicleData = await Model.Vehicle.findOne({
//       _id: req.body.vehicleId,
//       // userId: req.user._id,
//       isDeleted: false, isBlocked: false
//     });
//     if (!vehicleData) {
//       return res.ok(false, Constant.vehicleNotFound, null);
//     }
//     if (!userData.isReferralCodeUsed && userData.referralUserCode) {
//       let referralCodeData = await Model.User.findOne({
//         _id: { $nin: [mongoose.Types.ObjectId(req.user._id)] },
//         referralCode: userData.referralUserCode
//       });
//       if (referralCodeData) {
//         // let referralCodeUsedData=await Model.Booking.findOne({_id:req.user._id,
//         //     referralCode:req.body.referralCode});
//         // if(referralCodeUsedData){
//         //     return res.ok(false, Constant.referralCodeUsed, null);
//         // }else{
//         req.body.referralUserId = referralCodeData._id;
//         req.body.referralCode = userData.referralUserCode;
//         req.body.isReferralCodeUsed = true;
//         //}
//       } else {
//         return res.ok(false, Constant.invalidReferral, null);
//       }
//     }
//     if (req.body.promoCode) {
//       promoCodeData = await Model.PromoCode.findOne({
//         promoCode: req.body.promoCode,
//         isBlocked: false, isDeleted: false
//       });
//       if (promoCodeData) {
//         if (promoCodeData.noOfPromoUsers && promoCodeData.individualUserPromoAttempt) {
//           const promoCountUsed = await Model.Booking.countDocuments({
//             promoId: mongoose.Types.ObjectId(promoCodeData._id)
//           });
//           if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
//             return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
//           }
//           const promoCountUsedByUser = await Model.Booking.countDocuments({
//             userId: mongoose.Types.ObjectId(req.user._id),
//             promoId: mongoose.Types.ObjectId(promoCodeData._id)
//           });
//           if (promoCountUsedByUser >= promoCodeData.individualUserPromoAttempt) {
//             return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
//           }
//         }
//         if (promoCodeData.isExpireDateAdded && promoCodeData.expireDate) {
//           if (moment(promoCodeData.expireDate).diff(moment().utc()) < 1) {
//             return res.ok(false, Constant.promoCodeExpired, null);
//           }
//         }
//         req.body.isPromoApply = true;
//         isPromoApply = true
//         promoUserdId = promoCodeData._id
//         req.body.promoId = promoCodeData ? promoCodeData._id : null;
//       } else {
//         return res.ok(false, Constant.inValidPromoCode, null);
//       }
//     }

//     let pickUpCoordinates = [];
//     let pickUpLocation = {};
//     if (req.body.pickUplatitude && req.body.pickUplongitude) {
//       pickUpCoordinates.push(Number(req.body.pickUplongitude))
//       pickUpCoordinates.push(Number(req.body.pickUplatitude))
//       pickUpLocation.type = "Point";
//       pickUpLocation.coordinates = pickUpCoordinates;
//       req.body.pickUpLocation = pickUpLocation;
//     }
//     if (req.body.pickUpAddress) {
//       req.body.pickUpAddress = req.body.pickUpAddress;
//     }
//     let droupUpCoordinates = [];
//     let droupUpLocation = {};
//     if (req.body.dropUplatitude && req.body.dropUplongitude) {
//       droupUpCoordinates.push(Number(req.body.dropUplongitude))
//       droupUpCoordinates.push(Number(req.body.dropUplatitude))
//       droupUpLocation.type = "Point";
//       droupUpLocation.coordinates = droupUpCoordinates;
//       req.body.droupUpLocation = droupUpLocation;
//     }
//     if (req.body.dropUpAddress) {
//       req.body.dropUpAddress = req.body.dropUpAddress;
//     }
//     let droupUpCoordinatesFirst = [];
//     let droupUpLocationFirst = {};
//     if (req.body.dropUplatitudeFirst && req.body.dropUplongitudeFirst) {
//       droupUpCoordinatesFirst.push(Number(req.body.dropUplongitudeFirst))
//       droupUpCoordinatesFirst.push(Number(req.body.dropUplatitudeFirst))
//       droupUpLocationFirst.type = "Point";
//       droupUpLocationFirst.coordinates = droupUpCoordinatesFirst;
//       req.body.droupUpLocationFirst = droupUpLocationFirst;
//     }
//     if (req.body.dropUpAddressFirst) {
//       req.body.dropUpAddressFirst = req.body.dropUpAddressFirst;
//     }
//     let droupUpCoordinateSecond = [];
//     let droupUpLocationSecond = {};
//     if (req.body.dropUplatitudeSecond && req.body.dropUplongitudeSecond) {
//       droupUpCoordinateSecond.push(Number(req.body.dropUplongitudeSecond))
//       droupUpCoordinateSecond.push(Number(req.body.dropUplatitudeSecond))
//       droupUpLocationSecond.type = "Point";
//       droupUpLocationSecond.coordinates = droupUpCoordinateSecond;
//       req.body.droupUpLocationSecond = droupUpLocationSecond;
//     }
//     if (req.body.dropUpAddressSecond) {
//       req.body.dropUpAddressSecond = req.body.dropUpAddressSecond;
//     }
//     let droupUpCoordinateThird = [];
//     let droupUpLocationThird = {};
//     if (req.body.dropUplatitudeThird && req.body.dropUplongitudeThird) {
//       droupUpCoordinateThird.push(Number(req.body.dropUplongitudeThird))
//       droupUpCoordinateThird.push(Number(req.body.dropUplatitudeThird))
//       droupUpLocationThird.type = "Point";
//       droupUpLocationThird.coordinates = droupUpCoordinateThird;
//       req.body.droupUpLocationThird = droupUpLocationThird;
//     }
//     if (req.body.dropUpAddressThird) {
//       req.body.dropUpAddressThird = req.body.dropUpAddressThird;
//     }
//     let droupUpCoordinateFour = [];
//     let droupUpLocationFour = {};
//     if (req.body.dropUplatitudeFour && req.body.dropUplongitudeFour) {
//       droupUpCoordinateFour.push(Number(req.body.dropUplongitudeFour))
//       droupUpCoordinateFour.push(Number(req.body.dropUplatitudeFour))
//       droupUpLocationFour.type = "Point";
//       droupUpLocationFour.coordinates = droupUpCoordinateFour;
//       req.body.droupUpLocationFour = droupUpLocationFour;
//     }
//     if (req.body.dropUpAddressFour) {
//       req.body.dropUpAddressFour = req.body.dropUpAddressFour;
//     }
//     // if (req.body.passengerNo > 0) {
//     // if (req.body.passengerNo === 'YES') {
//     //   req.body.isCoDriverRequired = true;
//     //   req.body.isDriverRequired = true;
//     // } else {
//     //   req.body.isCoDriverRequired = false;
//     //   req.body.isDriverRequired = true;
//     // }
//     switch (req.body.tripType) {
//       case Constant.tripType.roundTrip:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = false;
//         req.body.tripType = Constant.tripType.roundTrip;
//         req.body.isRoundTrip = true;
//         break;
//       case Constant.tripType.singleTrip:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = true;
//         req.body.tripType = Constant.tripType.singleTrip;
//         req.body.isSingleTrip = true;
//         break;
//       default:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = false;
//         req.body.tripType = Constant.tripType.singleTrip;
//         req.body.isSingleTrip = true;
//         break;
//     }
//     switch (req.body.paymentMode) {
//       case Constant.paymentMode.cash:
//         req.body.paymentMode = Constant.paymentMode.cash;
//         req.body.isCashMode = true;
//         break;
//       case Constant.paymentMode.card:
//         req.body.paymentMode = Constant.paymentMode.card;
//         req.body.isCashMode = false;
//         break;
//       case Constant.paymentMode.wallet:
//         req.body.paymentMode = Constant.paymentMode.wallet;
//         req.body.isCashMode = false;
//         break;
//       default:
//         req.body.paymentMode = Constant.paymentMode.cash;
//         req.body.isCashMode = true;
//         break;
//     }

//     // if (req.body.passengerNo > 0) {

//     if (req.body.tripType === Constant.tripType.singleTrip) {
//       req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
//         parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
//         parseFloat(adminData.overflowFee)
//       );
//       /*if (req.body.booKingAmount < adminData.baseFare) {
//         req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
//       }*/
//       req.body.booKingAmount += adminData.baseFare;
//     } else {
//       req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
//       /*if (req.body.booKingAmount < adminData.baseFare) {
//         req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
//       }*/
//       req.body.booKingAmount += adminData.baseFare;
//     }

//     if (req.body.isPromoApply) {
//       if (promoCodeData.isCash) {
//         promoAmount = promoCodeData.cashback;
//       } else {
//         promoAmount = parseFloat((parseFloat(req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
//       }
//       req.body.promoAmount = parseFloat((promoAmount).toFixed(2));
//     }

//     if (userData && userData.pendingAmount) {
//       //promo discount - on app side
//       // req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount - promoAmount);
//       req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount);
//     } else {
//       //promo discount - on app side
//       // req.body.totalAmount = parseFloat(req.body.booKingAmount - promoAmount);
//       req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
//     }
//     // req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
//     req.body.cancelAmount = parseFloat(((req.body.booKingAmount * adminData.cancelAmountInPercentage) / 100).toFixed(2));

//     if (req.body.totalAmount < 0) {
//       req.body.totalAmount = 0;
//     }
//     req.body.actualAmount = req.body.totalAmount;
//     if (req.body.isDriverRequired && req.body.driverId != null &&
//       req.body && req.body.isCoDriverRequired && req.body.coDriverId != null) {
//       isSharePercentageDriverCoDriver = true;
//     }
//     let driverEarningAmount = 0;
//     let driverSharePercentage = adminData.driverSharePercentage || 0;
//     if (isSharePercentageDriverCoDriver) {
//       driverSharePercentage = adminData.coDriverSharePercentage || 0;
//     }
//     driverEarningAmount = parseFloat(((req.body.actualAmount) * driverSharePercentage) / 100).toFixed(2)
//     req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
//     req.body.driverEarningAmount = driverEarningAmount;

//     if (req.body.paymentMode == Constant.paymentMode.wallet &&
//       req.body.totalAmount > userData.walletAmount) {
//       return res.ok(false, Constant.InsufficientAmount, null);
//     }
//     if (req.body.vehicleId && (req.body.vehicleId).length == 24) {
//       if (vehicleData) {
//         req.body.userVehicleId = vehicleData._id;
//         req.body.userVehicleTypeId = vehicleData.vehicleTypeId;
//         req.body.userTransmissionTypeId = vehicleData.transmissionTypeId;
//       }
//     }
//     if (req.body.vehicleId) {
//       delete req.body.vehicleId;
//     }
//     if (req.body.isSheduledBooking) {
//       req.body.isTripAllocated = false;
//     }
//     //if promo apply
//     if (isPromoApply === true) {
//       // payment from wallet while promoapply
//       if (req.body.isWalletUsed && req.body.totalAmount) {
//         req.body.totalAmount;
//         if (req.body.totalAmount >= userData.walletAmount) {
//           req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
//           req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
//         } else {
//           req.body.actualAmount = 0;
//           req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
//         }
//       }

//       req.body.paymentStatus = Constant.paymentStatus.completed;
//       // payment from card while promoapply
//       if (req.body.paymentMode == Constant.paymentMode.card) {
//         if (!req.body.cardId) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let cardData = await Model.Card.findOne({
//           _id: mongoose.Types.ObjectId(req.body.cardId),
//           isDeleted: false, isBlocked: false
//         })
//         if (!cardData) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         const promoCardPayment = parseFloat(req.body.actualAmount - req.body.promoAmount)
//         let paymentObj = {
//           amount: promoCardPayment,
//           stripeCustomerId: cardData.stripeCustomerId,
//           stripePaymentMethod: cardData.stripePaymentMethod,
//           description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
//         }
//         if (promoCardPayment === 0) {
//           // if promoCardPayment = 0
//           //save transaction for tip related
//           const randomStr = await generateRandomString(24)
//           const randomStr2 = await generateRandomString(24)
//           paymentObj.trxId = `pi_${randomStr}`;
//           paymentObj.captureMethod = 'automatic';
//           paymentObj.chargeId = `ch_${randomStr2}`;
//           paymentObj.paymentStatus = Constant.paymentStatus.completed;
//           paymentObj.userId = userData._id;
//           paymentObj.cardId = cardData._id;
//           let transactionData = await Model.Transaction(paymentObj).save();
//           req.body.transactionId = transactionData._id;
//           req.body.trxId = transactionData.trxId;
//           req.body.isPayementOnStrip = true;
//           ///
//           req.body.paymentStatus = Constant.paymentStatus.completed
//         } else {
//           // if promoCardPayment != 0
//           if ((req.body.actualAmount - req.body.promoAmount) > 0) {
//             let paymentData = await chargeStrip(paymentObj)
//             if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
//               paymentObj.trxId = paymentData.data.paymentId;
//               paymentObj.captureMethod = paymentData.data.captureMethod;
//               paymentObj.chargeId = paymentData.data.chargeId;
//               paymentObj.paymentStatus = Constant.paymentStatus.completed;
//               paymentObj.userId = userData._id;
//               paymentObj.cardId = cardData._id;
//               let transactionData = await Model.Transaction(paymentObj).save();
//               req.body.transactionId = transactionData._id;
//               req.body.trxId = transactionData.trxId;
//               req.body.isPayementOnStrip = true;
//             } else {
//               return res.ok(false, Constant.errorInStripCardChargeAmount, null);
//             }
//           }
//         }
//       }

//     } else {
//       // if promo not apply
//       if (req.body.isWalletUsed && req.body.totalAmount) {
//         // payment from wallet while promo not apply
//         if (req.body.totalAmount >= userData.walletAmount) {
//           req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
//           req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
//         } else {
//           req.body.actualAmount = 0;
//           req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
//         }
//       }

//       req.body.paymentStatus = Constant.paymentStatus.completed;
//       // payment from card while promo not apply
//       if (req.body.paymentMode == Constant.paymentMode.card) {
//         if (!req.body.cardId) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let cardData = await Model.Card.findOne({
//           _id: mongoose.Types.ObjectId(req.body.cardId),
//           isDeleted: false, isBlocked: false
//         })
//         if (!cardData) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let paymentObj = {
//           amount: parseFloat(req.body.actualAmount),
//           stripeCustomerId: cardData.stripeCustomerId,
//           stripePaymentMethod: cardData.stripePaymentMethod,
//           description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
//         }
//         if (req.body.actualAmount > 0) {
//           let paymentData = await chargeStrip(paymentObj)
//           if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
//             paymentObj.trxId = paymentData.data.paymentId;
//             paymentObj.captureMethod = paymentData.data.captureMethod;
//             paymentObj.chargeId = paymentData.data.chargeId;
//             paymentObj.paymentStatus = Constant.paymentStatus.completed;
//             paymentObj.userId = userData._id;
//             paymentObj.cardId = cardData._id;
//             let transactionData = await Model.Transaction(paymentObj).save();
//             req.body.transactionId = transactionData._id;
//             req.body.trxId = transactionData.trxId;
//             req.body.isPayementOnStrip = true;
//           } else {
//             return res.ok(false, Constant.errorInStripCardChargeAmount, null);
//           }
//         }
//       }
//     }

//     const bookingData = await new Model.Future(req.body).save();
//     if (req.body.paymentMode == Constant.paymentMode.card && req.body.actualAmount) {
//       await Model.Transaction.update({ _id: mongoose.Types.ObjectId(req.body.transactionId) },
//         {
//           $set: {
//             bookingId: mongoose.Types.ObjectId(bookingData._id)
//           }
//         })
//     }
//     //if promo apply for debit amount from user wallet
//     if (isPromoApply === true) {
//       const promoAmountDic = (bookingData.promoAmount - bookingData.totalAmount).toFixed(2);
//       if (bookingData.paymentMode == Constant.paymentMode.wallet) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: promoAmountDic } });
//       }
//       if (req.body.isWalletUsed) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(bookingData.walletAmount) } });
//       }
//     } else {
//       const promoAmountDic = (bookingData.totalAmount).toFixed(2);
//       if (bookingData.paymentMode == Constant.paymentMode.wallet) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(promoAmountDic) } });
//       }
//       if (req.body.isWalletUsed) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(bookingData.walletAmount) } });
//       }
//     }
//     //ADD PROMO LOGS...
//     if (isPromoApply === true) {
//       //ADD PROMO LOG
//       const promoBody = {
//         bookingId: bookingData._id,
//         promoId: promoUserdId,
//         userId: req.user._id
//       }
//       await PromoLogCreate(promoBody)
//     }

//     if (!userData.isReferralCodeUsed && userData.referralUserCode) {
//       await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//         { $set: { isReferralCodeUsed: true } });
//     }
//     if (req.body.isTripAllocated == false) {
//       let sendUserData = await userDataSend(userData);
//       const sendBookingData = await getCurrentBookingData(bookingData);
//       driverController.availableFreeScheduledDriver(bookingData, sendUserData, {});
//     } 
//     if(!req.body.tripType){
//       driverController.availableFreeScheduledCoDriver(bookingData);
//     }
//     let dataToSendForSchedule = {
//       bookingData: bookingData,
//       adminData: adminData
//     }
//     return res.ok(true, null, bookingData);
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// };

async function createScheduledBooking(req, res) {
  try {
    req.userId = req._id;
    let promoCodeData = null;
    let isPromoApply = false
    let promoUserdId = ''
    let promoAmount = 0;
    let isSharePercentageDriverCoDriver = false;
    if (Validation.isUserValidate.isValidCreateBooking(req.body))
      return res.ok(false, Constant.required, null);
    if (req.totalDistance) {
      req.totalDistanceInKm = parseFloat(req.totalDistance) / 1609;
    } else {
      req.totalDistanceInKm = 0;
    }
    // if (!req.body.isSheduledBooking) {
    //   req.bookingDate = moment().utc();
    // }
    // if (req.isSheduledBooking &&
    //   req.bookingDate && (new Date(req.bookingDate) == "Invalid Date"
    //     || moment().diff(req.bookingDate, 'seconds') > 0)) {
    //   return res.ok(false, Constant.backDateNotAllowed, {});
    // }
    // req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone || 330, 'm')
    const userData = await Model.User.findOne({ _id: req.user._id });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
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
    let vehicleData = await Model.Vehicle.findOne({
      _id: req.body.vehicleId,
      // userId: req.user._id,
      isDeleted: false, isBlocked: false
    });
    if (!vehicleData) {
      return res.ok(false, Constant.vehicleNotFound, null);
    }
    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      let referralCodeData = await Model.User.findOne({
        _id: { $nin: [mongoose.Types.ObjectId(req.user._id)] },
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
            userId: mongoose.Types.ObjectId(req.user._id),
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

    if (req.body.tripType === Constant.tripType.singleTrip) {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
        parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
        parseFloat(adminData.overflowFee)
      );
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
      req.body.booKingAmount += adminData.baseFare;
    } else {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
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

    if (userData && userData.pendingAmount) {
      //promo discount - on app side
      // req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount - promoAmount);
      req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount);
    } else {
      //promo discount - on app side
      // req.body.totalAmount = parseFloat(req.body.booKingAmount - promoAmount);
      req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
    }
    // req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
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
    //if promo apply
    if (isPromoApply === true) {
      // payment from wallet while promoapply
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
      // payment from card while promoapply
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
        const promoCardPayment = parseFloat(req.body.actualAmount - req.body.promoAmount)
        let paymentObj = {
          amount: promoCardPayment,
          stripeCustomerId: cardData.stripeCustomerId,
          stripePaymentMethod: cardData.stripePaymentMethod,
          description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
        }
        if (promoCardPayment === 0) {
          // if promoCardPayment = 0
          //save transaction for tip related
          const randomStr = await generateRandomString(24)
          const randomStr2 = await generateRandomString(24)
          paymentObj.trxId = `pi_${randomStr}`;
          paymentObj.captureMethod = 'automatic';
          paymentObj.chargeId = `ch_${randomStr2}`;
          paymentObj.paymentStatus = Constant.paymentStatus.completed;
          paymentObj.userId = userData._id;
          paymentObj.cardId = cardData._id;
          let transactionData = await Model.Transaction(paymentObj).save();
          req.body.transactionId = transactionData._id;
          req.body.trxId = transactionData.trxId;
          req.body.isPayementOnStrip = true;
          ///
          req.body.paymentStatus = Constant.paymentStatus.completed
        } else {
          // if promoCardPayment != 0
          if ((req.body.actualAmount - req.body.promoAmount) > 0) {
            let paymentData = await chargeStrip(paymentObj)
            if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
              paymentObj.trxId = paymentData.data.paymentId;
              paymentObj.captureMethod = paymentData.data.captureMethod;
              paymentObj.chargeId = paymentData.data.chargeId;
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
      }

    } else {
      // if promo not apply
      if (req.body.isWalletUsed && req.body.totalAmount) {
        // payment from wallet while promo not apply
        if (req.body.totalAmount >= userData.walletAmount) {
          req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
          req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
        } else {
          req.body.actualAmount = 0;
          req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
        }
      }

      req.body.paymentStatus = Constant.paymentStatus.completed;
      // payment from card while promo not apply
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
          amount: parseFloat(req.body.actualAmount),
          stripeCustomerId: cardData.stripeCustomerId,
          stripePaymentMethod: cardData.stripePaymentMethod,
          description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
        }
        if (req.body.actualAmount > 0) {
          let paymentData = await chargeStrip(paymentObj)
          if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
            paymentObj.trxId = paymentData.data.paymentId;
            paymentObj.captureMethod = paymentData.data.captureMethod;
            paymentObj.chargeId = paymentData.data.chargeId;
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
    }
    const bookingData = await new Model.Future(req.body).save();
    if (req.body.paymentMode == Constant.paymentMode.card && req.body.actualAmount) {
      await Model.Transaction.update({ _id: mongoose.Types.ObjectId(req.body.transactionId) },
        {
          $set: {
            bookingId: mongoose.Types.ObjectId(bookingData._id)
          }
        })
    }
    //if promo apply for debit amount from user wallet
    if (isPromoApply === true) {
      const promoAmountDic = (bookingData.promoAmount - bookingData.totalAmount).toFixed(2);
      if (bookingData.paymentMode == Constant.paymentMode.wallet) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: promoAmountDic } });
      }
      if (req.body.isWalletUsed) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(bookingData.walletAmount) } });
      }
    } else {
      const promoAmountDic = (bookingData.totalAmount).toFixed(2);
      if (bookingData.paymentMode == Constant.paymentMode.wallet) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(promoAmountDic) } });
      }
      if (req.body.isWalletUsed) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(bookingData.walletAmount) } });
      }
    }
    //ADD PROMO LOGS...
    if (isPromoApply === true) { 
      //ADD PROMO LOG
      const promoBody = {
        bookingId: bookingData._id,
        promoId: promoUserdId,
        userId: req.user._id
      }
      await PromoLogCreate(promoBody)
    }
    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $set: { isReferralCodeUsed: true } });
    }
    // if (req.body.isTripAllocated) {
      let sendUserData = await userDataSend(userData);
      const sendBookingData = await getCurrentBookingData(bookingData);
      console.log("===========");
      driverController.availableFreeScheduledDriver(bookingData, sendUserData, {});
    // }
    // else if (req.body.isSheduledBooking) {
    //   let sendUserData = await userDataSend(userData);
    //   driverController.availableFreeScheduledDriver(bookingData1, sendUserData, {});
    // }
    let dataToSendForSchedule = {
      bookingData: bookingData,
      adminData: adminData
    }
    //process.emit('scheduleBookingForCancel', dataToSendForSchedule);
    return res.ok(true, null, bookingData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};

async function createBooking(req, res) {
  try {
    req.body.userId = req.user._id;
    let promoCodeData = null;
    let isPromoApply = false
    let promoUserdId = ''
    let promoAmount = 0;
    let isSharePercentageDriverCoDriver = false;

    if (Validation.isUserValidate.isValidCreateBooking(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.totalDistance) {
      req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1609;
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
    if(req.body.isSheduledBooking) 
    {
      const element = req.body.bookingDate;

      const elementa = element.toString();
      scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
      scheduleDate1 = scheduleDate.toString();
      console.log(scheduleDate1);
      const then = moment(scheduleDate1)

      const date = new Date(Date.now());
      const element1 = date.toString();
      const now = moment(element1);
      console.log(element1);
     
      const date1 = new Date(scheduleDate1);
      
      const date2 = new Date(element1);

      function getDifferenceInHours(date1, date2) {
        const diffInMs = Math.abs(date2 - date1);
        return Math.floor(diffInMs / (1000 * 60 * 60));
      }
      if (getDifferenceInHours(date1, date2) > 24) {
        createScheduledBooking(req, res);
        return;
      } 
      else {
         return res.ok(false, 'Scheduled Booking must be at least before 24 hours', {});
      }
    }
    const userData = await Model.User.findOne({ _id: req.user._id });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
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
    let vehicleData = await Model.Vehicle.findOne({
      _id: req.body.vehicleId,
      // userId: req.user._id,
      isDeleted: false, isBlocked: false
    });
    if (!vehicleData) {
      return res.ok(false, Constant.vehicleNotFound, null);
    }
    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      let referralCodeData = await Model.User.findOne({
        _id: { $nin: [mongoose.Types.ObjectId(req.user._id)] },
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
            userId: mongoose.Types.ObjectId(req.user._id),
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

    if (req.body.tripType === Constant.tripType.singleTrip) {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
        parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
        parseFloat(adminData.overflowFee)
      );
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
      req.body.booKingAmount += adminData.baseFare;
    } else {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
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

    if (userData && userData.pendingAmount) {
      //promo discount - on app side
      // req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount - promoAmount);
      req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount);
    } else {
      //promo discount - on app side
      // req.body.totalAmount = parseFloat(req.body.booKingAmount - promoAmount);
      req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
    }
    // req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
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
    console.log(TOTAL);
    if (req.body.paymentMode == Constant.paymentMode.wallet &&
      TOTAL > userData.walletAmount) {
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
    //if promo apply
    if (isPromoApply === true) {
      // payment from wallet while promoapply
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
      // payment from card while promoapply
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
        const promoCardPayment = parseFloat(req.body.actualAmount - req.body.promoAmount)
        let paymentObj = {
          amount: promoCardPayment,
          stripeCustomerId: cardData.stripeCustomerId,
          stripePaymentMethod: cardData.stripePaymentMethod,
          description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
        }
        if (promoCardPayment === 0) {
          // if promoCardPayment = 0
          //save transaction for tip related
          const randomStr = await generateRandomString(24)
          const randomStr2 = await generateRandomString(24)
          paymentObj.trxId = `pi_${randomStr}`;
          paymentObj.captureMethod = 'automatic';
          paymentObj.chargeId = `ch_${randomStr2}`;
          paymentObj.paymentStatus = Constant.paymentStatus.completed;
          paymentObj.userId = userData._id;
          paymentObj.cardId = cardData._id;
          let transactionData = await Model.Transaction(paymentObj).save();
          req.body.transactionId = transactionData._id;
          req.body.trxId = transactionData.trxId;
          req.body.isPayementOnStrip = true;
          ///
          req.body.paymentStatus = Constant.paymentStatus.completed
        } else {
          // if promoCardPayment != 0
          if ((req.body.actualAmount - req.body.promoAmount) > 0) {
            let paymentData = await chargeStrip(paymentObj)
            if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
              paymentObj.trxId = paymentData.data.paymentId;
              paymentObj.captureMethod = paymentData.data.captureMethod;
              paymentObj.chargeId = paymentData.data.chargeId;
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
      }

    } else {
      // if promo not apply
      if (req.body.isWalletUsed && req.body.totalAmount) {
        // payment from wallet while promo not apply
        if (req.body.totalAmount >= userData.walletAmount) {
          req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
          req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
        } else {
          req.body.actualAmount = 0;
          req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
        }
      }

      req.body.paymentStatus = Constant.paymentStatus.completed;
      // payment from card while promo not apply
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
          amount: parseFloat(req.body.actualAmount),
          stripeCustomerId: cardData.stripeCustomerId,
          stripePaymentMethod: cardData.stripePaymentMethod,
          description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
        }
        if (req.body.actualAmount > 0) {
          let paymentData = await chargeStrip(paymentObj)
          if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
            paymentObj.trxId = paymentData.data.paymentId;
            paymentObj.captureMethod = paymentData.data.captureMethod;
            paymentObj.chargeId = paymentData.data.chargeId;
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
    //if promo apply for debit amount from user wallet
    if (isPromoApply === true) {
      const promoAmountDic = (bookingData.promoAmount - bookingData.totalAmount).toFixed(2);
      if (bookingData.paymentMode == Constant.paymentMode.wallet) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: promoAmountDic } });
      }
      if (req.body.isWalletUsed) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(bookingData.walletAmount) } });
      }
    } else {
      const promoAmountDic = (bookingData.totalAmount).toFixed(2);
      if (bookingData.paymentMode == Constant.paymentMode.wallet) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(promoAmountDic) } });
      }
      if (req.body.isWalletUsed) {
        await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
          { $inc: { walletAmount: -(bookingData.walletAmount) } });
      }
    }
    //ADD PROMO LOGS...
    if (isPromoApply === true) {
      //ADD PROMO LOG
      const promoBody = {
        bookingId: bookingData._id,
        promoId: promoUserdId,
        userId: req.user._id
      }
      await PromoLogCreate(promoBody)
    }

    if (!userData.isReferralCodeUsed && userData.referralUserCode) {
      await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
        { $set: { isReferralCodeUsed: true } });
    }
    // if (req.body.isTripAllocated) {
      let sendUserData = await userDataSend(userData);
      const sendBookingData = await getCurrentBookingData(bookingData);
      driverController.availableFreeDriver(sendBookingData, sendUserData, {});
    // }
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


// BOOKING API'S

// async function createBooking(req, res) {
//   try {
//     req.body.userId = req.user._id;
//     let promoCodeData = null;
//     let isPromoApply = false
//     let promoUserdId = ''
//     let promoAmount = 0;
//     let isSharePercentageDriverCoDriver = false;

//     if (Validation.isUserValidate.isValidCreateBooking(req.body))
//       return res.ok(false, Constant.required, null);
//     if (req.body.totalDistance) {
//       req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1609;
//     } else {
//       req.body.totalDistanceInKm = 0;
//     }
//     if (!req.body.isSheduledBooking) {
//       req.body.bookingDate = moment().utc();
//     }
//     if (req.body.isSheduledBooking &&
//       req.body.bookingDate && (new Date(req.body.bookingDate) == "Invalid Date"
//         || moment().diff(req.body.bookingDate, 'seconds') > 0)) {
//       return res.ok(false, Constant.backDateNotAllowed, {});
//     }
//     // req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone || 330, 'm')
//     const userData = await Model.User.findOne({ _id: req.user._id });
//     if (!userData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
//     if (!adminData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     const serviceData = await Model.ServiceType.findOne({
//       _id: req.body.seviceTypeId,
//       isDeleted: false,
//       isBlocked: false
//     });
//     if (!serviceData) {
//       return res.ok(false, Constant.serviceTypeNotFound, null);
//     }
//     let vehicleData = await Model.Vehicle.findOne({
//       _id: req.body.vehicleId,
//       // userId: req.user._id,
//       isDeleted: false, isBlocked: false
//     });
//     if (!vehicleData) {
//       return res.ok(false, Constant.vehicleNotFound, null);
//     }
//     if (!userData.isReferralCodeUsed && userData.referralUserCode) {
//       let referralCodeData = await Model.User.findOne({
//         _id: { $nin: [mongoose.Types.ObjectId(req.user._id)] },
//         referralCode: userData.referralUserCode
//       });
//       if (referralCodeData) {
//         // let referralCodeUsedData=await Model.Booking.findOne({_id:req.user._id,
//         //     referralCode:req.body.referralCode});
//         // if(referralCodeUsedData){
//         //     return res.ok(false, Constant.referralCodeUsed, null);
//         // }else{
//         req.body.referralUserId = referralCodeData._id;
//         req.body.referralCode = userData.referralUserCode;
//         req.body.isReferralCodeUsed = true;
//         //}
//       } else {
//         return res.ok(false, Constant.invalidReferral, null);
//       }
//     }
//     if (req.body.promoCode) {
//       promoCodeData = await Model.PromoCode.findOne({
//         promoCode: req.body.promoCode,
//         isBlocked: false, isDeleted: false
//       });
//       if (promoCodeData) {
//         if (promoCodeData.noOfPromoUsers && promoCodeData.individualUserPromoAttempt) {
//           const promoCountUsed = await Model.Booking.countDocuments({
//             promoId: mongoose.Types.ObjectId(promoCodeData._id)
//           });
//           if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
//             return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
//           }
//           const promoCountUsedByUser = await Model.Booking.countDocuments({
//             userId: mongoose.Types.ObjectId(req.user._id),
//             promoId: mongoose.Types.ObjectId(promoCodeData._id)
//           });
//           if (promoCountUsedByUser >= promoCodeData.individualUserPromoAttempt) {
//             return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
//           }
//         }
//         if (promoCodeData.isExpireDateAdded && promoCodeData.expireDate) {
//           if (moment(promoCodeData.expireDate).diff(moment().utc()) < 1) {
//             return res.ok(false, Constant.promoCodeExpired, null);
//           }
//         }
//         req.body.isPromoApply = true;
//         isPromoApply = true
//         promoUserdId = promoCodeData._id
//         req.body.promoId = promoCodeData ? promoCodeData._id : null;
//       } else {
//         return res.ok(false, Constant.inValidPromoCode, null);
//       }
//     }

//     let pickUpCoordinates = [];
//     let pickUpLocation = {};
//     if (req.body.pickUplatitude && req.body.pickUplongitude) {
//       pickUpCoordinates.push(Number(req.body.pickUplongitude))
//       pickUpCoordinates.push(Number(req.body.pickUplatitude))
//       pickUpLocation.type = "Point";
//       pickUpLocation.coordinates = pickUpCoordinates;
//       req.body.pickUpLocation = pickUpLocation;
//     }
//     if (req.body.pickUpAddress) {
//       req.body.pickUpAddress = req.body.pickUpAddress;
//     }
//     let droupUpCoordinates = [];
//     let droupUpLocation = {};
//     if (req.body.dropUplatitude && req.body.dropUplongitude) {
//       droupUpCoordinates.push(Number(req.body.dropUplongitude))
//       droupUpCoordinates.push(Number(req.body.dropUplatitude))
//       droupUpLocation.type = "Point";
//       droupUpLocation.coordinates = droupUpCoordinates;
//       req.body.droupUpLocation = droupUpLocation;
//     }
//     if (req.body.dropUpAddress) {
//       req.body.dropUpAddress = req.body.dropUpAddress;
//     }
//     let droupUpCoordinatesFirst = [];
//     let droupUpLocationFirst = {};
//     if (req.body.dropUplatitudeFirst && req.body.dropUplongitudeFirst) {
//       droupUpCoordinatesFirst.push(Number(req.body.dropUplongitudeFirst))
//       droupUpCoordinatesFirst.push(Number(req.body.dropUplatitudeFirst))
//       droupUpLocationFirst.type = "Point";
//       droupUpLocationFirst.coordinates = droupUpCoordinatesFirst;
//       req.body.droupUpLocationFirst = droupUpLocationFirst;
//     }
//     if (req.body.dropUpAddressFirst) {
//       req.body.dropUpAddressFirst = req.body.dropUpAddressFirst;
//     }
//     let droupUpCoordinateSecond = [];
//     let droupUpLocationSecond = {};
//     if (req.body.dropUplatitudeSecond && req.body.dropUplongitudeSecond) {
//       droupUpCoordinateSecond.push(Number(req.body.dropUplongitudeSecond))
//       droupUpCoordinateSecond.push(Number(req.body.dropUplatitudeSecond))
//       droupUpLocationSecond.type = "Point";
//       droupUpLocationSecond.coordinates = droupUpCoordinateSecond;
//       req.body.droupUpLocationSecond = droupUpLocationSecond;
//     }
//     if (req.body.dropUpAddressSecond) {
//       req.body.dropUpAddressSecond = req.body.dropUpAddressSecond;
//     }
//     let droupUpCoordinateThird = [];
//     let droupUpLocationThird = {};
//     if (req.body.dropUplatitudeThird && req.body.dropUplongitudeThird) {
//       droupUpCoordinateThird.push(Number(req.body.dropUplongitudeThird))
//       droupUpCoordinateThird.push(Number(req.body.dropUplatitudeThird))
//       droupUpLocationThird.type = "Point";
//       droupUpLocationThird.coordinates = droupUpCoordinateThird;
//       req.body.droupUpLocationThird = droupUpLocationThird;
//     }
//     if (req.body.dropUpAddressThird) {
//       req.body.dropUpAddressThird = req.body.dropUpAddressThird;
//     }
//     let droupUpCoordinateFour = [];
//     let droupUpLocationFour = {};
//     if (req.body.dropUplatitudeFour && req.body.dropUplongitudeFour) {
//       droupUpCoordinateFour.push(Number(req.body.dropUplongitudeFour))
//       droupUpCoordinateFour.push(Number(req.body.dropUplatitudeFour))
//       droupUpLocationFour.type = "Point";
//       droupUpLocationFour.coordinates = droupUpCoordinateFour;
//       req.body.droupUpLocationFour = droupUpLocationFour;
//     }
//     if (req.body.dropUpAddressFour) {
//       req.body.dropUpAddressFour = req.body.dropUpAddressFour;
//     }
//     // if (req.body.passengerNo > 0) {
//     // if (req.body.passengerNo === 'YES') {
//     //   req.body.isCoDriverRequired = true;
//     //   req.body.isDriverRequired = true;
//     // } else {
//     //   req.body.isCoDriverRequired = false;
//     //   req.body.isDriverRequired = true;
//     // }
//     switch (req.body.tripType) {
//       case Constant.tripType.roundTrip:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = false;
//         req.body.tripType = Constant.tripType.roundTrip;
//         req.body.isRoundTrip = true;
//         break;
//       case Constant.tripType.singleTrip:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = true;
//         req.body.tripType = Constant.tripType.singleTrip;
//         req.body.isSingleTrip = true;
//         break;
//       default:
//         req.body.isDriverRequired = true;
//         req.body.isCoDriverRequired = false;
//         req.body.tripType = Constant.tripType.singleTrip;
//         req.body.isSingleTrip = true;
//         break;
//     }
//     switch (req.body.paymentMode) {
//       case Constant.paymentMode.cash:
//         req.body.paymentMode = Constant.paymentMode.cash;
//         req.body.isCashMode = true;
//         break;
//       case Constant.paymentMode.card:
//         req.body.paymentMode = Constant.paymentMode.card;
//         req.body.isCashMode = false;
//         break;
//       case Constant.paymentMode.wallet:
//         req.body.paymentMode = Constant.paymentMode.wallet;
//         req.body.isCashMode = false;
//         break;
//       default:
//         req.body.paymentMode = Constant.paymentMode.cash;
//         req.body.isCashMode = true;
//         break;
//     }

//     // if (req.body.passengerNo > 0) {

//     if (req.body.tripType === Constant.tripType.singleTrip) {
//       req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
//         parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
//         parseFloat(adminData.overflowFee)
//       );
//       /*if (req.body.booKingAmount < adminData.baseFare) {
//         req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
//       }*/
//       req.body.booKingAmount += adminData.baseFare;
//     } else {
//       req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
//       /*if (req.body.booKingAmount < adminData.baseFare) {
//         req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
//       }*/
//       req.body.booKingAmount += adminData.baseFare;
//     }

//     if (req.body.isPromoApply) {
//       if (promoCodeData.isCash) {
//         promoAmount = promoCodeData.cashback;
//       } else {
//         promoAmount = parseFloat((parseFloat(req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
//       }
//       req.body.promoAmount = parseFloat((promoAmount).toFixed(2));
//     }

//     if (userData && userData.pendingAmount) {
//       //promo discount - on app side
//       // req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount - promoAmount);
//       req.body.totalAmount = parseFloat(req.body.booKingAmount + userData.pendingAmount);
//     } else {
//       //promo discount - on app side
//       // req.body.totalAmount = parseFloat(req.body.booKingAmount - promoAmount);
//       req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
//     }
//     // req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
//     req.body.cancelAmount = parseFloat(((req.body.booKingAmount * adminData.cancelAmountInPercentage) / 100).toFixed(2));

//     if (req.body.totalAmount < 0) {
//       req.body.totalAmount = 0;
//     }
//     req.body.actualAmount = req.body.totalAmount;
//     if (req.body.isDriverRequired && req.body.driverId != null &&
//       req.body && req.body.isCoDriverRequired && req.body.coDriverId != null) {
//       isSharePercentageDriverCoDriver = true;
//     }
//     let driverEarningAmount = 0;
//     let driverSharePercentage = adminData.driverSharePercentage || 0;
//     if (isSharePercentageDriverCoDriver) {
//       driverSharePercentage = adminData.coDriverSharePercentage || 0;
//     }
//     driverEarningAmount = parseFloat(((req.body.actualAmount) * driverSharePercentage) / 100).toFixed(2)
//     req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
//     req.body.driverEarningAmount = driverEarningAmount;

//     if (req.body.paymentMode == Constant.paymentMode.wallet &&
//       req.body.totalAmount > userData.walletAmount) {
//       return res.ok(false, Constant.InsufficientAmount, null);
//     }
//     if (req.body.vehicleId && (req.body.vehicleId).length == 24) {
//       if (vehicleData) {
//         req.body.userVehicleId = vehicleData._id;
//         req.body.userVehicleTypeId = vehicleData.vehicleTypeId;
//         req.body.userTransmissionTypeId = vehicleData.transmissionTypeId;
//       }
//     }
//     if (req.body.vehicleId) {
//       delete req.body.vehicleId;
//     }
//     if (req.body.isSheduledBooking) {
//       req.body.isTripAllocated = false;
//     }
//     //if promo apply
//     if (isPromoApply === true) {
//       // payment from wallet while promoapply
//       if (req.body.isWalletUsed && req.body.totalAmount) {
//         req.body.totalAmount;
//         if (req.body.totalAmount >= userData.walletAmount) {
//           req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
//           req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
//         } else {
//           req.body.actualAmount = 0;
//           req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
//         }
//       }

//       req.body.paymentStatus = Constant.paymentStatus.completed;
//       // payment from card while promoapply
//       if (req.body.paymentMode == Constant.paymentMode.card) {
//         if (!req.body.cardId) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let cardData = await Model.Card.findOne({
//           _id: mongoose.Types.ObjectId(req.body.cardId),
//           isDeleted: false, isBlocked: false
//         })
//         if (!cardData) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         const promoCardPayment = parseFloat(req.body.actualAmount - req.body.promoAmount)
//         let paymentObj = {
//           amount: promoCardPayment,
//           stripeCustomerId: cardData.stripeCustomerId,
//           stripePaymentMethod: cardData.stripePaymentMethod,
//           description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
//         }
//         if (promoCardPayment === 0) {
//           // if promoCardPayment = 0
//           //save transaction for tip related
//           const randomStr = await generateRandomString(24)
//           const randomStr2 = await generateRandomString(24)
//           paymentObj.trxId = `pi_${randomStr}`;
//           paymentObj.captureMethod = 'automatic';
//           paymentObj.chargeId = `ch_${randomStr2}`;
//           paymentObj.paymentStatus = Constant.paymentStatus.completed;
//           paymentObj.userId = userData._id;
//           paymentObj.cardId = cardData._id;
//           let transactionData = await Model.Transaction(paymentObj).save();
//           req.body.transactionId = transactionData._id;
//           req.body.trxId = transactionData.trxId;
//           req.body.isPayementOnStrip = true;
//           ///
//           req.body.paymentStatus = Constant.paymentStatus.completed
//         } else {
//           // if promoCardPayment != 0
//           if ((req.body.actualAmount - req.body.promoAmount) > 0) {
//             let paymentData = await chargeStrip(paymentObj)
//             if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
//               paymentObj.trxId = paymentData.data.paymentId;
//               paymentObj.captureMethod = paymentData.data.captureMethod;
//               paymentObj.chargeId = paymentData.data.chargeId;
//               paymentObj.paymentStatus = Constant.paymentStatus.completed;
//               paymentObj.userId = userData._id;
//               paymentObj.cardId = cardData._id;
//               let transactionData = await Model.Transaction(paymentObj).save();
//               req.body.transactionId = transactionData._id;
//               req.body.trxId = transactionData.trxId;
//               req.body.isPayementOnStrip = true;
//             } else {
//               return res.ok(false, Constant.errorInStripCardChargeAmount, null);
//             }
//           }
//         }
//       }

//     } else {
//       // if promo not apply
//       if (req.body.isWalletUsed && req.body.totalAmount) {
//         // payment from wallet while promo not apply
//         if (req.body.totalAmount >= userData.walletAmount) {
//           req.body.actualAmount = parseFloat((req.body.totalAmount - userData.walletAmount).toFixed(2));
//           req.body.walletAmount = parseFloat((userData.walletAmount).toFixed(2));
//         } else {
//           req.body.actualAmount = 0;
//           req.body.walletAmount = parseFloat((req.body.totalAmount).toFixed(2));
//         }
//       }

//       req.body.paymentStatus = Constant.paymentStatus.completed;
//       // payment from card while promo not apply
//       if (req.body.paymentMode == Constant.paymentMode.card) {
//         if (!req.body.cardId) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let cardData = await Model.Card.findOne({
//           _id: mongoose.Types.ObjectId(req.body.cardId),
//           isDeleted: false, isBlocked: false
//         })
//         if (!cardData) {
//           return res.ok(false, Constant.invalidStripCard, null);
//         }
//         let paymentObj = {
//           amount: parseFloat(req.body.actualAmount),
//           stripeCustomerId: cardData.stripeCustomerId,
//           stripePaymentMethod: cardData.stripePaymentMethod,
//           description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`
//         }
//         if (req.body.actualAmount > 0) {
//           let paymentData = await chargeStrip(paymentObj)
//           if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
//             paymentObj.trxId = paymentData.data.paymentId;
//             paymentObj.captureMethod = paymentData.data.captureMethod;
//             paymentObj.chargeId = paymentData.data.chargeId;
//             paymentObj.paymentStatus = Constant.paymentStatus.completed;
//             paymentObj.userId = userData._id;
//             paymentObj.cardId = cardData._id;
//             let transactionData = await Model.Transaction(paymentObj).save();
//             req.body.transactionId = transactionData._id;
//             req.body.trxId = transactionData.trxId;
//             req.body.isPayementOnStrip = true;
//           } else {
//             return res.ok(false, Constant.errorInStripCardChargeAmount, null);
//           }
//         }
//       }
//     }

//     const bookingData = await new Model.Booking(req.body).save();
//     if (req.body.paymentMode == Constant.paymentMode.card && req.body.actualAmount) {
//       await Model.Transaction.update({ _id: mongoose.Types.ObjectId(req.body.transactionId) },
//         {
//           $set: {
//             bookingId: mongoose.Types.ObjectId(bookingData._id)
//           }
//         })
//     }
//     //if promo apply for debit amount from user wallet
//     if (isPromoApply === true) {
//       const promoAmountDic = (bookingData.promoAmount - bookingData.totalAmount).toFixed(2);
//       if (bookingData.paymentMode == Constant.paymentMode.wallet) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: promoAmountDic } });
//       }
//       if (req.body.isWalletUsed) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(bookingData.walletAmount) } });
//       }
//     } else {
//       const promoAmountDic = (bookingData.totalAmount).toFixed(2);
//       if (bookingData.paymentMode == Constant.paymentMode.wallet) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(promoAmountDic) } });
//       }
//       if (req.body.isWalletUsed) {
//         await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//           { $inc: { walletAmount: -(bookingData.walletAmount) } });
//       }
//     }
//     //ADD PROMO LOGS...
//     if (isPromoApply === true) {
//       //ADD PROMO LOG
//       const promoBody = {
//         bookingId: bookingData._id,
//         promoId: promoUserdId,
//         userId: req.user._id
//       }
//       await PromoLogCreate(promoBody)
//     }

//     if (!userData.isReferralCodeUsed && userData.referralUserCode) {
//       await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
//         { $set: { isReferralCodeUsed: true } });
//     }
//     if (req.body.isTripAllocated) {
//       let sendUserData = await userDataSend(userData);
//       const sendBookingData = await getCurrentBookingData(bookingData);
//       driverController.availableFreeDriver(sendBookingData, sendUserData, {});
//     }
//     // else if (req.body.isSheduledBooking) {
//     //   process.emit('scheduleBooking', bookingData);
//     // }
//     let dataToSendForSchedule = {
//       bookingData: bookingData,
//       adminData: adminData
//     }
//     //process.emit('scheduleBookingForCancel', dataToSendForSchedule);
//     return res.ok(true, null, bookingData);
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// };

async function createBookingPaymentCheck(req, res) {
  try {
    req.body.userId = req.user._id;
    let promoCodeData = null;
    let promoAmount = 0;
    if (Validation.isUserValidate.isValidCreateBookingCheck(req.body))
      return res.ok(false, Constant.required, null);
    if (req.body.totalDistance) {
      req.body.totalDistanceInKm = parseFloat(req.body.totalDistance) / 1609;
    } else {
      req.body.totalDistanceInKm = 0;
    }
    const userData = await Model.User.findOne({ _id: req.user._id });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
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
    let vehicleData = await Model.Vehicle.findOne({
      _id: req.body.vehicleId,
      // userId: req.user._id,
      isDeleted: false, isBlocked: false
    });
    if (!vehicleData) {
      return res.ok(false, Constant.vehicleNotFound, null);
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
            userId: mongoose.Types.ObjectId(req.user._id),
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
      droupUpCoordinates.push(Number(req.body.dropUplongitude))
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
    //Need to change here
    // if (req.body.passengerNo > 0) {
    if (req.body.passengerNo === 'YES') {
      req.body.isCoDriverRequired = true;
      req.body.isDriverRequired = true;
    } else {
      req.body.isCoDriverRequired = false;
      req.body.isDriverRequired = true;
    }
    switch (req.body.tripType) {
      case Constant.tripType.roundTrip:
        req.body.tripType = Constant.tripType.roundTrip;
        req.body.isRoundTrip = true;
        break;
      case Constant.tripType.singleTrip:
        req.body.tripType = Constant.tripType.singleTrip;
        req.body.isSingleTrip = true;
        break;
      default:
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

    //Need to change here

    if (req.body.tripType === Constant.tripType.singleTrip) {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
        parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2) +
        parseFloat(adminData.overflowFee)
      );
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
      req.body.booKingAmount += adminData.baseFare;
    } else {
      req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
      /*if (req.body.booKingAmount < adminData.baseFare) {
        req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.mileFee)) + (adminData.baseFare)).toFixed(2)
      }*/
      req.body.booKingAmount += adminData.baseFare;
    }
    // if (req.body.passengerNo === 'YES') {
    //   req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.driverPerKmCharge || 0)) +
    //     parseFloat((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
    //   if (req.body.booKingAmount < adminData.baseFare) {
    //     req.body.booKingAmount = parseFloat((adminData.baseFare || 0).toFixed(2));
    //   }
    // } else {
    //   req.body.booKingAmount = parseFloat(((req.body.totalDistanceInKm) * (adminData.coDriverPerKmCharge || 0)).toFixed(2));
    //   if (req.body.booKingAmount < adminData.baseFare) {
    //     req.body.booKingAmount = parseFloat((adminData.baseFare || 0).toFixed(2));
    //   }
    // }

    if (req.body.isPromoApply) {
      if (promoCodeData.isCash) {
        promoAmount = promoCodeData.cashback;
      } else {
        promoAmount = parseFloat(((req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
      }
      req.body.promoAmount = promoAmount;
    }

    if (userData && userData.pendingAmount) {
      req.body.totalAmount = parseFloat((req.body.booKingAmount + userData.pendingAmount - promoAmount).toFixed(2));
    } else {
      req.body.totalAmount = parseFloat((req.body.booKingAmount - promoAmount).toFixed(2));
    }
    req.body.taxAmount = parseFloat(((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(2));
    // req.body.totalAmount = parseFloat((req.body.totalAmount + req.body.taxAmount).toFixed(2));
    req.body.cancelAmount = parseFloat(((req.body.booKingAmount * adminData.cancelAmountInPercentage) / 100).toFixed(2));

    if (req.body.totalAmount < 0) {
      req.body.totalAmount = 0;
    }
    req.body.actualAmount = req.body.totalAmount;

    if (req.body.paymentMode == Constant.paymentMode.wallet &&
      req.body.totalAmount > userData.walletAmount) {
      return res.ok(false, Constant.InsufficientAmount, null);
    }

    if (req.body.vehicleId && (req.body.vehicleId).length == 24) {
      if (vehicleData) {
        req.body.userVehicleId = vehicleData._id;
        req.body.userVehicleTypeId = vehicleData.vehicleTypeId;
        req.body.userTransmissionTypeId = vehicleData.userTransmissionTypeId;
      }
    }
    const bookingData = req.body;
    return res.ok(true, null, bookingData);
  } catch (error) {
    console.log(error);
    return res.ok(Constant.serverError);
  }
};


async function generateOtpForRide(req, res) {
  try {
    if (!(req.body.phoneNo && req.body.countryCode))
      return res.ok(false, Constant.required, null)

    let otp = Math.floor(100000 + Math.random() * 900000)
    const optData = await Model.Otp({ otp: otp, phoneNo: req.body.phoneNo, countryCode: req.body.countryCode }).save();

    Service.OtpService.bookingSms(req.body.countryCode, req.body.phoneNo,
      `${`Hello ${req.user.firstName},`}\n${`Your ride just got accepted. Wingmen is on its way to pick you up.`}\n${`Use ${optData.otp} as your Wingmen code when you start the ride.`}`);

    return res.ok(true, null, optData);
  } catch (error) {
    console.log("error", error);
    return res.serverError(false, null)
  }
}

/*
CANCEL BOOKING STATUS
*/
async function cancelBooking(req, res) {
  try {
    let dataToSend = {};
    let setObj = {};
    let driverData = null;
    let coDriverData = null;
    let saveObj = {};
    let message = Constant.bookingMessages.canceledBookingByUser;
    const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
    let eventType = Constant.eventType.default;
    if (Validation.isUserValidate.isValidCancelBooking(req.body))
      return res.ok(false, Constant.required, null);
    let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
    const userData = await Model.User.findOne({ _id: req.user._id });
    if (!userData) {
      return res.ok(false, Constant.userNotFound, null);
    }
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
      if (bookingData.paymentMode === Constant.paymentMode.wallet) {
        //ride cancle PENDING
        if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
          let updateWallet = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
        //ride cancle ACCEPTED
        if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
          let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
        //ride cancle ARRIVED
        if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
          let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
        // refund to user card
      }
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
      if (bookingData.paymentMode === Constant.paymentMode.wallet) {
        //ride cancle PENDING
        if (bookingData.bookingStatus === Constant.bookingStatus.PENDING) {
          let updateWallet = parseFloat(bookingData.totalAmount - bookingData.promoAmount).toFixed(2)
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
        //ride cancle ACCEPTED
        if (bookingData.bookingStatus === Constant.bookingStatus.ACCEPTED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleAccepted) / 100
          let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
        //ride cancle ARRIVED
        if (bookingData.bookingStatus === Constant.bookingStatus.ARRIVED) {
          let calcPercentage = (bookingData.totalAmount * adminData.rideCancleArrived) / 100
          let updateWallet = (bookingData.totalAmount - bookingData.promoAmount - calcPercentage).toFixed(2)

          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) },
            { $inc: { walletAmount: parseInt(updateWallet) } });
        }
      }
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

async function finalCompleteByUser(req, res) {
  try {
    if (Validation.isUserValidate.isValidBookingDetails(req.body))
      return res.ok(false, Constant.required, null);
    let saveObj = {};
    let driverData = null;
    let coDriverData = null;
    let bookingData = await Model.Booking.findOne({
      _id: mongoose.Types.ObjectId(req.body._id),
      userId: mongoose.Types.ObjectId(req.user._id)
    });
    if (!bookingData) {
      return res.ok(false, Constant.noLongerAvailable, {});
    }
    if (req.body.isCompleteByCustomer != undefined) {
      saveObj.isCompleteByCustomer = req.body.isCompleteByCustomer ? true : false;
    }
    await Model.Booking.findOneAndUpdate({ _id: req.body._id }, {
      $set: saveObj
    });
    if (bookingData.driverId) {
      driverData = await Model.Driver.findOne({ _id: bookingData.driverId });
    }
    if (bookingData.coDriverId) {
      coDriverData = await Model.Driver.findOne({ _id: bookingData.coDriverId });
    }
    let title = Constant.bookingMessages.wingMenTitle;
    let payload = {
      title: title,
      message: message,
      eventType: Constant.eventType.userFinalCompleteBooking,
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
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
APPLY PROMO CODE API'S
*/
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
}

async function applyPromCode(req, res) {
  try {
    let dataToSend = {
      finalAmount: 0,
      promoAmount: 0
    }
    let finalAmount = 0;
    let promoAmount = 0;
    if (Validation.isUserValidate.isValidPromoCode(req.body))
      return res.ok(false, Constant.required, null);
    promoCodeData = await Model.PromoCode.findOne({
      promoCode: req.body.promoCode,
      isBlocked: false, isDeleted: false
    });
    if (promoCodeData) {
      if (promoCodeData.noOfPromoUsers && promoCodeData.individualUserPromoAttempt) {
        const promoCountUsed = await Model.Booking.countDocuments({ promoId: promoCodeData._id });
        if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
          return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
        }
        const promoCountUsedByUser = await Model.Booking.countDocuments({
          userId: req.user._id,
          promoId: promoCodeData._id
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
      if (promoCodeData.isCash) {
        promoAmount = promoCodeData.cashback;
      } else {
        promoAmount = parseFloat(((req.body.booKingAmount) * (promoCodeData.percentage)) / 100);
      }
      dataToSend.finalAmount = (finalAmount - promoAmount) > 0 ? finalAmount - promoAmount : 0;
      dataToSend.promoAmount = promoAmount;
      return res.ok(true, null, dataToSend);
    } else {
      return res.ok(false, Constant.inValidPromoCode, null);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

// async function createEventBooking(req, res) {
//   try {
//     req.body.userId = req.user._id;
//     if (Validation.isUserValidate.isValidCreateEventBooking(req.body))
//       return res.ok(false, Constant.required, {});
//     const userData = await Model.User.findOne({ _id: req.user._id });
//     if (!userData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     if (!req.body.timezone) {
//       req.body.timezone = 330;
//     }
//     req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone, 'm')
//     let eventCoordinates = [];
//     let eventLocation = {};
//     if (req.body.eventLocaltionLatitude && req.body.eventLocaltionLongitude) {
//       eventCoordinates.push(Number(req.body.eventLocaltionLongitude))
//       eventCoordinates.push(Number(req.body.eventLocaltionLatitude))
//       eventLocation.type = "Point";
//       eventLocation.coordinates = eventCoordinates;
//       req.body.eventLocaltion = eventLocation;
//     }
//     if (req.body.eventAddress) {
//       req.body.eventAddress = req.body.eventAddress;
//     }
//     req.body.isEventBooking = true;
//     req.body.paymentMode = 'NO_PAYEMENT';
//     const bookingData = await new Model.Booking(req.body).save();
//     const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
//     let title = Constant.bookingMessages.wingMenTitle;
//     let payload = {
//       title: title,
//       message: Constant.bookingMessages.newBookingCreatedByUser,
//       eventType: Constant.eventType.newEventBookingNotification,
//       userId: req.user._id,
//       bookingData: bookingData,
//       userData: userData,
//       bookingId: bookingData._id,
//       receiverId: adminData ? adminData._id : 1,
//       isUserNotification: false,
//       isNotificationSave: false
//     };
//     payload.isNotificationSave = true;
//     payload.socketType = Constant.socketType.user;
//     process.emit("sendNotificationToUser", payload);
//     return res.ok(true, null, bookingData);
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// };

async function createEventBooking (req, res) {
  try {
    if (Validation.isAdminValidate.isEventBookingValid(req.body))
      return res.ok(false, Constant.required, null);
    // if (req.body.bookingDate && (new Date(req.body.bookingDate) == "Invalid Date"
    //     || moment().diff(req.body.bookingDate, 'seconds') > 0)) {
    //   return res.ok(false, Constant.backDateNotAllowed, {});
    // }
    // const element = req.body.bookingDate;
    // const elementa = element.toString();
    // scheduleDate = new Date(moment(elementa).subtract(5.5, 'h'));
    // scheduleDate1 = scheduleDate.toString();
    // // console.log(scheduleDate1);
    // const then = moment(scheduleDate1)
    // const date = new Date(Date.now());
    // const element1 = date.toString();
    // const now = moment(element1);
    // // console.log(element1);
   
    // const date1 = new Date(scheduleDate1);
    
    // const date2 = new Date(element1);
    // function getDifferenceInHours(date1, date2) {
    //   const diffInMs = Math.abs(date2 - date1);
    //   return Math.floor(diffInMs / (1000 * 60 * 60));
    // }
    // if (getDifferenceInHours(date1, date2) <72) {
    //   return res.ok(false, 'Event Booking must be at least before 72 hours', {});
    // } 
    // else {

    if (!req.body.timezone) {
          req.body.timezone = 330;
    // }
    const phoneData = await Model.EventBooking.findOne({ $or: [{ phone: req.body.phone }] });
    if(phoneData) {
      return res.ok(false, Constant.eventBookingAlreadyExist, null);
    }
    const encryptKey = await generateRandomString(5);
    req.body.bookingLocalDate = moment(req.body.bookingDate).add(req.body.timezone, 'm');

    var drivers = req.body.driver;
    var eventPersons = ++drivers ;
    var adminRate = await Model.Admin.findOne({__v: 0});
    var ratePerHour = adminRate.rate;
    var hours = req.body.noOfHours;
    var totalAmount = eventPersons * hours * ratePerHour;
    req.body.totalAmount = totalAmount;
    // return res.ok(true, 'success', req.body);
    const data = await Model.EventBooking(req.body).save()
    // const amountSave = await Model.EventBooking.findOneAndUpdate({phone: req.body.phone}, {$set: {totalAmount: totalAmount}})
    let tokenKey = Service.JwtService.issue({
      _id: Service.HashService.encrypt(data._id)
      , encryptKey: encryptKey
    });
    data.set('token', 'SEE ' + tokenKey, { strict: false });
    await Model.EventBooking.findOneAndUpdate({ _id: data._id }, { $set: { token: tokenKey || null, driverTeam: null } });
    if (req.body.phone && req.body.countryCode) {
      Service.OtpService.sendSMS(
        req.body.countryCode,
        req.body.phone,
        // <a href=`http://192.168.29.202:3002/eventbooking/${}`>Your Event Booking is successfully done</a>
        // `<a href="http://192.168.29.202:3002/eventbooking/${data._id}" target="_blank">Tap here to accept the ride</a>`
        `https://wingmen-booking-nu.vercel.app/eventbooking/${data._id}`
      );
    }
    const adminData = await Model.Admin.find({__v: 0});
    let users = [];
    for (let i = 0; i < adminData.length; i++) {
      adminEmail = adminData[i].email;
      users.push(adminEmail);
    }
    Service.EmailService.sendCreateEventEmailToAdmin(users);
    return res.ok(true, 'SUCCESS', data);
    }
  } catch (error) {
    console.log(error);
    return res.ok(false, Constant.serverError, error);
  }
}

// async function editEventBooking(req, res) {
//   try {
//     req.body.userId = req.user._id;
//     let saveObj = {};
//     if (Validation.isUserValidate.isValidEditCancelEventBooking(req.body))
//       return res.ok(false, Constant.required, {});
//     const userData = await Model.User.findOne({ _id: req.user._id });
//     if (!userData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
//     if (!bookingData) {
//       return res.ok(false, Constant.eventBookingNotFound, null);
//     }
//     if (bookingData.bookingStatus != 'PENDING') {
//       return res.ok(false, Constant.eventBookingNotEdit, null);
//     }
//     let eventCoordinates = [];
//     let eventLocation = {};
//     if (req.body.eventLocaltionLatitude && req.body.eventLocaltionLongitude) {
//       eventCoordinates.push(Number(req.body.eventLocaltionLongitude))
//       eventCoordinates.push(Number(req.body.eventLocaltionLatitude))
//       eventLocation.type = "Point";
//       eventLocation.coordinates = eventCoordinates;
//       saveObj.eventLocaltion = eventLocation;
//     }
//     if (req.body.eventAddress) {
//       saveObj.eventAddress = req.body.eventAddress;
//     }
//     if (req.body.eventName) {
//       saveObj.eventName = req.body.eventName;
//     }
//     if (req.body.eventTypeId) {
//       saveObj.eventTypeId = req.body.eventTypeId;
//     }
//     if (req.body.eventDescription) {
//       saveObj.eventDescription = req.body.eventDescription;
//     }
//     if (req.body.block) {
//       saveObj.block = req.body.block;
//     }
//     if (req.body.bookingDate) {
//       saveObj.bookingDate = req.body.bookingDate;
//     }
//     if (req.body.teamId) {
//       saveObj.teamId = req.body.teamId;
//     }

//     bookingData = await Model.Booking.findOneAndUpdate({ _id: req.body.bookingId }, { $set: saveObj });
//     const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
//     let title = Constant.bookingMessages.wingMenTitle;
//     let payload = {
//       title: title,
//       message: Constant.bookingMessages.editEventBookingCreatedByUser,
//       eventType: Constant.eventType.editEventBookingCreatedByUser,
//       userId: req.user._id,
//       bookingData: bookingData,
//       userData: userData,
//       bookingId: bookingData._id,
//       receiverId: adminData ? adminData._id : 1,
//       isUserNotification: false,
//       isNotificationSave: false
//     };
//     payload.isNotificationSave = true;
//     payload.socketType = Constant.socketType.user;
//     process.emit("sendNotificationToUser", payload);
//     return res.ok(true, null, {});
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// };

// async function cancelEventBooking(req, res) {
//   try {
//     req.body.userId = req.user._id;
//     if (Validation.isUserValidate.isValidEditCancelEventBooking(req.body))
//       return res.ok(false, Constant.required, {});
//     const userData = await Model.User.findOne({ _id: req.user._id });
//     if (!userData) {
//       return res.ok(false, Constant.userNotFound, null);
//     }
//     let bookingData = await Model.Booking.findOne({ _id: req.body.bookingId });
//     if (!bookingData) {
//       return res.ok(false, Constant.eventBookingNotFound, null);
//     }
//     if (bookingData.bookingStatus != 'PENDING') {
//       return res.ok(false, Constant.eventBookingNotCancel, null);
//     }
//     let saveObj = {
//       bookingStatus: 'CANCELED',
//       isCanceledByCustomer: true
//     }
//     bookingData = await Model.Booking.findOneAndUpdate({ _id: req.body.bookingId }, { $set: saveObj });
//     const adminData = await Model.Admin.findOne({ isDeleted: false, isBlocked: false });
//     let title = Constant.bookingMessages.wingMenTitle;
//     let payload = {
//       title: title,
//       message: Constant.bookingMessages.cancelEventBookingCreatedByUser,
//       eventType: Constant.eventType.cancelEventBookingCreatedByUser,
//       userId: req.user._id,
//       bookingData: bookingData,
//       userData: userData,
//       bookingId: bookingData._id,
//       receiverId: adminData ? adminData._id : 1,
//       isUserNotification: false,
//       isNotificationSave: false
//     };
//     payload.isNotificationSave = true;
//     payload.socketType = Constant.socketType.user;
//     process.emit("sendNotificationToUser", payload);
//     return res.ok(true, null, {});
//   } catch (error) {
//     console.log(error);
//     return res.ok(Constant.serverError);
//   }
// };

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
    query.userId = mongoose.Types.ObjectId(req.user._id);
    pipeline.push({ $match: { userId: mongoose.Types.ObjectId(req.user._id) } });
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
          adminId: 1,
          bookingNo: 1,
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
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          isCompleteByCustomer: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          dropUpAddressFour: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          note: 1,
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
          pendingAmount: 1,
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
          taxAmount: 1,
          totalDistanceInKm: 1,
          isTip: 1,
          getBookingDetails: 1
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
          isTip: 1,
          driverEarningAmount: 1
        }
      }
    ];
    const bookingData = await Model.Booking.aggregate(pipeline);
    const driverEaringData = await Model.DriverEaring.findOne({ bookingId: req.body._id });
    let dataToSend = {};
    if (bookingData && bookingData.length) {
      dataToSend = bookingData[0] || {};
    }
    if (dataToSend.isTip) {
      let driverTip = {
        paymentMode: driverEaringData.paymentMode,
        isTipPr: driverEaringData.isTipPr,
        isTipAmount: driverEaringData.isTipAmount
      }
      dataToSend.driverTip = driverTip;
    }
    return res.success(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getCurrentBookingStatus(userData) {
  try {
    // console.log(userData.user._id, 'user detal');
    console.log(userData, 'userData data');
    if (userData.userId) {
      const pipeline = [
        { $match: { userId: mongoose.Types.ObjectId(userData.userId) } },
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
            transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
            dropUplatitudeFirst: 1,
            dropUplongitudeFirst: 1,
            dropUpAddressFirst: 1,
            dropUplatitudeSecond: 1,
            dropUplongitudeSecond: 1,
            dropUpAddressSecond: 1,
            dropUplatitudeThird: 1,
            isCompleteByCustomer: 1,
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
            eta: 1,
            taxAmount: 1,
            totalDistanceInKm: 1,
            totalDistance: 1,
            isTip: 1,
            driverEarningAmount: 1
          }
        }
      ];
      const bookingData = await Model.Booking.aggregate(pipeline);
      console.log(bookingData, 'booking data');
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
            totalDistanceInKm: 1,
            isTip: 1,
            driverEarningAmount: 1
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
    const count = await Model.UserNotification.countDocuments({ receiverId: req.user._id, isDeleted: false });
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
          message: 1,
          isRead: 1,
          createdAt: 1
        }
      }
    ];
    if (req.query.isRead != undefined) {
      pipeline.push({ $match: { isRead: false } });
    }
    const notificationData = await Model.UserNotification.aggregate(pipeline);
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
    //await Model.UserNotification.findOneAndUpdate({_id: req.body._id},req.body);
    await Model.UserNotification.deleteMany({ _id: req.body._id });
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function clearAllNotification(req, res) {
  try {
    //await Model.UserNotification.update({receiverId: req.user._id},req.body,{multi:true});
    await Model.UserNotification.deleteMany({ receiverId: req.user._id });
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
    await Model.User.findOneAndUpdate({ _id: req.user._id }, { $set: setObj }, {});
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
RATING AND REVIEW API'S
*/
async function ratingAndReviewToDriver(req, res) {
  try {
    if (Validation.isUserValidate.isValidBookingDetails(req.body))
      return res.ok(false, Constant.required, null);
    let saveObj = {};
    if (req.body.driverReview) {
      saveObj.driverReview = req.body.driverReview;
      saveObj.isDriverReviewed = true;
    } else {
      saveObj.isDriverReviewed = true;
    }
    if (req.body.driverRating != undefined) {
      saveObj.driverRating = req.body.driverRating;
      saveObj.isDriverRated = true;
    } else {
      saveObj.isDriverRated = true;
    }
    await Model.Booking.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(req.body._id),
      userId: mongoose.Types.ObjectId(req.user._id)
    }, {
      $set: saveObj
    });
    let bookingData = await Model.Booking.findOne({
      _id: mongoose.Types.ObjectId(req.body._id),
      userId: mongoose.Types.ObjectId(req.user._id)
    });
    if (bookingData && bookingData.driverId && saveObj.isDriverRated) {
      let driverData = await Model.Driver.findOne({ _id: bookingData.driverId });
      let setObj = {
        rating: driverData.rating + saveObj.driverRating,
        totalRatedBooking: driverData.totalRatedBooking + 1,
        avgRating: parseFloat(((driverData.rating + saveObj.driverRating) / (driverData.totalRatedBooking + 1)).toFixed(1))
      };
      await Model.Driver.findOneAndUpdate({ _id: bookingData.driverId }, { $set: setObj });
    }
    if (bookingData && bookingData.coDriverId && saveObj.isDriverRated) {
      let coDriverData = await Model.Driver.findOne({ _id: bookingData.coDriverId });
      let setObj = {
        rating: coDriverData.rating + saveObj.driverRating,
        totalRatedBooking: coDriverData.totalRatedBooking + 1,
        avgRating: parseFloat(((coDriverData.rating + saveObj.driverRating) / (coDriverData.totalRatedBooking + 1)).toFixed(1))
      };
      await Model.Driver.findOneAndUpdate({ _id: bookingData.coDriverId }, { $set: setObj });
    }
    return res.ok(true, null, null);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function getAutoReview(req, res) {
  try {
    let pipeline = [];
    const query = { isDeleted: false };
    query.userId = mongoose.Types.ObjectId(req.user._id);
    pipeline.push({ $match: { userId: mongoose.Types.ObjectId(req.user._id) } });

    pipeline.push(
      {
        $sort: {
          "_id": -1
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
        $project: {
          vehicleId: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          adminId: 1,
          bookingNo: 1,
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          seviceTypeId: 1,
          coDriverId: 1,
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          booKingAmount: 1,
          promoAmount: 1,
          totalDistance: 1,
          tripType: 1,
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          dropUpAddressFirst: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          isCompleteByCustomer: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          dropUpAddressFour: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          note: 1,
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
          pendingAmount: 1,
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
          taxAmount: 1,
          totalDistanceInKm: 1,
          isTip: 1,
          getBookingDetails: 1
        }
      }
    );

    const bookingReview = await Model.Booking.aggregate(pipeline);
    const reviewBooking = bookingReview[0]
    //review to driver
    if (reviewBooking.isDriverReviewed === false) {
      return res.ok(true, Constant.autoReview, reviewBooking);
    } else {
      return res.ok(true, Constant.autoReviewForDriver, {});
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function autoRatingAndReviewToDriver(req, res) {
  try {
    //review to driver
    const reviewBooking = req.body.bookingId
    if (reviewBooking) {
      let saveObj = {};
      if (req.body.driverReview) {
        saveObj.driverReview = req.body.driverReview;
        saveObj.isDriverReviewed = true;
      } else {
        saveObj.isDriverReviewed = true;
      }
      if (req.body.driverRating != undefined) {
        saveObj.driverRating = req.body.driverRating;
        saveObj.isDriverRated = true;
      } else {
        saveObj.isDriverRated = true;
      }
      //find and update
      await Model.Booking.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(reviewBooking),
        userId: mongoose.Types.ObjectId(req.user._id)
      }, {
        $set: saveObj
      });
      const bookingData = await Model.Booking.findOne({
        _id: mongoose.Types.ObjectId(reviewBooking),
        userId: mongoose.Types.ObjectId(req.user._id)
      });
      if (bookingData && bookingData.driverId && saveObj.isDriverRated) {
        let driverData = await Model.Driver.findOne({ _id: bookingData.driverId });
        let setObj = {
          rating: driverData.rating + saveObj.driverRating,
          totalRatedBooking: driverData.totalRatedBooking + 1,
          avgRating: parseFloat(((driverData.rating + saveObj.driverRating) / (driverData.totalRatedBooking + 1)).toFixed(1))
        };
        await Model.Driver.findOneAndUpdate({ _id: bookingData.driverId }, { $set: setObj });
      }
      if (bookingData && bookingData.coDriverId && saveObj.isDriverRated) {
        let coDriverData = await Model.Driver.findOne({ _id: bookingData.coDriverId });
        let setObj = {
          rating: coDriverData.rating + saveObj.driverRating,
          totalRatedBooking: coDriverData.totalRatedBooking + 1,
          avgRating: parseFloat(((coDriverData.rating + saveObj.driverRating) / (coDriverData.totalRatedBooking + 1)).toFixed(1))
        };
        await Model.Driver.findOneAndUpdate({ _id: bookingData.coDriverId }, { $set: setObj });
      }
      return res.ok(true, Constant.reviewDone, {});
    }
    //review to skip
    if (req.body.skip === true) {
      let saveObj = {};
      if (req.body.driverRating != undefined) {
        saveObj.isDriverRated = true;
      }
      //find and update
      await Model.Booking.findOneAndUpdate({
        _id: mongoose.Types.ObjectId(reviewBooking),
        userId: mongoose.Types.ObjectId(req.user._id)
      }, {
        $set: saveObj
      });
      return res.ok(true, Constant.reviewSkip, {});
    } else {
      return res.ok(true, Constant.autoReviewForDriver, {});
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


/*
APP VERSIONING API'S
*/
async function getAppVersion(req, res) {
  try {
    const appVersionData = await Model.AppVersion.findOne({});
    return res.ok(true, null, appVersionData)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getContactUs(req, res) {
  try {
    const data = await Model.Admin.findOne({ roles: "admin" }, {
      latitude: 1,
      longitude: 1,
      address: 1,
      phone: 1,
      email: 1,
      contactUsEmail: 1
    });
    return res.ok(true, null, data)
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
TEAM API'S
*/
async function getTeam(req, res) {
  try {
    let dataToSend = {};
    const query = { isDeleted: false, isBlocked: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const teamCount = await Model.Team.countDocuments(query);
    dataToSend.teamCount = teamCount || 0;
    const teamData = await Model.Team.find(query).limit(limit).skip(skip).sort({ createdAt: -1 })
    dataToSend.teamData = teamData || [];
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

/*
EVENT TYPE API'S
*/
async function getEventType(req, res) {
  try {
    let dataToSend = {};
    const query = { isDeleted: false, isBlocked: false };
    if (req.query.isBlocked) query.isBlocked = req.query.isBlocked;
    if (req.query._id && req.query._id.length == 24) query._id = req.query._id;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;
    const eventTypeCount = await Model.EventType.countDocuments(query);
    dataToSend.eventTypeCount = eventTypeCount || 0;
    const eventTypeData = await Model.EventType.find(query).limit(limit).skip(skip).sort({ createdAt: -1 })
    dataToSend.eventTypeData = eventTypeData || [];
    return res.ok(true, null, dataToSend);
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

async function getUserData(userData) {
  try {
    if (userData.userId) {
      const user = await Model.User.findOne({ _id: mongoose.Types.ObjectId(userData.userId) }, {
        firstName: 1,
        lastName: 1,
        image: 1,
        phone: 1,
        countryCode: 1
      });
      return user;
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);
  }
};

async function getAllChatMessages(req, res) {
  try {
    let dataToSend = {};
    if (
      !req.body.bookingId ||
      (req.body.bookingId).length != 24
    )
      return res.ok(false, Constant.required, null);

    const pipeline = [
      { $match: { userId: mongoose.Types.ObjectId(req.user._id) } },
      { $match: { bookingId: mongoose.Types.ObjectId(req.body.bookingId) } },
      {
        $sort: {
          "createdAt": -1
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
        $project: {
          userId: 1,
          driverId: 1,
          bookingId: 1,
          userData: 1,
          driverData: 1,
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

async function contactUs(req, res) {
  try {

    if (Validation.isUserValidate.isValidContactUs(req.body))
      return res.ok(false, Constant.required, null);

    await Model.ContactUs(req.body).save();
    Service.EmailService.sendContactUsEmail(req.body);
    return res.ok(true, null, {});
  } catch (error) {
    return res.serverError(Constant.serverError);
  }
  ;

};

async function subscribe(req, res) {
  try {
    Service.EmailService.sendContactUsEmail({ email: req.body.email });
    return res.ok(true, null, {});
  } catch (error) {
    return res.serverError(Constant.serverError);
  }
}

async function searchZipCode(req, res) {
  try {
    const searchString = req.query.zipcode;
    const data = await Model.City.find({ 'zipCode': { "$regex": searchString, "$options": "i" }, "isDeleted": false, })

    if (data.length > 0) {
      return res.ok(true, null, data);
    } else {
      return res.ok(false, null, data);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function tipToDriver(req, res) {
  try {
    if (Validation.isUserValidate.isAddTip(req.body)) {
      return res.ok(false, Constant.required, null);
    } else {
      const bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
      const driverEarning = await Model.DriverEaring.findOne({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) });
      const userData = await Model.User.findOne({ _id: req.user._id }, { email: 1, _id: 1, firstName: 1, lastName: 1 });
      const paymentMode = bookingData.paymentMode

      if (!userData) {
        return res.ok(false, Constant.userNotFound, null);
      }
      if (driverEarning === null) {
        return res.ok(false, 'Wait for ridding complete.', null);
      }
      if (bookingData.isTip) {
        return res.ok(true, 'Tip is already given.', {});
      } else {
        //tip amount calc
        const tipAmount = (bookingData.totalAmount * req.body.isTipPr) / 100
        const tipAmountFinal = tipAmount
        // tip for driver
        const tipDriver = {
          isTipPr: req.body.isTipPr / 2,
          isTipAmount: parseFloat((tipAmountFinal / 2).toFixed(2)),
          driverEarningAmount: parseFloat(driverEarning.driverEarningAmount + tipAmountFinal / 2).toFixed(2)
        }
        // tip for codriver
        const tipCodriver = {
          isTipPr: req.body.isTipPr / 2,
          isTipAmount: parseFloat((tipAmountFinal / 2).toFixed(2)),
          driverEarningAmount: parseFloat(driverEarning.driverEarningAmount + tipAmountFinal / 2).toFixed(2)
        }
        //change tip status in bookingID
        const tipStatus = {
          isTip: true
        }

        //payment from card and wallet
        if (paymentMode === 'WALLET') {
          // payment from WALLET
          if (paymentMode == Constant.paymentMode.wallet &&
            tipAmountFinal > userData.walletAmount) {
            return res.ok(false, Constant.InsufficientAmount, null);
          }
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) }, { $inc: { walletAmount: - (tipAmountFinal) } });
          //tip for isDriver
          await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isDriver: true }, { $set: tipDriver })
          //tip for isCoDriver
          await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isCoDriver: true }, { $set: tipCodriver })
          await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.bookingId) }, { $set: tipStatus })

          return res.ok(true, 'Tip delivered from wallet done.', null);
        } else {
          //payment from CARD

          //get user card ID
          const transaction = await Model.Transaction.findOne({
            bookingId: mongoose.Types.ObjectId(req.body.bookingId),
            userId: mongoose.Types.ObjectId(bookingData.userId),
            isDeleted: false, isBlocked: false
          });
          if (!transaction) {
            return res.ok(false, Constant.invalidUserCard, null);
          }
          // check user card
          const cardData = await Model.Card.findOne({
            _id: mongoose.Types.ObjectId(transaction.cardId),
            userId: mongoose.Types.ObjectId(req.user._id),
            isDeleted: false, isBlocked: false
          });
          if (!cardData) {
            return res.ok(false, Constant.invalidStripCard, null);
          }
          //debit from user card
          let amount = parseFloat((parseFloat(tipAmountFinal)).toFixed(2));
          let paymentObj = {
            amount: amount,
            stripeCustomerId: cardData.stripeCustomerId,
            stripePaymentMethod: cardData.stripePaymentMethod,
            description: `Payemnt for ride tip ${userData.firstName} ${userData.lastName}-${userData.email}`
          }
          let paymentData = await chargeStrip(paymentObj)
          if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
            paymentObj.trxId = paymentData.data.paymentId;
            paymentObj.captureMethod = paymentData.data.captureMethod;
            paymentObj.chargeId = paymentData.data.chargeId;
            paymentObj.paymentStatus = Constant.paymentStatus.completed;
            paymentObj.userId = userData._id;
            paymentObj.cardId = cardData._id;
            //save all detail

            //tip for isDriver
            await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isDriver: true }, { $set: tipDriver })
            //tip for isCoDriver
            await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isCoDriver: true }, { $set: tipCodriver })
            await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.bookingId) }, { $set: tipStatus })
            return res.ok(true, 'Tip delivered from card done.', null);
          } else {
            return res.ok(false, Constant.invalidStripCard, null);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function tipFromWebsite(req, res) {
  try {
    if (Validation.isUserValidate.isAddTip(req.body)) {
      return res.ok(false, Constant.required, null);
    } else {
      const bookingData = await Model.Booking.findOne({ _id: mongoose.Types.ObjectId(req.body.bookingId) });
      const driverEarning = await Model.DriverEaring.findOne({ bookingId: mongoose.Types.ObjectId(req.body.bookingId) });
      const userData = await Model.User.findById({ _id: req.body.userId }, { email: 1, _id: 1, firstName: 1, lastName: 1 });
      const paymentMode = bookingData.paymentMode

      if (!userData) {
        return res.ok(false, Constant.userNotFound, null);
      }
      if (driverEarning === null) {
        return res.ok(false, 'Wait for ridding complete.', null);
      }
      if (bookingData.isTip) {
        return res.ok(true, 'Tip is already given.', {});
      } else {
        //tip amount calc
        const tipAmount = (bookingData.totalAmount * req.body.isTipPr) / 100
        const tipAmountFinal = tipAmount
        // tip for driver
        const tipDriver = {
          isTipPr: req.body.isTipPr / 2,
          isTipAmount: parseFloat((tipAmountFinal / 2).toFixed(2)),
          driverEarningAmount: parseFloat(driverEarning.driverEarningAmount + tipAmountFinal / 2).toFixed(2)
        }
        // tip for codriver
        const tipCodriver = {
          isTipPr: req.body.isTipPr / 2,
          isTipAmount: parseFloat((tipAmountFinal / 2).toFixed(2)),
          driverEarningAmount: parseFloat(driverEarning.driverEarningAmount + tipAmountFinal / 2).toFixed(2)
        }
        //change tip status in bookingID
        const tipStatus = {
          isTip: true
        }

        //payment from card and wallet
        if (paymentMode === 'WALLET') {
          // payment from WALLET
          if (paymentMode == Constant.paymentMode.wallet &&
            tipAmountFinal > userData.walletAmount) {
            return res.ok(false, Constant.InsufficientAmount, null);
          }
          await Model.User.update({ _id: mongoose.Types.ObjectId(bookingData.userId) }, { $inc: { walletAmount: - (tipAmountFinal) } });
          //tip for isDriver
          await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isDriver: true }, { $set: tipDriver })
          //tip for isCoDriver
          await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isCoDriver: true }, { $set: tipCodriver })
          await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.bookingId) }, { $set: tipStatus })

          return res.ok(true, 'Tip delivered from wallet done.', null);
        } else {
          //payment from CARD

          //get user card ID
          const transaction = await Model.Transaction.findOne({
            bookingId: mongoose.Types.ObjectId(req.body.bookingId),
            userId: mongoose.Types.ObjectId(bookingData.userId),
            isDeleted: false, isBlocked: false
          });
          if (!transaction) {
            return res.ok(false, Constant.invalidUserCard, null);
          }
          // check user card
          const cardData = await Model.Card.findOne({
            _id: mongoose.Types.ObjectId(transaction.cardId),
            userId: mongoose.Types.ObjectId(req.body.userId),
            isDeleted: false, isBlocked: false
          });
          if (!cardData) {
            return res.ok(false, Constant.invalidStripCard, null);
          }
          //debit from user card
          let amount = parseFloat((parseFloat(tipAmountFinal)).toFixed(2));
          let paymentObj = {
            amount: amount,
            stripeCustomerId: cardData.stripeCustomerId,
            stripePaymentMethod: cardData.stripePaymentMethod,
            description: `Payemnt for ride tip ${userData.firstName} ${userData.lastName}-${userData.email}`
          }
          let paymentData = await chargeStrip(paymentObj)
          if (paymentData && paymentData.status && paymentData.data && paymentData.data.paymentId) {
            paymentObj.trxId = paymentData.data.paymentId;
            paymentObj.captureMethod = paymentData.data.captureMethod;
            paymentObj.chargeId = paymentData.data.chargeId;
            paymentObj.paymentStatus = Constant.paymentStatus.completed;
            paymentObj.userId = userData._id;
            paymentObj.cardId = cardData._id;
            //save all detail

            //tip for isDriver
            await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isDriver: true }, { $set: tipDriver })
            //tip for isCoDriver
            await Model.DriverEaring.findOneAndUpdate({ bookingId: mongoose.Types.ObjectId(req.body.bookingId), isCoDriver: true }, { $set: tipCodriver })
            await Model.Booking.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body.bookingId) }, { $set: tipStatus })
            return res.ok(true, 'Tip delivered from card done.', null);
          } else {
            return res.ok(false, Constant.invalidStripCard, null);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};




async function userRefundList(req, res) {
  try {
    const data = await Model.Refund.find({ 'userId': req.user.id, "isDeleted": false, })
    if (data.length > 0) {
      return res.ok(true, 'Your refund', data);
    } else {
      return res.ok(false, "you have never take any refund", data);
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};


async function getAdminVehicle(req, res) {
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
};

// EVENT BOOKING

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

async function getCardById(req, res) {
  try {
    const query = {
      _id: req.params.id
    } 
    const cardData = await Model.Card.findById(query);
    console.log(cardData);
    return res.ok(true, 'SUCCESS', cardData);
  } catch (error) {
    return res.ok(false, Constant.error, error)
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

// async function getAllTeamBookings(req, res){
//   try {
//     const limit = parseInt(req.body.limit) || 10;
//     const skip = parseInt(req.body.skip) || 0;
//     const page = parseInt(req.body.page) || 1;
//     // const { page = 1, limit = 10 } = req.query;
//     const search = req.body;
//     let filter = [];
//     filter.push({ $or: [{}] });
//     filter.push({ $or: [{ eventId:  req.body._id }] });
//     if (search.bookingNo) filter.push({ $or: [{ bookingNo:  search.bookingNo }] });
//     if (search.firstName) filter.push({ $or: [{ firstName:  search.firstName }] });
//     const count = await Model.Booking.countDocuments().and(filter)
//     const offer = await Model.Booking.find()
//       .and(filter)
//       .populate('driverId')
//       .populate('promoId')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//     let data = offer;
//     return res.ok(true, 'SUCCESS', {
//         totalPages: Math.ceil(count / limit),
//         count: count,
//         currentPage: parseInt(page),
//         limit: parseInt(limit),
//         data,
//       })

//   } catch (error) {
//     return res.ok(false, Constant.error, error)
//   }
// }

async function getAllTeamBookings(req, res){
  try {
    const query = {
      eventId: req.body._id
    }
    const eventData = await Model.EventBooking.findOne({_id: req.body._id});
    const data = await Model.Booking.find(query).populate('driverId').populate('promoId');
    if(eventData.paymentStatus === 'COMPLETED') {
      return res.ok(true,'Payment Successfull', data);
    }
    return res.ok(true, "SUCCCESS", data);

  } catch (error) {
    return res.ok(false, Constant.error, error)
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

async function getTotalAmount(req, res) {
  try {
    const query = {
      _id: req.params.id
    }
    const amount = await Model.EventBooking.findOne(query);
    return res.ok(true, 'SUCCESS' , amount.totalAmount);
  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

async function eventTotalPay(req, res) {
  try {
    const eventData = await Model.EventBooking.findOne({_id: req.body.eventId});
    // return;
    const cardId = eventData.userCard[0];
    const cardData = await Model.Card.findOne({
      _id: mongoose.Types.ObjectId(cardId),
      isDeleted: false, isBlocked: false
    })
    if (!cardData) {
      return res.ok(false, Constant.invalidStripCard, null);
    }
    const extra = eventData.extraAmount;
    let paymentObj = {
      amount: parseFloat((eventData.totalAmount / 2)+extra),
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
      const paymnetDone = await Model.EventBooking.findOneAndUpdate({_id: req.body.eventId}, {$set: {paymentStatus: 'COMPLETED'}})
      return res.ok(true, 'SUCCESS', paymentObj);
  } catch (error) {
    return res.ok(false, Constant.error, error); 
  }
}

async function paymentByDefault (req, res) {
  try {
    const eventArray = await Model.EventBooking.find({bookingStatus: "COMPLETED", paymentStatus: "PARTIAL"});
    for (let i = 0; i <= eventArray.length; i++) {
      const element = eventArray[i].bookingDate;
      const elementa = element.toString();
      let eventDate = new Date(moment(elementa).subtract(5.5, 'h'));
      eventDate1 = eventDate.toString();

      // const date = new Date(moment(eventDate));
      // const element1 = date.toString();
      // const now = moment(element1);

      const date1 = new Date(eventDate1);
      const date2 = new Date(moment(date1).add(1, 'day'));

      console.log(date1);
      console.log(date2);
      var bool1 = moment(date2).isAfter(date1);
      console.log(bool1);
    }

  } catch (error) {
    return res.ok(false, Constant.error, error);
  }
}

