const Controller = require('../controllers/index');
const userController = require('../controllers/Admin/user/userController');
const bookingController = require('../controllers/Admin/booking/bookingController');
const serviceController = require('../controllers/Admin/services/serviceController');
const driverController = require('../controllers/Admin/diver/DriverController');
const promoController = require('../controllers/Admin/promo/PromoController');
const mapController = require('../controllers/Admin/map/MapController');
const dashboardController = require('../controllers/Admin/dashboard/DashboardController');
const Authorization = require('../../polices/index');
const Upload = require('../../services/FileUploadService');
const express = require('express');
const { Router } = require('express');
const { AdminController } = require('../controllers/index');
const router = express.Router();

/*
ADMIN API'S
*/
router.post('/signUp', Controller.AdminController.register);
router.post('/signIn', Controller.AdminController.login);
router.post('/logout', Authorization.isUserAuth, Controller.AdminController.logout);
router.post('/getProfile', Authorization.isUserAuth, Controller.AdminController.getProfile);
router.post('/updateAdminProfile', Authorization.isUserAuth, Controller.AdminController.updateAdminProfile);
router.post('/changePassword', Authorization.isUserAuth, Controller.AdminController.changePassword);
router.post('/getAllVehicle', Authorization.isUserAuth, Controller.AdminController.getAllVehicle);
router.post('/forgotPassword', Controller.AdminController.forgotPassword);
router.post('/forgotChangePassword', Controller.AdminController.forgotChangePassword);
router.post('/uploadFile', Authorization.isUserAuth, Upload.driverDocument.single('image'), Controller.AdminController.uploadFile);
/*
DASHBOARD API'S
*/
router.get('/getDashboardCount', Authorization.isUserAuth, Controller.AdminController.getDashboardCount);
/*
USER API'S
*/

router.post('/registerUser', Authorization.isUserAuth, Upload.user.single('image'), Controller.AdminController.registerUser);
router.post('/updateUser', Authorization.isUserAuth, Upload.user.single('image'), Controller.AdminController.upadateUser)
router.post('/getAllUsers', Authorization.isUserAuth, Controller.AdminController.getAllUsers);
router.post('/getAllVehicleUser', Authorization.isUserAuth, Controller.AdminController.getAllVehicleUser);
router.post('/verifyBlockUnBlockDeltedUser', Authorization.isUserAuth, Controller.AdminController.verifyBlockUnBlockDeltedUser)
router.get('/exportDriverCsv', Controller.AdminController.exportDriverCsv);

/*
VEHICLE API'S
*/
router.post('/addVehicleType', Authorization.isUserAuth, Controller.AdminController.addVehicleType);
router.post('/editVehicleType', Authorization.isUserAuth, Controller.AdminController.editVehicleType);
router.post('/blockUnblockDeleteVehicleType', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteVehicleType);
router.get('/getVehicleType', Authorization.isUserAuth, Controller.AdminController.getVehicleType);
/*
SERVICE TYPE API'S
*/
router.post('/addServiceType', Authorization.isUserAuth, Upload.serviceType.single('image'), Controller.AdminController.addServiceType);
router.post('/editServiceType', Authorization.isUserAuth, Upload.serviceType.single('image'), Controller.AdminController.editServiceType);
router.post('/blockUnblockDeleteServiceType', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteServiceType);
router.get('/getServiceType', Authorization.isUserAuth, Controller.AdminController.getServiceType);
/*
BOOKING API'S
*/
router.post('/getAllBooking', Authorization.isUserAuth, Controller.AdminController.getAllBooking);
router.put('/editBooking/:id', Authorization.isUserAuth, Controller.AdminController.editBooking);
router.post('/getBookingDetails', Authorization.isUserAuth, Controller.AdminController.getBookingDetails);
router.post('/acceptedBookingStatus', Authorization.isUserAuth, Controller.AdminController.acceptedBookingStatus);
router.post('/acceptedCancelCompleteEventBookingStatus', Authorization.isUserAuth, Controller.AdminController.acceptedCancelCompleteEventBookingStatus);
router.get('/exportBookingCsv', Controller.AdminController.exportBookingCsv);
router.post('/createBooking', Controller.AdminController.createBooking);
router.post('/cancelBooking', Controller.AdminController.cancelBooking);

/*
NOTIFICATION API'S
*/
router.get('/getAllNotification', Authorization.isUserAuth, Controller.AdminController.getAllNotification);
router.post('/clearNotification', Authorization.isUserAuth, Controller.AdminController.clearNotification);
router.post('/clearAllNotification', Authorization.isUserAuth, Controller.AdminController.clearAllNotification);
/*
PROMO CODE API'S
*/
router.post('/addPromoCode', Authorization.isUserAuth, Controller.AdminController.addPromo);
router.post('/editPromoCode', Authorization.isUserAuth, Controller.AdminController.editPromoCode);
router.post('/deleteBlockPromoCode', Authorization.isUserAuth, Controller.AdminController.deleteBlockPromoCode);
router.get('/getAllPromoCode', Authorization.isUserAuth, Controller.AdminController.getAllPromo);

/*
REVENUE API'S
*/
router.post('/getRevenue', Authorization.isUserAuth, Controller.AdminController.getRevenue);
/*
DRIVER API'S
*/
router.post('/driverRegister', Authorization.isUserAuth, Upload.driver.single('image'), Controller.AdminController.driverRegister);
router.post('/updateDriverProfile', Authorization.isUserAuth, Upload.driver.single('image'), Controller.AdminController.updateDriverProfile);
router.post('/updateDocuments', Authorization.isUserAuth, Controller.AdminController.updateDocuments);
router.post('/getAllDrivers', Authorization.isUserAuth, Controller.AdminController.getAllDrivers);
router.post('/verifyBlockUnBlockDeltedDriver', Authorization.isUserAuth, Controller.AdminController.verifyBlockUnBlockDeltedDriver)
router.post('/getAllVehicleDriver', Authorization.isUserAuth, Controller.AdminController.getAllVehicleDriver);
router.post('/getAllAvailableDriver', Authorization.isUserAuth, Controller.AdminController.getAllAvailableDriver);
router.post('/addVehicle', Authorization.isUserAuth, Upload.vehicle.single('vehicleImage'), Controller.AdminController.addVehicle);
/*
TRANSMISSION TYPE API'S
*/
router.post('/addTransmissionType', Authorization.isUserAuth, Controller.AdminController.addTransmissionType);
router.post('/editTransmissionType', Authorization.isUserAuth, Controller.AdminController.editTransmissionType);
router.post('/blockUnblockDeleteTransmissionType', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteTransmissionType);
router.get('/getTransmissionType', Authorization.isUserAuth, Controller.AdminController.getTransmissionType);
/*
APPVERSION API'S
*/
router.post('/setAppVersion', Authorization.isUserAuth, Controller.AdminController.setAppVersion);
router.get('/getAppVersion', Controller.AdminController.getAppVersion);
/*
TEAM API'S
*/
router.post('/addTeam', Authorization.isUserAuth, Controller.AdminController.addTeam);
router.post('/editTeam', Authorization.isUserAuth, Controller.AdminController.editTeam);
router.post('/blockUnblockDeleteTeam', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteTeam);
router.get('/getTeam', Authorization.isUserAuth, Controller.AdminController.getTeam);
/*
EVENT TYPE API'S
*/
router.post('/addEventType', Authorization.isUserAuth, Controller.AdminController.addEventType);
router.post('/editEventType', Authorization.isUserAuth, Controller.AdminController.editEventType);
router.post('/blockUnblockDeleteEventType', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteEventType);
router.get('/getEventType', Authorization.isUserAuth, Controller.AdminController.getEventType);

router.post('/assignCoDriver', Authorization.isUserAuth, Controller.AdminController.assignCoDriver);

/*
STATE API'S
*/
// router.post('/addState', Authorization.isUserAuth, Controller.AdminController.addState);
// router.post('/editState', Authorization.isUserAuth, Controller.AdminController.editState);
// router.post('/blockUnblockDeleteState', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteState);
// router.get('/getState', Authorization.isUserAuth, Controller.AdminController.getState);
router.post('/getContactUs', Authorization.isUserAuth, Controller.AdminController.getContactUs);
// router.post('/sendBulkNotification', Authorization.isUserAuth, Controller.AdminController.sendBulkNotification);

/*
CITY API'S
*/
router.post('/addZipCode', Authorization.isUserAuth, Controller.AdminController.addZipCode);
router.post('/editZipCode', Authorization.isUserAuth, Controller.AdminController.editZipCode);
router.post('/blockUnblockDeleteCity', Authorization.isUserAuth, Controller.AdminController.blockUnblockDeleteCity);
router.post('/getZipCode', Authorization.isUserAuth, Controller.AdminController.getZipCode);


router.post('/getAllDriverPaymentHistory', Authorization.isUserAuth, Controller.AdminController.getAllDriverPaymentHistory);
router.post('/getPayoutDriver', Controller.AdminController.getPayoutDriver);



router.post('/createUserCard', Authorization.isUserAuth, Controller.AdminController.createUserCard);
router.post('/deleteCardFromAdmin', Authorization.isUserAuth, Controller.AdminController.deleteCardFromAdmin);







// ``````````````````````````````````````````

// NEW ROUTER FOR REACT JS  ADMIN 


// ``````````````````````````````````````````
router.get('/checkAdmin', Authorization.isUserAuth, userController.checkAdmin);
router.get('/checkEventManager', userController.checkEventManager);


//USER API
router.post('/createUserFromAdmin', Authorization.isUserAuth, userController.createUserFromAdmin);
router.get('/getAllUsers', Authorization.isUserAuth, userController.getUsers);
router.post('/userControl', Authorization.isUserAuth, userController.userControl);
router.get('/user/:id', Authorization.isUserAuth, userController.getUserById);
router.get('/userbooking/:id', Authorization.isUserAuth, userController.getUserBookingList);
router.get('/getUserDevice/:id', Authorization.isUserAuth, userController.getUserDevice);
router.get('/getUserCard/:id', Authorization.isUserAuth, userController.getUserCard);
router.get('/getUserVehicle/:id', Authorization.isUserAuth, userController.getUserVehicle);
router.post('/createUserCardFromAdmin', Authorization.isUserAuth, userController.createUserCard);
router.post('/deleteUserCard', Authorization.isUserAuth, userController.deleteUserCard);


//BOOKING
router.post('/bookingList', Authorization.isUserAuth, bookingController.getBookingList);
router.get('/viewBooking/:id', Authorization.isUserAuth, bookingController.viewBookingById);
router.get('/getBookingCardDetails/:id', Authorization.isUserAuth, bookingController.getBookingCardDetails);
router.get('/getRefundDetails/:id', Authorization.isUserAuth, bookingController.getRefundDetails);
router.post('/createBookingFromAdmin', Authorization.isUserAuth, bookingController.createBooking);
router.post('/assignRideByAdmin', Controller.AdminController.assignRideByAdmin);

//SERVICES
router.get('/getVehicleTypeById/:id', Authorization.isUserAuth, serviceController.getVehicleTypeById);
router.post('/addServicesType', Authorization.isUserAuth, serviceController.addServicesType);
router.get('/getAdminVehicle', Authorization.isUserAuth, serviceController.getAdminVehicle);


//DRIVER
router.get('/getDrivers', Authorization.isUserAuth, driverController.getDrivers);
router.get('/driver/:id', Authorization.isUserAuth, driverController.getDriverById);
router.get('/getDriverDevice/:id', Authorization.isUserAuth, driverController.getDriverDevice);
router.get('/driverbooking/:id', Authorization.isUserAuth, driverController.getDriverBookingList);
router.get('/getDriverVehicle/:id', Authorization.isUserAuth, driverController.getDriverVehicle);
router.get('/getDriverPayment/:id', Authorization.isUserAuth, driverController.getDriverPaymentList);
router.post('/getDriverBankDetail', Authorization.isUserAuth, driverController.getDriverBankDetail);
router.post('/unpairedDriver', Authorization.isUserAuth, driverController.unpairedDriver);


//PROMOCODE
router.get('/getPromocode', Authorization.isUserAuth, promoController.getPromocode);
router.get('/promo/:id', Authorization.isUserAuth, promoController.getPromoById);
router.post('/createPromo', Authorization.isUserAuth, promoController.createPromo);
router.get('/getPromoLogs/:id', Authorization.isUserAuth, promoController.getPromoLogs);
router.post('/updateAttempt', Authorization.isUserAuth, promoController.updateAttempt);
router.post('/deleteBlockPromo', Authorization.isUserAuth, promoController.deleteBlockPromo);


//MAP
router.get('/getDriversOnMap', Authorization.isUserAuth, mapController.getDriversOnMap);
router.get('/getBookingOnMap', Authorization.isUserAuth, mapController.getBookingOnMap);
router.get('/getPairedDriverOnMap', Authorization.isUserAuth, mapController.getPairedDriverOnMap);
router.get('/getActiveDriverLocation', Authorization.isUserAuth, mapController.getActiveDriverLocation);



//DASHBOARD
router.get('/userGraphData', dashboardController.userGraphData);
router.get('/driverGraphData', dashboardController.driverGraphData);
router.post('/bookingGraphData', dashboardController.bookingGraphData);
router.get('/driverStatusGraphData', dashboardController.driverStatusGraphData);
router.get('/deviceTypeGraphData', dashboardController.deviceTypeGraphData);
router.get('/transactionGraphData', dashboardController.transactionGraphData);
router.get('/earningGraphData', dashboardController.earningGraphData);
router.get('/promoGraphData', dashboardController.promoGraphData);
router.post('/sendBroadcastMailtoDrivers', Controller.DriverController.sendBroadcastMailtoDrivers);
router.get('/getDriverPaymentHistoryById/:id', Controller.AdminController.getDriverPaymentHistoryById);
router.post('/getAllDriverPaymentHistoryByChoice', Controller.AdminController.getAllDriverPaymentHistoryByChoice);
router.post('/usersWalletAmount', dashboardController.usersWalletAmount);
router.post('/addWalletAmtToUser', dashboardController.addWalletAmtToUser);
router.post('/walletGraphData', dashboardController.walletGraphData);
router.post('/walletAmtAddedList', dashboardController.walletAmtAddedList);

// EVENT MANAGER 

router.post('/createEventManager', Controller.AdminController.createEventManager);
router.post('/getAllEventManager', Controller.AdminController.getAllEventManager);
router.post('/editEventManager', Controller.AdminController.editEventManager);
router.post('/deleteEventManager', Controller.AdminController.deleteEventManager);
router.get('/getEventManagerById/:id', Controller.AdminController.getEventManagerById);
router.post('/removeEventManager/:id', Controller.AdminController.removeEventManager);
router.post('/getAllEventManagerList', Controller.AdminController.getAllEventManagerList);

//EVENT BOOKING

router.post('/eventDriverRate', Controller.AdminController.eventDriverRate);
router.get('/getDriverRate', Controller.AdminController.getDriverRate);
router.post('/getAllEventBooking', Controller.AdminController.getAllEventBooking);
router.get('/getEventBookingById/:id', Controller.AdminController.getEventBookingById);
router.post('/editEventBooking', Controller.AdminController.editEventBooking);
router.post('/assignEventManager', Controller.AdminController.assignEventManager);
router.post('/cancelEventBooking', Controller.AdminController.cancelEventBooking);
router.post('/getEventBookingList', Controller.AdminController.getEventBookingList);
router.get('/getEventDrivers', driverController.getEventDrivers);
router.get('/getEventCoDrivers', driverController.getEventCoDrivers);
router.get('/endEventBooking/:id', Controller.AdminController.endEventBooking);
router.post('/extraHoursAdded/:id', Controller.AdminController.extraHoursAdded);
router.post('/confirmEventBooking', Controller.AdminController.confirmEventBooking);

//TEAM BOOKING

router.post('/createTeam', Controller.AdminController.createTeam);
router.post('/createCoDriverTeam', Controller.AdminController.createCoDriverTeam);
router.post('/getTeamList', Controller.AdminController.getTeamList);
router.post('/getCoDriverTeamList', Controller.AdminController.getCoDriverTeamList);
router.post('/createTeamBooking', Controller.AdminController.createTeamBooking);
router.post('/editTeamBooking', Controller.AdminController.editTeamBooking);
router.post('/getAllTeamBookings', Controller.AdminController.getAllTeamBookings);
router.post('/getTeamBookingById/:id', Controller.AdminController.getTeamBookingById);
router.post('/deleteTeamBooking', Controller.AdminController.deleteTeamBooking);

module.exports = router;
