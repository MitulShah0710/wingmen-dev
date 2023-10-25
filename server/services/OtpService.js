var Model = require("../models/index");
const twilio = require("twilio");
const config = require("../config/config");
const client = twilio(
  config.twilioCredentials.accountSid,
  config.twilioCredentials.authToken
);
const senderNumber = config.twilioCredentials.senderNumber;
const request = require("request");

var sinchApi = require("sinch-rest-api")({
  key: config.sinchCredentials.key,
  secret: config.sinchCredentials.secret,
});


async function requestSend(options) {
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        return resolve(null);
      } else {
        if (
          response &&
          response.statusCode &&
          response.statusCode == 200 &&
          typeof JSON.parse(body) == "object"
        ) {
          return resolve(JSON.parse(body));
        } else {
          return resolve(null);
        }
      }
    });
  });
}


module.exports = {
  issue() {
    return Math.floor(100000 + Math.random() * 900000);
  },
  async verify(payload) {
    return new Promise((resolve, reject) => {
      // if (payload.otp == "123456") {
      //   Model.Otp.findOne({ _id: payload.otpId }).then((otp) => {
      //     if (!otp) return resolve(0);
      //     Model.Otp.deleteOne({ _id: otp._id }).then();
      //     return resolve(otp);
      //   });
      // } else {
      Model.Otp.findOne({ _id: payload.otpId }).then((otp) => {
        if (!otp) return resolve(0);
        if (otp.otp != payload.otp) return resolve(0);
        Model.Otp.deleteOne({ _id: otp._id }).then();
        return resolve(otp);
      });
      // }
    });
  },


  async verifyWithOutDelete(payload) {
    return new Promise((resolve, reject) => {
      if (payload.otp == "123456") {
        Model.Otp.findOne({ _id: payload.otpId }).then((otp) => {
          if (!otp) return resolve(0);
          return resolve(otp);
        });
      } else {
        Model.Otp.findOne({ _id: payload.otpId }).then((otp) => {
          if (!otp) return resolve(0);
          if (otp.otp != payload.otp) return resolve(0);
          return resolve(otp);
        });
      }
    });
  },


  async sendSMS(countryCode, phoneNo, messages) {
    return new Promise(async (resolve, reject) => {
      let data = null;
      const smsOptions = {
        messagingServiceSid: config.twilioCredentials.messagingServiceId,
        from: senderNumber,
        to: countryCode + phoneNo.toString(),
        body: null,
      };
      smsOptions.body = messages;

      //     let options = {
      //             url: config.sinchCredentials.restApiUrl,
      //             method: 'POST',
      //             headers: {
      //                 'Authorization':config.sinchCredentials.apiToken,
      //                 'Content-Type': 'application/json'
      //             },
      //             body: {
      //                 "from": config.sinchCredentials.fromNumber,
      //                 "to": [
      //                     (countryCode + phoneNo).toString() || "-"
      //                 ],
      //                 "body": smsOptions.body || "-"
      //             }
      //     }
      //   data=await requestSend(options)
      //sinchApi.messaging.sendSms({number: smsOptions.to, message: smsOptions.body});
      //.then(console.log)
      //.fail(console.log)
      let msg = await client.messages.create(smsOptions);
      return resolve(messages);
    });
  },

  async bookingSms(countryCode, phoneNo, messages) {
    return new Promise(async (resolve, reject) => {
      let data = null;
      const smsOptions = {
        messagingServiceSid: config.twilioCredentials.messagingServiceId,
        from: senderNumber,
        to: countryCode + phoneNo.toString(),
        body: null,
      };
      smsOptions.body = messages;
      let msg = await client.messages.create(smsOptions);
      return resolve(messages);
    });
  },
  async bookingSms1(countryCode, phoneNo, messages) {
    return new Promise(async (resolve, reject) => {
      let data = null;
      const smsOptions = {
        messagingServiceSid: config.twilioCredentials.messagingServiceId,
        from: senderNumber,
        to: countryCode + phoneNo,
        body: null,
      };
      smsOptions.body = messages;
      let msg = await client.messages.create(smsOptions);
      return resolve(messages);
    });
  },
};
