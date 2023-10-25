module.exports = {
    isValidContactUs(body) {
        if (
            !body.name ||
            !body.email ||
            !body.message ||
            !body.subject
        ) return true;
        return false;
    },
    isValidChargeWallet(body) {
        if (
            !body.cardId ||
            body.cardId.length != 24 ||
            !body.hasOwnProperty('amount') ||
            isNaN(body.amount)
        ) return true;
        return false;
    },
    isValidAddCard(body) {
        if (!body.stripePaymentMethod
        ) return true;
        return false;
    },
    isValidCardId(body) {
        if (
            !body.cardId ||
            body.cardId.length != 24
        ) return true;
        return false;
    },
    isValidCancelBooking(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24
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
    isForgotPasswordValid(body) {
        if (
            !body.otpId ||
            !body.otp ||
            !body.newPassword
        ) return true;
        return false;
    },
    isVerifyOtpValid(body) {
        if (
            !body.otpId ||
            !body.otp
        ) return true;
        return false;
    },
    isValidPromoCode(body) {
        if (!body.promoCode ||
            !body.hasOwnProperty('booKingAmount')
            // ||
            // !isNumber(body.booKingAmount)    
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
    isValidCreateBookingCheck(body) {
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
            !body.genderType ||
            !['MALE', 'FEMALE', 'NO_PREFRENCE'].includes(body.genderType)
        ) return true;
        return false;
    },
    isValidCreateEventBooking(body) {
        if (
            !body.hasOwnProperty('eventName') ||
            !body.hasOwnProperty('eventTypeId') ||
            (body.eventTypeId).length != 24 ||
            !body.hasOwnProperty('teamId') ||
            (body.teamId).length != 24 ||
            !body.hasOwnProperty('eventDescription') ||
            !body.hasOwnProperty('block') ||
            !body.hasOwnProperty('bookingDate') ||
            !body.eventAddress ||
            !body.hasOwnProperty('eventLocaltionLatitude') ||
            isNaN(body.eventLocaltionLatitude) ||
            !body.hasOwnProperty('eventLocaltionLongitude') ||
            isNaN(body.eventLocaltionLongitude)
        ) return true;
        return false;
    },
    isValidEditCancelEventBooking(body) {
        if (
            !body.hasOwnProperty('bookingId') ||
            (body.bookingId).length != 24
        ) return true;
        return false;
    },
    isValidBookings(body) {
        if (
            0
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
    isValidId(body) {
        if (
            !body._id ||
            (body._id).length != 24
        ) return true;
        return false;
    },
    isaddVehicleValid(body) {
        if (
            !body.vehicleName ||
            !body.transmissionTypeId

        ) return true;
        return false;
    },
    isaddBankValid(body) {
        if (
            !body.name ||
            !body.accountNumber ||
            !body.ban
        ) return true;
        return false;
    },
    isgetBankValid(body) {
        if (
            !body.driverId
        ) return true;
        return false;
    },
    isDeleteVehicleValid(body) {
        if (
            !body._id ||
            body._id.length != 24
        ) return true;
        return false;
    },
    isSignUpValid(body) {
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
    isSocialValid(body) {
        if (
            !body.firstName ||
            !body.lastName ||
            !body.productId
        ) return true;
        return false;
    },
    isSignInValid(body) {
        if (!body.phone || !body.password) return true;
        return false;
    },
    isSocialLoginInValid(body) {
        if (!body.providerId || !body.provider) return true;
        return false;
    },
    isChangePasswordValid(body) {
        if (!body.oldPassword || !body.newPassword) return true;
        return false;
    },
    isResetPasswordValidate(body) {
        if (!body.password || !body.id) return true;
        return false;
    },
    isAddToCartValid(body) {
        if (
            !body.productId ||
            (!body.quantity || body.quantity <= 0) ||
            (!body.amount || body.amount <= 0)
        ) return true;
        return false;
    },
    isAddAddressValid(body) {
        if (
            !body.address1 ||
            !body.address2 ||
            !body.state ||
            !body.city ||
            !body.postalCode ||
            !body.name ||
            !body.phone ||
            !body.addressType
        ) return true;
        return false;
    },
    isPlaceOrderValid(body) {
        if (
            !body.products.length ||
            !body.paymentMethod ||
            !body.deliveryAddress
        ) return true;
        return false;
    },
    isAddBidValid(body) {
        if (
            !body.productId ||
            (!body.amount || body.amount <= 0)
        ) return true;
        return false;
    },
    isAddTip(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24 ||
            !body.isTipPr
        ) return true;
        return false;
    },
    isDriverLocation(body) {
        if (
            !body.longitude ||
            !body.latitude
        ) return true;
        return false;
    }
};
