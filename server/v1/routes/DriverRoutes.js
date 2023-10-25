const Controller = require('../controllers/index');
const Authorization = require('../../polices/index');
const Auth = require('../../polices/auth')
const Upload = require('../../services/FileUploadService');
const express = require('express');
const router = express.Router();

router.post('/uploadFile', Authorization.isUserAuth, Upload.driver.single('image'), Controller.DriverController.uploadFile);
router.post('/uploadFileWithOutAuth', Upload.driver.single('image'), Controller.DriverController.uploadFile);
router.post('/updateDocuments', Authorization.isUserAuth, Controller.DriverController.updateDocuments);
router.get('/getDriverProfile', Authorization.isUserAuth, Controller.DriverController.getProfile);
router.post('/getAssignedOrders', Authorization.isUserAuth, Controller.DriverController.getOrder);
router.post('/resetPassword', Authorization.isUserAuth, Controller.DriverController.resetDriverPassword);
router.post('/updateProfile', Authorization.isUserAuth, Upload.driver.single('image'), Controller.DriverController.updateDriver);
router.post('/updateDriverLocation', Authorization.isUserAuth, Controller.DriverController.updateDriverLocation);
router.post('/completeOrder', Authorization.isUserAuth, Controller.DriverController.onOrderComplete);
router.post('/sendOtp', Controller.DriverController.sendOtp);
router.post('/verifyOtp', Controller.DriverController.verifyOtp);
router.post('/verifyOtpForgotPassword', Controller.DriverController.verifyOtpForgotPassword);
router.post('/forgotResetPassword', Controller.DriverController.forgotResetPassword);
router.post('/resgister', Upload.driver.single('image'), Controller.DriverController.register);
router.post('/login', Controller.DriverController.loginDriver);
router.post('/logout', Authorization.isUserAuth, Controller.DriverController.logout)
router.post('/updateDriver', Authorization.isUserAuth, Upload.driver.single('image'), Controller.DriverController.updateDriver);
router.post('/check', Controller.DriverController.checkDriver)
router.post('/getDriverForBooking', Controller.DriverController.driverForBooking);
router.post('/signUpForgotPassword', Controller.DriverController.signUpForgotPassword);

/*
VEHICLE TYPE API'S
*/
router.get('/getVehicleType', Authorization.isUserAuth, Controller.DriverController.getVehicleType);
/*
ADD VEHICLE API'S
*/
router.post('/addVehicle', Authorization.isUserAuth, Controller.DriverController.addVehicle);
router.get('/getVehicles', Authorization.isUserAuth, Controller.DriverController.getVehicles);
/*
ADD CO-DRIVER API'S
*/
router.post('/driverOnOff', Authorization.isUserAuth, Controller.DriverController.driverOnOff);
router.post('/driverMode', Authorization.isUserAuth, Controller.DriverController.driverMode);
router.post('/findDriver', Authorization.isUserAuth, Controller.DriverController.nearByDriver)

router.post('/askForPaired', Authorization.isUserAuth, Controller.DriverController.askForPaired);
router.post('/acceptPairedAndSendOtp', Authorization.isUserAuth, Controller.DriverController.acceptPairedAndSendOtp);
router.post('/addCoDriver', Authorization.isUserAuth, Controller.DriverController.addCoDriver);
router.post('/removeCoDriver', Authorization.isUserAuth, Controller.DriverController.removeCoDriver);
router.get('/getCoDriverList', Authorization.isUserAuth, Controller.DriverController.getCoDriverList);
/*
ADD FAVORITE DRIVER API'S
*/
router.post('/addFavoriteUnFavoriteDriver', Authorization.isUserAuth, Controller.DriverController.addFavoriteUnFavoriteDriver);
router.post('/getFavoriteDriverList', Authorization.isUserAuth, Controller.DriverController.getFavoriteDriverList);
/*
CHANGE BOOKING STATUS API'S
*/
router.post('/acceptedBookingStatus', Authorization.isUserAuth, Controller.DriverController.acceptedBookingStatus);
router.post('/getCoDriverBetweenRide', Authorization.isUserAuth, Controller.DriverController.getCoDriverBetweenRide);
router.post('/changeBookingStatus', Authorization.isUserAuth, Upload.driverJob.single('image'), Controller.DriverController.changeBookingStatus);
router.post('/ignoreBookingStatus', Authorization.isUserAuth, Controller.DriverController.ignoreBookingStatus);
router.post('/addCoDriverOnRide', Authorization.isUserAuth, Controller.DriverController.addCoDriverOnRide);

/*
APPVERSION API'S
*/
router.get('/getAppVersion', Controller.DriverController.getAppVersion);

/*
BOOKING API'S
*/
router.post('/getAllBooking', Authorization.isUserAuth, Controller.DriverController.getAllBooking);
router.post('/getBookingDetails', Authorization.isUserAuth, Controller.DriverController.getBookingDetails);

/*
NOTIFICATION API'S
*/
router.post('/getAllNotification', Authorization.isUserAuth, Controller.DriverController.getAllNotification);
router.post('/clearNotification', Authorization.isUserAuth, Controller.DriverController.clearNotification);
router.post('/clearAllNotification', Authorization.isUserAuth, Controller.DriverController.clearAllNotification);
router.post('/enableDisableNotification', Authorization.isUserAuth, Controller.DriverController.enableDisableNotification);
/*
RATING AND REVIEW API'S
*/
router.post('/ratingAndReviewToUser', Authorization.isUserAuth, Controller.DriverController.ratingAndReviewToUser);
router.post('/getChatMessages', Authorization.isUserAuth, Controller.DriverController.getAllChatMessages);
router.post('/getAllChatMessagesForDriver', Authorization.isUserAuth, Controller.DriverController.getAllChatMessagesForDriver);
router.post('/getPayemntHistory', Authorization.isUserAuth, Controller.DriverController.getPayemntHistory);
router.post('/getPayemntHistoryList', Authorization.isUserAuth, Controller.DriverController.getPayemntHistoryList);
router.post('/getRatingList', Authorization.isUserAuth, Controller.DriverController.getRatingList);
router.post('/addBank', Authorization.isUserAuth, Controller.DriverController.addBank);
router.post('/editBank', Authorization.isUserAuth, Controller.DriverController.editBank);
router.post('/getBankDetail', Controller.DriverController.getBankDetail);
router.post('/withdrawPayment', Controller.DriverController.withdrawPayment);
router.post('/getWithdrawPaymrntHistory', Controller.DriverController.getWithdrawPaymrntHistory);
// driver payout account
// router.post('/createDriverPayoutAccount', Authorization.isUserAuth, Upload.driverDocument.single('doc'), Controller.DriverController.createDriverPayoutAccount);
// router.post('/uploadStripDocument',Upload.driverDocument.single('doc'), Controller.DriverController.uploadStripDocument);

router.get('/createStripeAccountStandard', Authorization.isUserAuth, Controller.DriverController.createStripeAccountStandard);
router.get('/getStripeAccountDetail', Authorization.isUserAuth, Controller.DriverController.getStripeAccountDetail);
router.post('/deleteStripeAccountDetail', Authorization.isUserAuth, Controller.DriverController.deleteStripeAccountDetail);

// SCHEDULED BOOKING ROUTES


router.post('/cancelScheduledBooking', Authorization.isUserAuth, Controller.DriverController.cancelScheduledBooking);

/*
startRideWithOtp
*/
router.post('/startRideWithOtp', Controller.DriverController.startRideWithOtp);

// TEAM BOOKING COMPLETE

router.post("/completeTeamBooking", Controller.AdminController.completeTeamBooking);

module.exports = router;
