require('dotenv').config()
const portNumber = process.env.PORT;
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const cryptSecretKey = process.env.CRYPT_SECRET_KEY;
const fcmDriverKey = process.env.FCM_DRIVER_KEY;
const fcmCustomerKey = process.env.FCM_USER_KEY;

const apnCertificate = {
  apnUserCertificate: process.env.APNS_USER_KEY,
  // apnDriverCertificate: 'AAAAkYX5rUk:APA91bHi4IDH7vqbfHO6Tfk3SRVmeRgOKJ_sDat8YICCVtmYIF89F1ps85xmPEzXl89DwPGUDHGpuMCMygux-cPUweOamwLJVHic9T8JvY2PixQzAKa8ig9Mu9t8VvlNor2IybknGjHm',
  // apnDriverCertificate: 'MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg/aDFmLMHGsxQnrTNkAWgy1hURwSRwfCVBbedMvmLc/6gCgYIKoZIzj0DAQehRANCAASq/K7GyPvPgOPMgeJLw6wX75gHafRhRgnkAz2oP48Rp5XkAa0Bn5a7JammZYEEB/5afQjACAbdYA+OuLZetxUs',
  apnDriverCertificate: process.env.APNS_DRIVER_KEY,
  gateway: 'gateway.push.apple.com',
  sandBoxGateway: 'gateway.sandbox.push.apple.com'
}
const salesTax = 10;
const twilioCredentials = {
  accountSid: process.env.TWILIO_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  senderNumber: process.env.SENDER_NUMBER,
  messagingServiceId: process.env.MSG_SERVICE_ID
};
const stripKey = process.env.STRIPE_LIVE;
const stripPub_live_key = process.env.STRIPE_LIVE_PUBLIC;
const stripKeyTest = process.env.STRIPE_TEST;
const stripPubKeyTest = process.env.STRIPE_TEST_PUBLIC;

const sinchCredentials = {
  url: process.env.SINCH_URL,
  key: process.env.SINCH_KEY,
  secret: process.env.SINCH_SECRET,
  servicePlanId: process.env.SINCH_PLAN,
  apiToken: process.env.SINCH_API_TOKEN,
  restApiUrl: process.env.SINCH_REST_API,
  fromNumber: process.env.SINCH_FROM_NUMBER
};
module.exports = {
  port: portNumber,
  SecretKey: jwtSecretKey,
  cryptHash: cryptSecretKey,
  fcmDriverKey: fcmDriverKey,
  fcmCustomerKey: fcmCustomerKey,
  tax: salesTax,
  apnCertificate: apnCertificate,
  twilioCredentials: twilioCredentials,
  stripKey: stripKey,
  stripKeyTest: stripKeyTest,
  sinchCredentials: sinchCredentials
};
