module.exports = {
    isValidId(body) {
        if (
            !body._id ||
            (body._id).length != 24
        ) return true;
        return false;
    },
    isValidLatLong(body) {
        if (
            !body.hasOwnProperty('latitude') ||
            isNaN(body.latitude) ||
            !body.hasOwnProperty('longitude') ||
            isNaN(body.longitude)
        ) return true;
        return false;
    },
    isChangePasswordValid(body) {
        if (!body.oldPassword || !body.newPassword) return true;
        return false;
    },
    isValidDriverAcceptBooking(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24
        ) return true;
        return false;
    },
    isValidAddCoDriverOnRide(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24
        ) return true;
        return false;
    },
    isValidDriverIgnoreBooking(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24
        ) return true;
        return false;
    },
    isValidChangeBookingStatus(body) {
        if (
            !body.bookingId ||
            body.bookingId.length != 24 ||
            !body.bookingStatus ||
            !['COMPLETED', 'ARRIVED', 'STARTED', 'ONGOING', 'CANCELED', 'ACCEPTED'].includes(body.bookingStatus)
        ) return true;
        return false;
    },
    isaddFavoriteValid(body) {
        if (
            !body.favoriteDriverId ||
            body.favoriteDriverId.length != 24 ||
            !body.hasOwnProperty('isFavorite')
        ) return true;
        return false;
    },
    isaddPairedDriverValid(body) {
        if (
            !body.otp ||
            !body.pairedDriverId ||
            body.pairedDriverId.length != 24
        ) return true;
        return false;
    },
    isaskPairedDriverValid(body) {
        if (
            !body.pairedDriverId ||
            body.pairedDriverId.length != 24
        ) return true;
        return false;
    },
    isRemovePairedDriverValid(body) {
        if (
            !body.pairedDriverId ||
            body.pairedDriverId.length != 24
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
    isaddVehicleValid(body) {
        if (
            !body.vehicleMake ||
            !body.vehicleModel ||
            !body.vehicleTypeId ||
            body.vehicleTypeId.length != 24
            // !body.transmissionTypeId ||
            // body.transmissionTypeId.length != 24 ||
            // !body.vehicleImage
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
    isLoginValid(body) {
        if (!body.email || !body.password) return true;
        return false;
    },
    isVerifyOtpValid(body) {
        if (
            !body.otpId ||
            !body.otp
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
    isEditBankValid(body) {
        if (!body._id) return true;
        return false;
    },
};