module.exports = {
  isSendNotificationValid(body) {
    if (
      !body.message ||
      !body.title ||
      !body.messageType ||
      !['SMS', 'PUSH'].includes(body.messageType)
    ) return true;
    return false;
  },
  isaddVehicleValid(body) {
    if (
      !body.vehicleMake ||
      !body.vehicleModel ||
      !body.vehicleTypeId ||
      body.vehicleTypeId.length != 24 ||
      !body.transmissionTypeId ||
      body.transmissionTypeId.length != 24 ||
      !body.vehicleImage
    ) return true;
    return false;
  },
  isUserSignUpValid(body) {
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password ||
      !body.gender ||
      !body.genderType ||
      !['MALE', 'FEMALE', 'NO_PREFRENCE'].includes(body.genderType)
    ) return true;
    return false;
  },
  isDriverRegValid(body) {
    if (
      !body.firstName ||
      !body.lastName ||
      !body.gender ||
      !body.email ||
      !body.phone ||
      !body.password ||
      !body.countryCode ||
      !body.carStatus ||
      !body.latitude ||
      !body.longitude ||
      !body.genderType ||
      !['MALE', 'FEMALE', 'NO_PREFRENCE'].includes(body.genderType)
    ) return true;
    return false;
  },
  isValidForgotPassword(body) {
    if (
      !body.email ||
      !body.hasOwnProperty('email')
    ) return true;
    return false;
  },
  isValidForgotChangePassword(body) {
    if (
      !body.passwordResetToken ||
      !body.hasOwnProperty('passwordResetToken') ||
      !body.password ||
      !body.hasOwnProperty('password')
    ) return true;
    return false;
  },
  isValidAddEventType(body) {
    if (
      !body.eventName ||
      !body.hasOwnProperty('eventName')
    ) return true;
    return false;
  },
  isValidEditEventType(body) {
    if (
      !body._id ||
      (body._id).length != 24 ||
      !body.eventName ||
      !body.hasOwnProperty('eventName')
    ) return true;
    return false;
  },
  isValidAddTeam(body) {
    if (
      !body.teamName ||
      !body.hasOwnProperty('teamMembers') ||
      isNaN(body.teamMembers)
    ) return true;
    return false;
  },
  isValidEditTeam(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidAddState(body) {
    if (
      !body.stateName
    ) return true;
    return false;
  },
  isValidEditState(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidAddCity(body) {
    if (
      !body.zipCode
    ) return true;
    return false;
  },
  isValidEditCity(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidUserCard(body) {
    if (
      !body.userId ||
      (body.userId).length != 24 ||
      !body.cardNumber ||
      !body.cardExpMonth ||
      !body.cardExpYear ||
      !body.cardCvv
    ) return true;
    return false;
  },
  isValiDeleteCard(body) {
    if (
      !body.userId ||
      (body.userId).length != 24 ||
      !body.cardId
    ) return true;
    return false;
  },
  isValidAppVersion(body) {
    // !body.hasOwnProperty('latestIOSVersion') ||
    //     isNaN(body.latestIOSVersion) ||
    //     !body.hasOwnProperty('latestAndroidVersion') ||
    //     isNaN(body.latestAndroidVersion) ||
    //     !body.hasOwnProperty('criticalAndroidVersion') ||
    //     isNaN(body.criticalAndroidVersion) ||
    //     !body.hasOwnProperty('criticalIOSVersion') ||
    //     isNaN(body.criticalIOSVersion) ||
    //     !body.hasOwnProperty('latestWebID') ||
    //     isNaN(body.latestWebID) ||
    //     !body.hasOwnProperty('criticalWebID') ||
    //     isNaN(body.criticalWebID) ||
    //     !body.hasOwnProperty('updateMessageAtPopup') ||
    //     !body.hasOwnProperty('updateTitleAtPopup')||
    //     !body.hasOwnProperty('latestDriverIOSVersion') ||
    //     isNaN(body.latestDriverIOSVersion) ||
    //     !body.hasOwnProperty('latestDriverAndroidVersion') ||
    //     isNaN(body.latestDriverAndroidVersion) ||
    //     !body.hasOwnProperty('criticalDriverAndroidVersion') ||
    //     isNaN(body.criticalDriverAndroidVersion) ||
    //     !body.hasOwnProperty('criticalDriverIOSVersion') ||
    //     isNaN(body.criticalDriverIOSVersion) ||
    //     !body.hasOwnProperty('driverUpdateMessageAtPopup') ||
    //     !body.hasOwnProperty('driverUpdateTitleAtPopup') ||

    if (
      !body.hasOwnProperty('aboutUs') ||
      !body.hasOwnProperty('contactUs') ||
      !body.hasOwnProperty('termsAndCondition') ||
      !body.hasOwnProperty('driverAboutUs') ||
      !body.hasOwnProperty('driverContactUs') ||
      !body.hasOwnProperty('driverTermsAndCondition')
    ) return true;
    return false;
  },
  isValidId(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidChangeEventBookingStatus(body) {
    if (
      !body.bookingId ||
      body.bookingId.length != 24 ||
      !body.bookingStatus ||
      !['COMPLETED', 'CANCELED', 'ACCEPTED'].includes(body.bookingStatus)
    ) return true;
    return false;
  },
  isValidDriverAcceptBooking(body) {
    if (
      !body.bookingId ||
      body.bookingId.length != 24,
      !body.driverId ||
      body.driverId.length != 24
    ) return true;
    return false;
  },
  isValidBookingId(body) {
    if (
      !body.bookingId ||
      (body.bookingId).length != 24
    ) return true;
    return false;
  },
  isValidDriverId(body) {
    if (
      !body.driverId ||
      (body.driverId).length != 24
    ) return true;
    return false;
  },
  isValidUserId(body) {
    if (
      !body.userId ||
      (body.userId).length != 24
    ) return true;
    return false;
  },
  isValidId(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidPromoCode(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isUpdateAttemptPromoCode(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidAddVehicleType(body) {
    if (
      !body.vehicleTypeName
    ) return true;
    return false;
  },
  isValidEditVehicleType(body) {
    if (
      !body.vehicleTypeName ||
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidAddTransmissionType(body) {
    if (
      !body.transmissionTypeName
    ) return true;
    return false;
  },
  isValidEditTransmissionType(body) {
    if (
      !body.transmissionTypeName ||
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidAddServiceType(body) {
    if (
      !body.serviceName
    ) return true;
    return false;
  },
  isValidEditServiceType(body) {
    if (
      !body.serviceName ||
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidEditEventManager(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidEditEventBooking(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidEditTeamBooking(body){
    if(
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isValidBookingDetails(body) {
    if (
      !body._id ||
      (body._id).length != 24
    ) return true;
    return false;
  },
  isAdminRegValid(body) {
    if (
      !body.name ||
      !body.email ||
      !body.password
    ) return true;
    return false;
  },
  isEventMangrRegValid(body) {
    if (
      !body.name ||
      !body.phone ||
      !body.password ||
      !body.email ||
      !body.countryCode
    ) return true;
    return false;
  },
  isEventBookingValid(body) {
    if (
      !body.firstName ||
      !body.lastName ||
      !body.phone ||
      !body.driver ||
      !body.email ||
      !body.countryCode ||
      !body.pickUplatitude ||
      !body.pickUplongitude ||
      !body.pickUpAddress 
      // !body.noOfHours
      ) return true;
    return false;
  },
  isValidCreateTeamBooking(body) {
    if (
        // !body.seviceTypeId ||
        // (body.seviceTypeId).length != 24 ||
        !body.hasOwnProperty('dropUplatitude') ||
        isNaN(body.dropUplatitude) ||
        !body.hasOwnProperty('dropUplongitude') ||
        isNaN(body.dropUplongitude) ||
        !body.dropUpAddress ||
        !body.bookingDate ||
        !body.tripType ||
        !body.firstName ||
        !body.lastName ||
        !body.phoneNo ||
        !['ROUNDTRIP', 'SINGLETRIP'].includes(body.tripType) ||
        !body.hasOwnProperty('totalDistance') ||
        isNaN(body.totalDistance)
    ) return true;
    return false;
  },
  isValidCancelTeamBooking(body) {
    if (
        !body.bookingId ||
        body.bookingId.length != 24
    ) return true;
    return false;
  },
  isLoginValid(body) {
    if (!body.email || !body.password) return true;
    return false;
  },
  isAddCatValid(req) {
    if (!req.body.name || !req.file) return true;
    return false;
  },
  isEditCatValid(body) {
    if (!body.id || !body.name) return true;
    return false;
  },
  isAddProductValid(req) {
    if (
      !req.body.name ||
      !req.body.description ||
      (!req.body.purchaseQuantity || req.body.purchaseQuantity < '1') ||
      !req.body.category ||
      (!req.body.productQuantity || req.body.productQuantity < '1')
    ) return true;
    return false;
  },
  isEditProductValid(body) {
    if (
      !body.id
    ) return true;
    return false;
  },
  isAddVariantValid(req) {
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.category
    ) return true;
    return false;
  },
  isEditVariantValid(body) {
    if (
      !body.id
    ) return true;
    return false;
  },
  isAddBrandValid(req) {
    if (!req.body.name || !req.file) return true;
    return false;
  },
  isEditBrandValid(body) {
    if (!body.id || !body.name) return true;
    return false;
  },
  isAddSubCatValid(req) {
    if (
      !req.body.name ||
      !req.body.category ||
      !req.file
    ) return true;
    return false;
  },
  isEditSubCatValid(body) {
    if (!body.name || !body.id || !body.category) return true;
    return false;
  },
  isAddBannerValid(req) {
    if (
      !req.body.name ||
      !req.body.type ||
      !req.file
    ) return true;
    return false;
  },
  isEditBannerValid(body) {
    if (!body.name || !body.id) return true;
    return false;
  },
  isAddSettingValid(body) {
    if (
      !body.appHome.length
    ) return true;
    return false;
  },
  isAddCouponValid(body) {
    if (
      !body.name ||
      !body.discount ||
      !body.startDate ||
      !body.endDate ||
      !body.type
    ) return true;
    return false;
  },
  isAddSellerValid(body) {
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.password ||
      !body.phone ||
      !body.city ||
      !body.address
    ) return true;
    return false;
  },
  isAddDriverValid(body) {
    if (
      !body.firstName ||
      !body.lastName ||
      !body.email ||
      !body.phone ||
      !body.password ||
      !body.address ||
      !body.city
    ) return true;
    return false;
  },
  getPayoutDriver(body) {
    if (
      !body.amount ||
      !body.stripeDriverId ||
      !body.driverId
    ) return true;
    return false;
  },
  isValidCreateBooking(body) {
    if (
      !body.vehicleId ||
      (body.vehicleId).length != 24 ||
      !body.seviceTypeId ||
      (body.seviceTypeId).length != 24 ||
      !body.hasOwnProperty('pickUplatitude') ||
      isNaN(body.pickUplatitude) ||
      !body.hasOwnProperty('pickUplongitude') ||
      isNaN(body.pickUplongitude) ||
      !body.hasOwnProperty('dropUplatitude') ||
      isNaN(body.dropUplatitude) ||
      !body.hasOwnProperty('dropUplongitude') ||
      isNaN(body.dropUplongitude) ||
      !body.pickUpAddress ||
      !body.dropUpAddress ||
      !body.bookingDate ||
      !body.tripType ||
      !['ROUNDTRIP', 'SINGLETRIP'].includes(body.tripType) ||
      !body.timezone ||
      !body.hasOwnProperty('totalDistance') ||
      isNaN(body.totalDistance) ||
      !body.paymentMode ||
      !['CASH', 'CARD', 'WALLET'].includes(body.paymentMode) ||
      !body.genderType ||
      !['MALE', 'FEMALE', 'NO_PREFRENCE'].includes(body.genderType)
    ) return true;
    return false;
  },
};
