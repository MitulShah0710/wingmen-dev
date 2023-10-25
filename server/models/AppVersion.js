const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var AppVersionModelSchema = new Schema({
  latestIOSVersion: { type: Number },
  latestAndroidVersion: { type: Number },
  criticalAndroidVersion: { type: Number },
  criticalIOSVersion: { type: Number },
  latestDriverIOSVersion: { type: Number },
  latestDriverAndroidVersion: { type: Number },
  criticalDriverAndroidVersion: { type: Number },
  criticalDriverIOSVersion: { type: Number },
  latestWebID: { type: Number },
  criticalWebID: { type: Number },
  timeStamp: { type: Date, default: Date.now },
  updateMessageAtPopup: { type: String, default: '' },
  updateTitleAtPopup: { type: String, default: '' },
  driverUpdateMessageAtPopup: { type: String, default: '' },
  driverUpdateTitleAtPopup: { type: String, default: '' },  
  aboutUs: { type: String, default: '' },  
  contactUs: { type: String, default: '' },  
  termsAndCondition: { type: String, default: '' },  
  driverAboutUs: { type: String, default: '' },  
  driverContactUs: { type: String, default: '' },  
  driverTermsAndCondition: { type: String, default: '' },  
}, { timestamps: true })

module.exports = mongoose.model('AppVersion',AppVersionModelSchema);