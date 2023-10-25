const Controller = require('../controllers/index');
const Authorization = require('../../polices/index');
const Upload = require('../../services/FileUploadService');
const express = require('express');
const router = express.Router();


router.post('/checkUser', Controller.UserController.checkUser);
router.get('/checkUserAuth', Controller.UserController.checkUserAuth);
router.post('/checkGuestUser', Controller.UserController.checkGuestUser);
router.post('/signUp', Controller.UserController.register);
router.post('/sendOtp', Controller.UserController.sendOtp);
router.post('/verifyOtp', Controller.UserController.verifyOtp);
router.post('/verifyRideOtp', Controller.UserController.verifyRideOtp);
router.post('/complete', Upload.user.single('image'), Controller.UserController.completeProcess);

router.post('/signIn', Controller.UserController.signIn);
router.post('/socialLogin', Upload.user.single('image'), Controller.UserController.socialLogin);
router.post('/logout', Authorization.isUserAuth, Controller.UserController.logout)
router.post('/updateUser', Authorization.isUserAuth, Upload.user.single('image'), Controller.UserController.upadateUser)
router.post('/signUpForgotPassword', Controller.UserController.signUpForgotPassword);
router.post('/verifyOtpForgotPassword', Controller.UserController.verifyOtpForgotPassword);
router.post('/forgotPassword', Controller.UserController.forgotPassword)

router.get('/getUserProfile', Authorization.isUserAuth, Controller.UserController.getProfile);
router.post('/registerDevice', Authorization.isUserAuth, Controller.UserController.deviceRegister);
router.post('/changePassword', Authorization.isUserAuth, Controller.UserController.changePassword);
router.post('/updateProfile', Authorization.isUserAuth, Upload.user.single('image'), Controller.UserController.updateUserProfile);
router.post('/updateFullProfile', Authorization.isUserAuth, Upload.user.single('image'), Controller.UserController.updateUserFullProfile);

router.post('/forgotPasswordWeb', Controller.UserController.forgotPasswordWeb);
router.post('/forgotChangePasswordWeb', Controller.UserController.forgotChangePasswordWeb);
router.post('/uploadFile', Authorization.isUserAuth, Upload.user.single('image'), Controller.UserController.uploadFile);
/*
VEHICLE TYPE API'S
*/
router.get('/getVehicleType', Authorization.isUserAuth, Controller.UserController.getVehicleType);
/*
SERVICE TYPE API'S
*/
router.get('/getServiceType', Authorization.isUserAuth, Controller.UserController.getServiceType);
/*
ADD VEHICLE API'S`
*/
router.post('/addVehicle', Authorization.isUserAuth, Controller.UserController.addVehicle);
router.post('/editVehicle', Authorization.isUserAuth, Controller.UserController.editVehicle);
router.post('/deleteVehicle', Authorization.isUserAuth, Controller.UserController.deleteVehicle);
router.get('/getVehicles', Authorization.isUserAuth, Controller.UserController.getVehicles);

/*
BOOKING API'S
*/
router.post('/createBooking', Authorization.isUserAuth, Controller.UserController.createBooking);
router.post('/createBookingPaymentCheck', Authorization.isUserAuth, Controller.UserController.createBookingPaymentCheck);
router.post('/cancelBooking', Authorization.isUserAuth, Controller.UserController.cancelBooking);
// router.post('/createEventBooking', Authorization.isUserAuth, Controller.UserController.createEventBooking);
// router.post('/editEventBooking', Authorization.isUserAuth, Controller.UserController.editEventBooking);
router.post('/finalCompleteByUser', Authorization.isUserAuth, Controller.UserController.finalCompleteByUser);
router.post('/getAllBooking', Authorization.isUserAuth, Controller.UserController.getAllBooking);
router.post('/getBookingDetails', Authorization.isUserAuth, Controller.UserController.getBookingDetails);
router.post('/generateOtpForRide', Authorization.isUserAuth, Controller.UserController.generateOtpForRide);

/*
BOOKING STATUS API'S
*/
// router.get('/getCurrentBookingStatus', Authorization.isUserAuth, Controller.UserController.getCurrentBookingStatus); // creating issur in socket
/*
APPLY PROMO CODE API'S
*/
router.post('/applyPromCode', Authorization.isUserAuth, Controller.UserController.applyPromCode);
router.post('/PromoLogCreate', Controller.UserController.PromoLogCreate);
/*
NOTIFICATION API'S
*/
router.get('/getAllNotification', Authorization.isUserAuth, Controller.UserController.getAllNotification);
router.post('/clearNotification', Authorization.isUserAuth, Controller.UserController.clearNotification);
router.post('/clearAllNotification', Authorization.isUserAuth, Controller.UserController.clearAllNotification);
router.post('/enableDisableNotification', Authorization.isUserAuth, Controller.UserController.enableDisableNotification);
/*
RATING AND REVIEW API'S
*/
router.post('/ratingAndReviewToDriver', Authorization.isUserAuth, Controller.UserController.ratingAndReviewToDriver);
router.get('/getAutoReview', Authorization.isUserAuth, Controller.UserController.getAutoReview);
router.post('/autoRatingAndReviewToDriver', Authorization.isUserAuth, Controller.UserController.autoRatingAndReviewToDriver);
/*
APPVERSION API'S
*/
router.get('/getAppVersion', Controller.UserController.getAppVersion);
router.get('/getContactUs', Controller.UserController.getContactUs);
/*
TEAM API'S
*/
router.get('/getTeam', Authorization.isUserAuth, Controller.UserController.getTeam);
/*
EVENT TYPE API'S
*/
router.get('/getEventType', Authorization.isUserAuth, Controller.UserController.getEventType);
router.post('/getChatMessages', Authorization.isUserAuth, Controller.UserController.getAllChatMessages);
/*
STRIP
*/
router.post('/setUpIntent', Authorization.isUserAuth, Controller.UserController.setUpIntent);
router.post('/addCard', Authorization.isUserAuth, Controller.UserController.addCard);
router.post('/deleteCard', Authorization.isUserAuth, Controller.UserController.deleteCard);
router.post('/updateDefaultCard', Authorization.isUserAuth, Controller.UserController.updateDefaultCard);
router.post('/getAllCard', Authorization.isUserAuth, Controller.UserController.getAllCard);
router.post('/chargeWallet', Authorization.isUserAuth, Controller.UserController.chargeWallet);
router.post('/contactUs', Controller.UserController.contactUs);
router.post('/subscribe', Controller.UserController.subscribe);

router.post('/tipToDriver', Authorization.isUserAuth, Controller.UserController.tipToDriver);
router.post('/tipFromWebsite', Controller.UserController.tipFromWebsite);
router.get('/userRefundList', Authorization.isUserAuth, Controller.UserController.userRefundList);

/*
CITY API
*/
router.get('/searchZipCode', Controller.UserController.searchZipCode);
router.get('/getAdminVehicle', Controller.UserController.getAdminVehicle);

//SCHEDULED RIDE API'S

router.post('/ScheduledRideCoDriverVerifyOtp', Controller.DriverController.ScheduledRideCoDriverVerifyOtp);
router.post('/availableFreeScheduledCoDriver', Controller.DriverController.availableFreeScheduledCoDriver);
router.post('/ScheduledRideVerifyOtp', Controller.DriverController.ScheduledRideVerifyOtp);
router.post('/assignScheduledRide', Controller.DriverController.assignScheduledRide);
router.post('/viewScheduledRide', Controller.DriverController.viewScheduledRide);
router.post('/createScheduledBooking', Authorization.isUserAuth, Controller.UserController.createScheduledBooking);

//EVENT API'S

router.post('/addEventCard', Authorization.isUserAuth, Controller.UserController.addEventCard);
router.post('/createEventBooking', Controller.UserController.createEventBooking);
router.get('/getEventBookingById/:id', Controller.UserController.getEventBookingById);
router.get('/getCardById/:id', Controller.UserController.getCardById);
router.post('/cancelEventBooking', Controller.UserController.cancelEventBooking);
router.post('/getAllTeamBookings', Controller.UserController.getAllTeamBookings);
router.get('/getDriverRate', Controller.UserController.getDriverRate);
router.post('/getTotalAmount/:id', Controller.UserController.getTotalAmount);
router.post('/confirmEventBooking', Controller.AdminController.confirmEventBooking);
router.post('/eventTotalPay', Controller.UserController.eventTotalPay);
router.post("/assignEventDrivers", Controller.DriverController.assignEventDrivers);
// router.get("/paymentByDefault", Controller.UserController.paymentByDefault);

module.exports = router;
