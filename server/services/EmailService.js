const nodeMailer = require('nodemailer');
const sendGrid = require('@sendgrid/mail');
require('dotenv').config()
sendGrid.setApiKey(process.env.SENDGRID_KEY);

const Model = require('../models/index');
// const { getMaxListeners } = require('../models/User');
let transporter = nodeMailer.createTransport({
    host: "",
    port: 0,
    secure: false, // true for 465, false for other ports
    auth: {
        user: '', // generated ethereal user
        pass: '' // generated ethereal password
    }
});
const fromMail = 'support@mywngmn.com';
module.exports = {
    sendContactUsEmail: (payload, otp) => {
        const msg = {
            from: fromMail,
            to: 'info@mywngmn.com',
            subject: 'Wingmen - New Subscription',
            html: ''
        };

        const html = `
            <h3>New subscription added. <br></h3>
            <h3>Email: ${payload.email}<br></h3>
        `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },
    sendUserVerifyMail: (payload, otp) => {
        const msg = {
            from: fromMail,
            to: payload.phone || payload.email,
            subject: `Welcome to Wingmen where "We've Got Your Back".`,
            html: ''
        };

        const html = `
            <h3>Thank you for registering on Wingmen.</h3>
            <p>You verification code is ${otp.otp}.</p>
        `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },

    sendScheduleDriverRequestMail: (driverData, bookingData) => {
        const msg = {
            from: fromMail,
            to: driverData,
            subject: `Welcome to Wingmen where "We've Got Your Back".`,
            html: ''
        };
        const response = {
            bookingID: bookingData._id
        }
        const html = `
            <h3>We've got a Ride for you</h3>
            <a href="https://wingmen-booking-nu.vercel.app/schedulebooking/${response.bookingID}" target="_blank">Tap here to accept the ride</a>
        `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },
    sendScheduleCoDriverRequestMail: (driverData, bookingData) => {
        const msg = {
            from: fromMail,
            to: driverData,
            subject: `Welcome to Wingmen where "We've Got Your Back".`,
            html: ''
        };
        const response = {
            bookingID: bookingData._id
        }
        const html = `
            <h3>We've got a Ride for you in which u can be a Co-Pilot</h3>
            <a href="https://wingmen-booking-nu.vercel.app/schedulebooking/${response.bookingID}" target="_blank">Tap here to accept the ride</a>
        `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },

    sendScheduledDriverConfirmation: (driverEmail) => {
        const msg = {
            from: fromMail,
            to: driverEmail,
            subject: `Confirmation of SCheduled Ride.".`,
            html: ''
        };
        // const response = {
        //     bookingData: bookingData1
        // }
        const html = `
            <h3>Your Scheduled Ride is now confirmed and scheduled at specified time</h3>
            `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },

    sendScheduledCoDriverConfirmation: (CodriverEmail) => {
        const msg = {
            from: fromMail,
            to: CodriverEmail,
            subject: `Confirmation of Scheduled Ride.".`,
            html: ''
        };
        const html = `
            <h3>Your Scheduled Ride as Co-Pilot is now confirmed and scheduled at specified time</h3>
            `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },

    sendBroadcastEmailToDriver:(users, DriverTitle, DriverDescription) => {
        const response = {
            title: DriverTitle,
            description: DriverDescription,
        }
        const msg = {
            from: fromMail,
            to: users,
            subject: `${response.title}`,
            html: ''
        };
        const html = `
            <h4>${response.description}</h4>
            `;
        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.', error);
        });
    },
    
    sendCreateEventEmailToAdmin: (users) => {
        const msg = {
            from: fromMail,
            to: adminEmail,
            subject: `New Event Booking created".`,
            html: ''
        };
        const html = `
            <h3>A new Event Booking was created successfully.</h3>
            <h2> Please assign a new Event Manager for the booking.</h2>
            `;

        msg.html = html;
        sendGrid.send(msg).then(info => {
            console.log('Email Sent successfully!');
        }).catch(error => {
            console.log('Email not sent.102.', error);
        });
    },

    sendForgotPasswordMail: payload => {
        // transporter.sendMail({
        //     from: fromMail,
        //     to: payload.email,
        //     subject: 'Rupee - Reset password',
        //     html: ``
        // }).then(info => {
        //     console.log('Email sent successfully!');
        // }).catch(error => {
        //     console.log('Email not sent', error);
        // })
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'Rupee - Reset Password',
                html: ''
            };
            let query;
            Model.VerificationLink.findOne({ user: payload.id }).then(link => {

                if (link) {
                    Model.VerificationLink.findOneAndDelete({ _id: link._id }).then().catch(error => console.log(error));
                }
                query = Model.VerificationLink.create({ user: payload.id, type: 'password' });
                // console.log(query);
                query.then(result => {
                    const html = `
                        <p><a href="https://192.168.1.168:3000/api/v1/auth/userVerify/${result._id}">Click here to reset your password.</a></p>
                    `;
                    msg.html = html;
                    sendGrid.send(msg).then(info => {
                        return resolve(info);
                    }).catch(error => {
                        return reject(error);
                    });
                });
            })
        });
    },
    AdminForgotEmail: payload => {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'Wingmen Admin - Reset Password',
                html: ''
            };
            const passwordResetToken = payload.passwordResetToken || '';
            const html = `
                <p><a href="https://mywngmn.com/admin/#/reset-password/?passwordResetToken=${passwordResetToken}">Click here to reset your password.</a></p>
                `;
            msg.html = html;
            sendGrid.send(msg).then(info => {
                return resolve(info);
            }).catch(error => {
                return reject(error);
            });
        });
    },
    UserForgotEmail: payload => {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'Wingmen Customer - Reset Password',
                html: ''
            };
            const passwordResetToken = payload.passwordResetToken || '';
            const html = `
                <p><a href="https://mywngmn.com/admin/#/reset-password/?passwordResetToken=${passwordResetToken}">Click here to reset your password.</a></p>
                `;
            msg.html = html;
            sendGrid.send(msg).then(info => {
                return resolve(info);
            }).catch(error => {
                return reject(error);
            });
        });
    },
    onDriverForgotPassword: payload => {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: payload.email,
                subject: 'Wingmen Driver - Reset Password',
                html: ''
            };
            let query;
            Model.VerificationLink.findOne({ user: payload.id }).then(link => {

                if (link) {
                    Model.VerificationLink.findOneAndDelete({ _id: link._id }).then().catch(error => console.log(error));
                }
                query = Model.VerificationLink.create({ user: payload.id, type: 'driver' });

                query.then(result => {
                    const html = `
                        <p><a href="https://192.168.1.168:3000/api/v1/auth/userVerify/${result._id}">Click here to reset your password.</a></p>
                    `;
                    msg.html = html;
                    sendGrid.send(msg).then(info => {
                        return resolve(info);
                    }).catch(error => {
                        return reject(error);
                    });
                });
            })
        });
    },
    test() {
        return new Promise((resolve, reject) => {
            const msg = {
                from: fromMail,
                to: 'manish@apptunix.com',
                subject: 'Rupee Driver - Reset Password',
                html: getTemplate()
            };
            sendGrid.send(msg).then(info => {
                resolve(msg);
            }).catch(error => {
                reject(error);
            })
        })
    }
};
function getTemplate() {
    return `<div style="text-align: center; width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#dfa601;">
    <div style="max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;">
      <table align="center" cellpadding="0" style="border-spacing:0;font-family:'Muli',Arial,sans-serif;color:#2059FE;Margin:0 auto;width:100%;max-width:600px;">
        <tbody>
          <tr>
            <td align="center" class="vervelogoplaceholder" height="143" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;height:143px;vertical-align:middle;" valign="middle"><span class="sg-image" <a href="trotdrive.com" target="_blank"><img alt="TrotDrive"src="https://buraqdelivery.com:8002/static/customers/loginlogo.png" width="100"></a></span></td>
          </tr>
          <!-- Start of Email Body-->
          <tr>
            <td class="one-column" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;background-color:#ffffff;">
              <!--[if gte mso 9]>
                    <center>
                    <table width="80%" cellpadding="20" cellspacing="30"><tr><td valign="top">
                    <![endif]-->
              <table style="border-spacing:0;" width="100%">
                <tbody>
                  <tr>
                    <td align="center" class="inner" style="padding-top:0px;padding-bottom:35px;padding-right:30px;padding-left:30px;" valign="middle"><span class="sg-image" <img alt="Forgot Password" class="banner" height="93" style="border-width: 0px; margin-top: 30px; width: 255px; height: 93px;" width="255"></span></td>
                  </tr>
                 <tr> <td style="color:#000000;font-family:'ClanPro-Book','HelveticaNeue-Light','Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:28px;line-height:36px;padding-left: 20px;padding-bottom:30px;padding-top:0px;text-align:left">
Hi Mitendra!
</td></tr>
                  <tr>
<td style="color:#595959;font-family:'ClanPro-Book','HelveticaNeue-Light','Helvetica Neue Light',Helvetica,Arial,sans-serif;font-size:16px;line-height:28px;padding-bottom:28px;padding-left: 20px;text-align:left">

<p>Here’s your verification code: 
  <strong>9576</strong></p>

<p>Enter it to finish updating your email address.</p>


</td>
</tr>
                </tbody>
              </table>
              <!--[if (gte mso 9)|(IE)]>
                    </td></tr></table>
                    </center>
                    <![endif]-->
            </td>
          </tr>
          <!-- End of Email Body-->
          <!-- whitespace -->
           <tr  align="center">
    <td style="background:#2059FE;padding-left:5px;"bgcolor="#009fdf">
        
                    <table style="font-family:sans-serif">
              
                    <td style="padding-top: 10px">
                      <!--   <table style="border-spacing:0;color:#ffffff;font-family:sans-serif;font-size:14px"> -->
                           
                               
                                <td style="padding:15px;text-align:right">     
                      

                                <a href="#" target="_blank" ><img src="img/fb.png"  width="25" height="25" ></a>&nbsp;
                                <a href="#" target="_blank" ><img src="img/twit.png"  width="25" height="25" ></a>&nbsp;
                                <a href="#" target="_blank" ><img src="img/instagram.png"  width="25" height="25" ></a>&nbsp;
                                <a href="#" target="_blank" ><img src="img/youtube.png"  width="25" height="25" ></a>&nbsp;
                            </td>
                           
                      </table>
                   <!--  </td> -->
              <!-- display:inline-block;-->
 
    </td>
</tr>
          <!-- whitespace -->
          <tr>
            <td height="25">
              <p style="line-height: 25px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>

              <p>&nbsp;</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:0;padding-bottom:0;padding-right:30px;padding-left:30px;text-align:center;Margin-right:auto;Margin-left:auto;">
              <div style="text-align: center">
                <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#000000;line-height:23px;">Problems or questions? Call us at
                  <nobr><a class="tel" href="tel:045705713" style="color:#000000;text-decoration:none;" target="_blank"><span style="white-space: nowrap">045705713</span></a></nobr>
                </p>

                <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;font-size:15px;color:#000000;line-height:23px;">or email <a href="mailto:info@trotdrive.com" style="color:#000000;text-decoration:underline;" target="_blank">info@trotdrive.com</a></p>

               
                 <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;padding-top:10px;padding-bottom:0px;font-size:15px;color:#000000;line-height:23px;">To change your settings or <a href="mailto:info@trotdrive.com" style="color:#000000;text-decoration:underline;" target="_blank">unsubscribe</a> please login to your account, <span style="white-space: nowrap">and modify your notification policy</span>, <span style="white-space: nowrap">You cannot reply directly to this email.</span> </p>
                  <p style="font-family:'Muli',Arial,sans-serif;Margin:0;text-align:center;Margin-right:auto;Margin-left:auto;padding-top:10px;padding-bottom:0px;font-size:15px;color:#000000;line-height:23px;">© Trot Drive Technology Services <span style="white-space: nowrap">Barsha​</span>, <span style="white-space: nowrap">Dubai</span> <span style="white-space: nowrap">UAE</span></p>
              </div>
            </td>
          </tr>
          <!-- whitespace -->
          <tr>
            <td height="40">
              <p style="line-height: 40px; padding: 0 0 0 0; margin: 0 0 0 0;">&nbsp;</p>

              <p>&nbsp;</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>`;
}
