const FCM = require('fcm-node');
const apns = require('apn');
const Path = require('path');
const apnDriver = require('../config/config');
const Handlebars = require('handlebars');
const Model = require('../models/index');

exports.sendAndroidPushNotifiction = sendAndroidPushNotifiction;
exports.renderMessageFromTemplateAndVariables = renderMessageFromTemplateAndVariables;
exports.sendIosPushNotification = sendIosPushNotification;

async function renderMessageFromTemplateAndVariables(templateData, variablesData) {
  return Handlebars.compile(templateData)(variablesData);
}
async function    sendAndroidPushNotifiction(payloadData) {
  let payload = {};

  if (payloadData) {
    payload = JSON.parse(JSON.stringify(payloadData))
  }
  if (payload.isCompiled && payload.templateData && payload.templateData) {
    payload.message = await renderMessageFromTemplateAndVariables(payload.templateData, payload.variablesData);
  }
  let fcm = new FCM(apnDriver.apnCertificate.apnDriverCertificate);

  if (payload && payload.driverData && !payload.isDriverDataPass) {
    delete payload.driverData;
  }
  if (payload && payload.coDriverData && !payload.isDriverDataPass) {
    delete payload.coDriverData;
  }
  if (payload && payload.bookingData && !payload.isBookingDataPass) {
    delete payload.bookingData;
  }
  var message = {
    to: payload.token || '',
    collapse_key: 'wingmen',
    data: payload || {}
  };

  if (payload.isDriverNotification && payload.isNotificationSave) {
    new Model.DriverNotification(payload).save();
  }
  if (payload.isUserNotification && payload.isNotificationSave) {
    new Model.UserNotification(payload).save();
  }
  if (payload.isUserNotification) {
    fcm = new FCM(apnDriver.apnCertificate.apnUserCertificate);
  }

  fcm.send(message, (err, response) => {
    if (err) {
      console.log('Something has gone wrong! android', payload.token, err);
    } else {
      console.log('Push successfully sent! android');
    }
  });
}
/*
     ==========================================================
     Send the notification to the iOS device for User
     ==========================================================
*/

async function sendIosPushNotification(payloadData) {
  let payload = {};

  if (payloadData) {
    payload = JSON.parse(JSON.stringify(payloadData))
  }
  if (payload.isCompiled && payload.templateData && payload.templateData) {
    payload.message = await renderMessageFromTemplateAndVariables(payload.templateData, payload.variablesData);
  }
  let fcm = new FCM(apnDriver.apnCertificate.apnDriverCertificate);

  if (payload && payload.driverData && !payload.isDriverDataPass) {
    delete payload.driverData;
  }
  if (payload && payload.coDriverData && !payload.isDriverDataPass) {
    delete payload.coDriverData;
  }
  if (payload && payload.bookingData && !payload.isBookingDataPass) {
    delete payload.bookingData;
  }
  var message = {
    to: payload.token || '',
    collapse_key: 'wingmen',
    notification: {
      title: payload.title || 'wingmen',
      body: payload.message || '',
      sound: 'default'
    },
    data: payload || {}
  };

  if (payload.isDriverNotification && payload.isNotificationSave) {
    new Model.DriverNotification(payload).save();
  }
  if (payload.isUserNotification && payload.isNotificationSave) {
    new Model.UserNotification(payload).save();
  }
  if (payload.isUserNotification) {
    fcm = new FCM(apnDriver.apnCertificate.apnUserCertificate);
  }

  fcm.send(message, (err, response) => {
    if (err) {
      console.log('Something has gone wrong! IOS', payload.token, err);
    } else {
      console.log('Push successfully sent! IOS');
    }
  });
}

// async function sendIosPushNotificationold(payloadData) {
//   let payload={};
//   if(payloadData){
//     payload=JSON.parse(JSON.stringify(payloadData))
//   }
//  let certificate = null;
//  let gateway = null;
//  if(payload.isCompiled && payload.templateData && payload.templateData){
//    payload.message =await renderMessageFromTemplateAndVariables(payload.templateData,payload.variablesData);
//  }
//  if(payload && payload.driverData){
//    delete payload.driverData;
//  }
//  if(payload && payload.coDriverData){
//    delete payload.coDriverData;
//  }
//  if(payload && payload.bookingData){
//    delete payload.bookingData;
//  }
//  if(payload.isDriverNotification && payload.isNotificationSave){
//    new Model.DriverNotification(payload).save();
//  }
//  if(payload.isUserNotification && payload.isNotificationSave){
//    new Model.UserNotification(payload).save();
//  }
//  certificate = Path.resolve('.') + apnCertificate.apnUserCertificate;
//  if(payload.isUserNotification){
//    certificate = Path.resolve('.') + apnCertificate.apnUserCertificate;
//  }
//  gateway =apnCertificate.gateway;
//  const status = 1;
//  const snd = 'ping.aiff';
//  const options = {
//    cert: certificate,
//    certData: null,
//    key: certificate,
//    keyData: null,
//    passphrase: 'click',
//    ca: null,
//    pfx: null,
//    pfxData: null,
//    gateway,
//    port: 2195,
//    rejectUnauthorized: true,
//    enhanced: true,
//    autoAdjustCache: true,
//    connectionTimeout: 0,
//    ssl: true,
//    debug: true,
//    //  production : true
//  };

//  function log(type) { // eslint-disable-line no-unused-vars
//    return function () { };
//  }
//  if (payload && payload.deviceToken) {
//    const tokenData = payload.deviceToken;
//    try {
//      const deviceToken = new apns.Device(tokenData);
//      const apnsConnection = new apns.Connection(options);
//      const note = new apns.Notification();

//      note.expiry = Math.floor(Date.now() / 1000) + 3600;
//      note.contentAvailable = 1;
//      note.sound = snd;
//      note.alert = payload.alert || '';
//      note.newsstandAvailable = status;
//      note.payload = payload;

//      apnsConnection.pushNotification(note, deviceToken);

//      // Handle these events to confirm that the notification gets
//      // transmitted to the APN server or find error if any
//      apnsConnection.on('transmissionError', (errCode, notification, device) => {
//        console.error(`Notification caused error: ${errCode} for device `, device.token.toString('hex'), notification);
//      });

//      apnsConnection.on('error', log('error'));
//      apnsConnection.on('transmitted', log('transmitted'));
//      apnsConnection.on('timeout', log('timeout'));
//      apnsConnection.on('connected', log('connected'));
//      apnsConnection.on('disconnected', log('disconnected'));
//      apnsConnection.on('socketError', log('socketError'));
//      apnsConnection.on('transmissionError', log('transmissionError'));
//      apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
//    } catch (error) {
//      console.log(error);
//    }
//  }
// }
