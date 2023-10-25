const Model = require("../../../../models/index");
const Service = require("../../../../services/index");
const Constant = require("../../../../Constant");
const Validation = require("../../../Validations/index");
const driverController = require("../../DriverController");
const userController = require("../../UserController");
const moment = require("moment");
const mongoose = require("mongoose");
const stripePay = require("stripe");
const randomstring = require("randomstring");
const config = require("../../../../config/config");
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);

//UTILES

//GENERATE RANDOM STRING
const generateRandomString = (noOfChars) => {
  return randomstring.generate(noOfChars);
};

// STRIPE API FORM DEC CARD MONEY FROM USER CARD
const chargeStrip = async (opts) => {
  let response = { status: false, data: {} };
  try {
    if (opts.amount < 0.5) {
      opts.amount = 0.5;
    }
    opts.amount = parseFloat(opts.amount.toFixed(2));
    let obj = {
      amount: opts.amount * 100,
      currency: opts.currency || "usd",
      customer: opts.stripeCustomerId,
      payment_method: opts.stripePaymentMethod,
      confirm: true,
      off_session: true,
      payment_method_types: ["card"],
      capture_method: opts.hold_payment ? "manual" : "automatic",
      description: opts.description || "",
    };
    if (opts.receiptEmail) {
      obj.receipt_email = opts.receiptEmail;
    }
    // console.log("ammount####", obj)
    let chargeData = await stripe.paymentIntents.create(obj);

    if (chargeData && chargeData.id) {
      response.data.paymentId = chargeData.id;
      response.data.amount = chargeData.amount;
      response.data.captureMethod = chargeData.capture_method;
      response.data.stripeCustomerId = chargeData.customer;
      response.data.chargeId = chargeData.charges.data[0].id;
      response.status = true;
      return response;
    } else {
      return response;
    }
  } catch (error) {
    return response;
  }
};

//CREATE PROMOLOG IF PROMOCODE USER
const PromoLogCreate = async (promoBody) => {
  try {
    const promo = {
      bookingId: promoBody.bookingId,
      promoId: promoBody.promoId,
      userId: promoBody.userId,
    };
    //ADD LOG
    const promoLog = await new Model.PromoLog(promo).save();
    if (promoLog) {
      //UPDATE PROMOCODE
      await Model.PromoCode.update(
        { _id: mongoose.Types.ObjectId(promoBody.promoId) },
        { $inc: { promoAttempt: -1 } }
      );
    }
    //GET PROMOCODE FOR DECRESING NO OF USE
    const promoCodeData = await Model.PromoCode.findOne({
      _id: mongoose.Types.ObjectId(promoBody.promoId),
      isBlocked: false,
      isDeleted: false,
    });
    //IF NO OF USE === 0 DELETE PROMOCODE
    if (promoCodeData.promoAttempt === 0) {
      await Model.PromoCode.findOneAndUpdate(
        { _id: promoBody.promoId },
        { isBlocked: true, isDeleted: true }
      );
    }
  } catch (error) {
    console.log(error);
    return res.serverError(Constant.serverError);
  }
};

//UTILES END

//USER LIST
let getBookingList = async (req, res) => {
  try {
    const query = { isDeleted: false };
    let pipeline = [];
    //FOR PAGINATION
    const limit = parseInt(req.body.limit) || 10;
    const page = parseInt(req.body.page) || 1;
    //CHECK FOR ISBLOKED
    if (req.body.isBlocked) {
      query.isBlocked = req.body.isBlocked;
      pipeline.push({ $match: { isBlocked: req.body.isBlocked } });
    }
    //CHECK FOR UPCOMMING BOOKING
    if (req.body.isUpcommingbookings) {
      query.isSheduledBooking = true;
      query.bookingStatus = { $nin: ["COMPLETED", "CANCELED"] };
      pipeline.push({ $match: { isSheduledBooking: true } });
      pipeline.push({
        $match: { bookingStatus: { $nin: ["COMPLETED", "CANCELED"] } },
      });
    }
    //CHECK FOR PAST BOOKING
    if (req.body.isPastbookings) {
      query.bookingStatus = { $in: ["COMPLETED", "CANCELED"] };
      pipeline.push({
        $match: { bookingStatus: { $in: ["COMPLETED", "CANCELED"] } },
      });
    }
    //CHECK FOR PAYMENT STATUS
    if (req.body.paymentStatus) {
      query.paymentStatus = req.body.paymentStatus.toUpperCase();
      pipeline.push({
        $match: { paymentStatus: req.body.paymentStatus.toUpperCase() },
      });
    }
    //GET BOOKING LIST FROM DRIVER
    if (req.body.driverId) {
      query.$or = [
        { driverId: mongoose.Types.ObjectId(req.body.driverId) },
        { coDriverId: mongoose.Types.ObjectId(req.body.driverId) },
      ];
      pipeline.push({
        $match: {
          $or: [
            { driverId: mongoose.Types.ObjectId(req.body.driverId) },
            { coDriverId: mongoose.Types.ObjectId(req.body.driverId) },
          ],
        },
      });
    }
    //GET BOOKING LIST FROM USER
    if (req.body.userId) {
      query.userId = mongoose.Types.ObjectId(req.body.userId);
      pipeline.push({
        $match: { userId: mongoose.Types.ObjectId(req.body.userId) },
      });
    }
    //CHECK FOR EVETBOOKIN
    if (
      req.body.isEventBooking != undefined &&
      req.body.isEventBooking != null
    ) {
      query.isEventBooking = req.body.isEventBooking ? true : false;
      pipeline.push({ $match: { isEventBooking: query.isEventBooking } });
    }
    if (req.body._id && req.body._id.length == 24) {
      query._id = req.body._id;
      pipeline.push({ $match: { _id: mongoose.Types.ObjectId(req.body._id) } });
    }
    if (req.body.search != "" && isNaN(req.body.search)) {
      req.body.search = "";
    }
    //SEARCH FROM BOOKING NUMBER
    if (req.body.search != "") {
      query.$or = [
        {
          bookingNo: parseInt(req.body.search),
        },
      ];
    }
    //SEARCH FROM BOOKING NUMBER
    if (req.body.search != "") {
      pipeline.push({
        $match: {
          $or: [{ bookingNo: parseInt(req.body.search) }],
        },
      });
    }
    //FILTER BOOKING FROM DATE
    if (req.body.startDate != "" && req.body.endDate != "") {
      pipeline.push({
        $match: {
          $or: [
            {
              createdAt: {
                $gte: new Date(req.body.startDate),
                $lte: new Date(req.body.endDate),
              },
            },
          ],
        },
      });
    }
    //CREATE PIPELINE FOR BOOKING LIST
    pipeline.push(
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $lookup: {
          from: "transmissiontypes",
          localField: "transmissionTypeId",
          foreignField: "_id",
          as: "transmissionTypeData",
        },
      },
      {
        $lookup: {
          from: "eventtypes",
          localField: "eventTypeId",
          foreignField: "_id",
          as: "eventTypeData",
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "teamId",
          foreignField: "_id",
          as: "teamData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "driverId",
          foreignField: "_id",
          as: "driverData",
        },
      },
      {
        $lookup: {
          from: "drivers",
          localField: "coDriverId",
          foreignField: "_id",
          as: "coDriverData",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicleData",
        },
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "userVehicleId",
          foreignField: "_id",
          as: "userVehicleData",
        },
      },
      {
        $lookup: {
          from: "servicetypes",
          localField: "seviceTypeId",
          foreignField: "_id",
          as: "seviceTypeData",
        },
      },
      {
        $project: {
          vehicleId: 1,
          vehicleTypeId: 1,
          userVehicleId: 1,
          bookingNo: 1,
          adminId: 1,
          userId: 1,
          driverId: 1,
          teamId: 1,
          eventTypeId: 1,
          seviceTypeId: 1,
          coDriverId: 1,
          seviceTypeData: { $arrayElemAt: ["$seviceTypeData", 0] },
          userData: { $arrayElemAt: ["$userData", 0] },
          driverData: { $arrayElemAt: ["$driverData", 0] },
          vehicleData: { $arrayElemAt: ["$vehicleData", 0] },
          userVehicleData: { $arrayElemAt: ["$userVehicleData", 0] },
          coDriverData: { $arrayElemAt: ["$coDriverData", 0] },
          eventTypeData: { $arrayElemAt: ["$eventTypeData", 0] },
          teamData: { $arrayElemAt: ["$teamData", 0] },
          booKingAmount: 1,
          promoAmount: 1,
          totalDistance: 1,
          tripType: 1,
          note: 1,
          transmissionTypeData: { $arrayElemAt: ["$transmissionTypeData", 0] },
          dropUplatitudeFirst: 1,
          dropUplongitudeFirst: 1,
          dropUpAddressFirst: 1,
          isCompleteByCustomer: 1,
          dropUplatitudeSecond: 1,
          dropUplongitudeSecond: 1,
          dropUpAddressSecond: 1,
          dropUplatitudeThird: 1,
          dropUplongitudeThird: 1,
          dropUpAddressThird: 1,
          dropUplatitudeFour: 1,
          dropUplongitudeFour: 1,
          dropUpAddressFour: 1,
          passengerNo: 1,
          pickUplatitude: 1,
          pickUplongitude: 1,
          dropUplatitude: 1,
          dropUplongitude: 1,
          pickUpAddress: 1,
          dropUpAddress: 1,
          bookingDate: 1,
          sheduledDate: 1,
          bookingStatus: 1,
          isAutoAllocated: 1,
          assignBy: 1,
          isSheduledBooking: 1,
          isCanceledByDriver: 1,
          isCanceledByCustomer: 1,
          isCanceledByAdmin: 1,
          isDriverRated: 1,
          isCustomerRated: 1,
          driverRating: 1,
          customerRating: 1,
          driverReview: 1,
          customerReview: 1,
          isDriverReviewed: 1,
          isCustomerReviewed: 1,
          totalAmount: 1,
          pendingAmount: 1,
          promoAmount: 1,
          booKingAmount: 1,
          promoAmount: 1,
          timezone: 1,
          eventName: 1,
          eventDescription: 1,
          block: 1,
          eventLocaltionLatitude: 1,
          eventLocaltionLongitude: 1,
          eventAddress: 1,
          isEventBooking: 1,
          isadminAccept: 1,
          isCanceledByAdmin: 1,
          eta: 1,
          totalDistanceInKm: 1,
          paymentStatus: 1,
          createdAt: 1,
        },
      }
    );
    //GET DATA FROM MONGOOSE
    const BookingList = await Model.Booking.aggregate(pipeline)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Model.Booking.countDocuments(query);
    const result = {
      BookingList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
    let apiResponse = Service.generate.generate(true, "Success", 200, result);
    res.send(apiResponse);
  } catch (err) {
    let apiResponse = Service.generate.generate(true, "Error", 500, err);
    res.send(apiResponse);
  }
};

//USER VIEW BY ID

// let getBookingList = async (req, res) => {
//     try {
//         const query = { isDeleted: false };
//         const limit = parseInt(req.body.limit) || 10;
//         const skip = parseInt(req.body.skip) || 0;
//         const page = parseInt(req.body.page) || 1;
//         const search = req.body;
//         let filter = [];
//         filter.push({ $or: [{}] });
//         filter.push({ $or: [{ __v:  0 }] });
//         if (search.bookingNo) filter.push({ $or: [{ bookingNo:  search.bookingNo }] });
//         if (search.eventName) filter.push({ $or: [{ eventName:  search.eventName }] });
//         const count = await Model.EventBooking.countDocuments().and(filter)
//         const offer = await Model.EventBooking.find()
//           .and(filter)
//           .sort({ createdAt: -1 })
//           .limit(limit * 1)
//           .skip((page - 1) * limit)
//         let data = offer;
//         return res.ok(true, 'SUCCESS', {
//             totalPages: Math.ceil(count / limit),
//             count: count,
//             currentPage: parseInt(page),
//             limit: parseInt(limit),
//             data,
//         });

//     } catch (error) {
//         return res.ok(false, Constant.error, error);
//     }
// }

let viewBookingById = (req, res) => {
  Model.Booking.findById(req.params.id, (err, result) => {
    if (err) {
      let apiResponse = Service.generate.generate(true, "Error", 500, err);
      res.send(apiResponse);
    } else if (result == undefined || result == null || result == "") {
      let apiResponse = Service.generate.generate(
        true,
        "No booking Found",
        500,
        null
      );
      res.send(apiResponse);
    } else {
      let apiResponse = Service.generate.generate(true, "Success", 200, result);
      res.send(apiResponse);
    }
  }).populate([
    { path: "seviceTypeId" },
    { path: "userId" },
    { path: "userVehicleId" },
    { path: "driverId" },
    { path: "vehicleId" },
    { path: "promoId" },
  ]);
  // .populate({ path: 'userId' })
};

//BOOKING CARD DETAILS
let getBookingCardDetails = (req, res) => {
  Model.Transaction.findOne({ bookingId: req.params.id }, (err, result) => {
    if (err) {
      let apiResponse = Service.generate.generate(true, "Error", 500, err);
      res.send(apiResponse);
    } else if (result == undefined || result == null || result == "") {
      let apiResponse = Service.generate.generate(
        true,
        "No Transaction Found",
        500,
        null
      );
      res.send(apiResponse);
    } else {
      let apiResponse = Service.generate.generate(true, "Success", 200, result);
      res.send(apiResponse);
    }
  }).populate({ path: "cardId" });
};

//BOOKING REFUND DETAILS
let getRefundDetails = (req, res) => {
  Model.Refund.findOne({ bookingId: req.params.id }, (err, result) => {
    if (err) {
      let apiResponse = Service.generate.generate(true, "Error", 500, err);
      res.send(apiResponse);
    } else if (result == undefined || result == null || result == "") {
      let apiResponse = Service.generate.generate(
        true,
        "No Refund Found",
        500,
        null
      );
      res.send(apiResponse);
    } else {
      let apiResponse = Service.generate.generate(true, "Success", 200, result);
      res.send(apiResponse);
    }
  }).populate({ path: "cardId" });
};

//CREATE BOOKING FOR USER
let createBooking = async (req, res) => {
  try {
    const promoCodeData = null;
    const isPromoApply = false;
    const promoUserdId = "";
    const promoAmount = 0;
    const isSharePercentageDriverCoDriver = false;
    //VALIDATION
    if (Validation.isAdminValidate.isValidCreateBooking(req.body)) {
      return res.ok(false, Constant.required, {});
    } else {
      //CHECK FOR ADMIN DATA
      const adminData = await Model.Admin.findOne({
        isDeleted: false,
        isBlocked: false,
      });
      if (!adminData) {
        return res.ok(false, Constant.userNotFound, null);
      }
      //CHECK FOR USER
      const userData = await Model.User.findOne({ _id: req.body.userId });
      if (!userData) {
        return res.ok(false, Constant.userNotFound, null);
      } else {
        //CALCU DISTANCE FOR RIDE
        if (req.body.totalDistance) {
          req.body.totalDistanceInKm =
            parseFloat(req.body.totalDistance) / 1609;
        } else {
          req.body.totalDistanceInKm = 0;
        }

        //IS SHEDULED BOOKING
        if (!req.body.isSheduledBooking) {
          req.body.bookingDate = moment(req.body.bookingDate).utc();
          req.body.isTripAllocated = false;
        }

        //VALIDATION FOR SHEDULED BOOKING
        if (
          req.body.isSheduledBooking &&
          req.body.bookingDate &&
          (new Date(req.body.bookingDate) == "Invalid Date" ||
            moment().diff(req.body.bookingDate, "seconds") > 0)
        ) {
          return res.ok(false, Constant.backDateNotAllowed, {});
        }
        req.body.bookingLocalDate = moment(req.body.bookingDate).add(
          req.body.timezone || 330,
          "m"
        );

        //CHECK FOR SERVICE TYPE
        const serviceData = await Model.ServiceType.findOne({
          _id: req.body.seviceTypeId,
          isDeleted: false,
          isBlocked: false,
        });
        if (!serviceData) {
          return res.ok(false, Constant.serviceTypeNotFound, null);
        }

        //CHECK FOR VEHICLE DATA
        let vehicleData = await Model.Vehicle.findOne({
          _id: req.body.vehicleId,
          isDeleted: false,
          isBlocked: false,
        });
        if (!vehicleData) {
          return res.ok(false, Constant.vehicleNotFound, null);
        } else {
          req.body.userVehicleId = vehicleData._id;
          req.body.userVehicleTypeId = vehicleData.vehicleTypeId;
          req.body.userTransmissionTypeId = vehicleData.transmissionTypeId;
          delete req.body.vehicleId;
        }

        //IF PROMOCODE USED
        if (req.body.promoCode) {
          promoCodeData = await Model.PromoCode.findOne({
            promoCode: req.body.promoCode,
            isBlocked: false,
            isDeleted: false,
          });
          if (promoCodeData) {
            if (
              promoCodeData.noOfPromoUsers &&
              promoCodeData.individualUserPromoAttempt
            ) {
              const promoCountUsed = await Model.Booking.countDocuments({
                promoId: mongoose.Types.ObjectId(promoCodeData._id),
              });
              if (promoCountUsed >= promoCodeData.noOfPromoUsers) {
                return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
              }
              const promoCountUsedByUser = await Model.Booking.countDocuments({
                userId: mongoose.Types.ObjectId(req.body.userId),
                promoId: mongoose.Types.ObjectId(promoCodeData._id),
              });
              if (
                promoCountUsedByUser >= promoCodeData.individualUserPromoAttempt
              ) {
                return res.ok(false, Constant.promoCodeAlreadyInUsed, null);
              }
            }
            if (promoCodeData.isExpireDateAdded && promoCodeData.expireDate) {
              if (moment(promoCodeData.expireDate).diff(moment().utc()) < 1) {
                return res.ok(false, Constant.promoCodeExpired, null);
              }
            }
            req.body.isPromoApply = true;
            isPromoApply = true;
            promoUserdId = promoCodeData._id;
            req.body.promoId = promoCodeData ? promoCodeData._id : null;
          } else {
            return res.ok(false, Constant.inValidPromoCode, null);
          }
        }

        //COORDINATES FOR BOOKING RIDE
        let pickUpCoordinates = [];
        let pickUpLocation = {};
        if (req.body.pickUplatitude && req.body.pickUplongitude) {
          pickUpCoordinates.push(Number(req.body.pickUplongitude));
          pickUpCoordinates.push(Number(req.body.pickUplatitude));
          pickUpLocation.type = "Point";
          pickUpLocation.coordinates = pickUpCoordinates;
          req.body.pickUpLocation = pickUpLocation;
        }
        if (req.body.pickUpAddress) {
          req.body.pickUpAddress = req.body.pickUpAddress;
        }
        let droupUpCoordinates = [];
        let droupUpLocation = {};
        if (req.body.dropUplatitude && req.body.dropUplongitude) {
          droupUpCoordinates.push(Number(req.body.dropUplongitude));
          droupUpCoordinates.push(Number(req.body.dropUplatitude));
          droupUpLocation.type = "Point";
          droupUpLocation.coordinates = droupUpCoordinates;
          req.body.droupUpLocation = droupUpLocation;
        }
        if (req.body.dropUpAddress) {
          req.body.dropUpAddress = req.body.dropUpAddress;
        }
        let droupUpCoordinatesFirst = [];
        let droupUpLocationFirst = {};
        if (req.body.dropUplatitudeFirst && req.body.dropUplongitudeFirst) {
          droupUpCoordinatesFirst.push(Number(req.body.dropUplongitudeFirst));
          droupUpCoordinatesFirst.push(Number(req.body.dropUplatitudeFirst));
          droupUpLocationFirst.type = "Point";
          droupUpLocationFirst.coordinates = droupUpCoordinatesFirst;
          req.body.droupUpLocationFirst = droupUpLocationFirst;
        }
        if (req.body.dropUpAddressFirst) {
          req.body.dropUpAddressFirst = req.body.dropUpAddressFirst;
        }
        let droupUpCoordinateSecond = [];
        let droupUpLocationSecond = {};
        if (req.body.dropUplatitudeSecond && req.body.dropUplongitudeSecond) {
          droupUpCoordinateSecond.push(Number(req.body.dropUplongitudeSecond));
          droupUpCoordinateSecond.push(Number(req.body.dropUplatitudeSecond));
          droupUpLocationSecond.type = "Point";
          droupUpLocationSecond.coordinates = droupUpCoordinateSecond;
          req.body.droupUpLocationSecond = droupUpLocationSecond;
        }
        if (req.body.dropUpAddressSecond) {
          req.body.dropUpAddressSecond = req.body.dropUpAddressSecond;
        }
        let droupUpCoordinateThird = [];
        let droupUpLocationThird = {};
        if (req.body.dropUplatitudeThird && req.body.dropUplongitudeThird) {
          droupUpCoordinateThird.push(Number(req.body.dropUplongitudeThird));
          droupUpCoordinateThird.push(Number(req.body.dropUplatitudeThird));
          droupUpLocationThird.type = "Point";
          droupUpLocationThird.coordinates = droupUpCoordinateThird;
          req.body.droupUpLocationThird = droupUpLocationThird;
        }
        if (req.body.dropUpAddressThird) {
          req.body.dropUpAddressThird = req.body.dropUpAddressThird;
        }
        let droupUpCoordinateFour = [];
        let droupUpLocationFour = {};
        if (req.body.dropUplatitudeFour && req.body.dropUplongitudeFour) {
          droupUpCoordinateFour.push(Number(req.body.dropUplongitudeFour));
          droupUpCoordinateFour.push(Number(req.body.dropUplatitudeFour));
          droupUpLocationFour.type = "Point";
          droupUpLocationFour.coordinates = droupUpCoordinateFour;
          req.body.droupUpLocationFour = droupUpLocationFour;
        }
        if (req.body.dropUpAddressFour) {
          req.body.dropUpAddressFour = req.body.dropUpAddressFour;
        }
        //COORDINATES FOR BOOKING RIDE END

        //TRIPE TYPE FOR BOOKING RIDE
        switch (req.body.tripType) {
          case Constant.tripType.roundTrip:
            req.body.isDriverRequired = true;
            req.body.isCoDriverRequired = false;
            req.body.tripType = Constant.tripType.roundTrip;
            req.body.isRoundTrip = true;
            break;
          case Constant.tripType.singleTrip:
            req.body.isDriverRequired = true;
            req.body.isCoDriverRequired = true;
            req.body.tripType = Constant.tripType.singleTrip;
            req.body.isSingleTrip = true;
            break;
          default:
            req.body.isDriverRequired = true;
            req.body.isCoDriverRequired = false;
            req.body.tripType = Constant.tripType.singleTrip;
            req.body.isSingleTrip = true;
            break;
        }
        //TRIPE TYPE FOR BOOKING RIDE END

        //PAYMENT MODE FOR BOOKING RIDE
        switch (req.body.paymentMode) {
          case Constant.paymentMode.cash:
            req.body.paymentMode = Constant.paymentMode.cash;
            req.body.isCashMode = true;
            break;
          case Constant.paymentMode.card:
            req.body.paymentMode = Constant.paymentMode.card;
            req.body.isCashMode = false;
            break;
          case Constant.paymentMode.wallet:
            req.body.paymentMode = Constant.paymentMode.wallet;
            req.body.isCashMode = false;
            break;
          default:
            req.body.paymentMode = Constant.paymentMode.cash;
            req.body.isCashMode = true;
            break;
        }
        //PAYMENT MODE FOR BOOKING RIDE

        //TRIPE AMOUNT CALCULATE
        if (req.body.tripType === Constant.tripType.singleTrip) {
          req.body.booKingAmount = parseFloat(
            req.body.totalDistanceInKm * (adminData.driverPerKmCharge || 0) +
              parseFloat(
                req.body.totalDistanceInKm *
                  (adminData.coDriverPerKmCharge || 0)
              ).toFixed(2) +
              parseFloat(adminData.overflowFee)
          );
          req.body.booKingAmount += adminData.baseFare;
        } else {
          req.body.booKingAmount = parseFloat(
            (
              req.body.totalDistanceInKm * (adminData.coDriverPerKmCharge || 0)
            ).toFixed(2)
          );
          req.body.booKingAmount += adminData.baseFare;
        }

        //IF PROMO APPLYED
        if (req.body.isPromoApply) {
          if (promoCodeData.isCash) {
            promoAmount = promoCodeData.cashback;
          } else {
            promoAmount = parseFloat(
              (parseFloat(req.body.booKingAmount) * promoCodeData.percentage) /
                100
            );
          }
          req.body.promoAmount = parseFloat(promoAmount.toFixed(2));
        }

        //CALCULATE TOTALAMOUNT
        if (userData && userData.pendingAmount) {
          //promo discount - on app side
          req.body.totalAmount = parseFloat(
            req.body.booKingAmount + userData.pendingAmount
          );
        } else {
          //promo discount - on app side
          req.body.totalAmount = parseFloat(req.body.booKingAmount).toFixed(2);
        }

        //ADD CANCLE AMOUNT
        req.body.cancelAmount = parseFloat(
          (
            (req.body.booKingAmount * adminData.cancelAmountInPercentage) /
            100
          ).toFixed(2)
        );

        //CALCULATE FINLAMOUNT
        if (req.body.totalAmount < 0) {
          req.body.totalAmount = 0;
        }
        req.body.actualAmount = req.body.totalAmount;
        if (
          req.body.isDriverRequired &&
          req.body.driverId != null &&
          req.body &&
          req.body.isCoDriverRequired &&
          req.body.coDriverId != null
        ) {
          isSharePercentageDriverCoDriver = true;
        }
        let driverEarningAmount = 0;
        let driverSharePercentage = adminData.driverSharePercentage || 0;
        if (isSharePercentageDriverCoDriver) {
          driverSharePercentage = adminData.coDriverSharePercentage || 0;
        }
        driverEarningAmount = parseFloat(
          (req.body.actualAmount * driverSharePercentage) / 100
        ).toFixed(2);
        req.body.taxAmount = parseFloat(
          ((req.body.booKingAmount * adminData.taxInPercentage) / 100).toFixed(
            2
          )
        );
        req.body.driverEarningAmount = driverEarningAmount;

        if (
          req.body.paymentMode == Constant.paymentMode.wallet &&
          req.body.totalAmount > userData.walletAmount
        ) {
          return res.ok(false, Constant.InsufficientAmount, null);
        }
        //CALCULATE FINLAMOUNT END

        //IF PROMO APPLY
        if (isPromoApply === true) {
          //PAYMENT FROM WALLET WITH PROMO APPLY
          if (req.body.isWalletUsed && req.body.totalAmount) {
            req.body.totalAmount;
            if (req.body.totalAmount >= userData.walletAmount) {
              req.body.actualAmount = parseFloat(
                (req.body.totalAmount - userData.walletAmount).toFixed(2)
              );
              req.body.walletAmount = parseFloat(
                userData.walletAmount.toFixed(2)
              );
            } else {
              req.body.actualAmount = 0;
              req.body.walletAmount = parseFloat(
                req.body.totalAmount.toFixed(2)
              );
            }
          }

          req.body.paymentStatus = Constant.paymentStatus.completed;
          //PAYMENT FROM CARD WITH PROMO APPLY
          if (req.body.paymentMode == Constant.paymentMode.card) {
            //CHECK USER CARD
            if (!req.body.cardId) {
              return res.ok(false, Constant.invalidStripCard, null);
            }
            let cardData = await Model.Card.findOne({
              _id: mongoose.Types.ObjectId(req.body.cardId),
              isDeleted: false,
              isBlocked: false,
            });
            if (!cardData) {
              return res.ok(false, Constant.invalidStripCard, null);
            }
            const promoCardPayment = parseFloat(
              req.body.actualAmount - req.body.promoAmount
            );
            let paymentObj = {
              amount: promoCardPayment,
              stripeCustomerId: cardData.stripeCustomerId,
              stripePaymentMethod: cardData.stripePaymentMethod,
              description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`,
            };
            if (promoCardPayment === 0) {
              //IF TOTAL AMOUNT IS 0 AND STILL USE CARD WITH PROMOCODE THE WE HAVE TO STORE TRANSACTION RECORD.
              const randomStr = await generateRandomString(24);
              const randomStr2 = await generateRandomString(24);
              paymentObj.trxId = `pi_${randomStr}`;
              paymentObj.captureMethod = "automatic";
              paymentObj.chargeId = `ch_${randomStr2}`;
              paymentObj.paymentStatus = Constant.paymentStatus.completed;
              paymentObj.userId = userData._id;
              paymentObj.cardId = cardData._id;
              let transactionData = await Model.Transaction(paymentObj).save();
              req.body.transactionId = transactionData._id;
              req.body.trxId = transactionData.trxId;
              req.body.isPayementOnStrip = true;
              ///
              req.body.paymentStatus = Constant.paymentStatus.completed;
            } else {
              //IF TOTAL AMOUNT IS NOT 0 AND USE CARD WITH PROMOCODE THE WE HAVE TO STORE TRANSACTION RECORD.
              if (req.body.actualAmount - req.body.promoAmount > 0) {
                let paymentData = await chargeStrip(paymentObj);
                if (
                  paymentData &&
                  paymentData.status &&
                  paymentData.data &&
                  paymentData.data.paymentId
                ) {
                  paymentObj.trxId = paymentData.data.paymentId;
                  paymentObj.captureMethod = paymentData.data.captureMethod;
                  paymentObj.chargeId = paymentData.data.chargeId;
                  paymentObj.paymentStatus = Constant.paymentStatus.completed;
                  paymentObj.userId = userData._id;
                  paymentObj.cardId = cardData._id;
                  let transactionData = await Model.Transaction(
                    paymentObj
                  ).save();
                  req.body.transactionId = transactionData._id;
                  req.body.trxId = transactionData.trxId;
                  req.body.isPayementOnStrip = true;
                } else {
                  return res.ok(
                    false,
                    Constant.errorInStripCardChargeAmount,
                    null
                  );
                }
              }
            }
          }
        } else {
          //IF PROMO NOT APPLY
          if (req.body.isWalletUsed && req.body.totalAmount) {
            //BOOKING PAYMENT DEC FROM USER WALLET WHILE PROMO NOT APPLY.
            if (req.body.totalAmount >= userData.walletAmount) {
              req.body.actualAmount = parseFloat(
                (req.body.totalAmount - userData.walletAmount).toFixed(2)
              );
              req.body.walletAmount = parseFloat(
                userData.walletAmount.toFixed(2)
              );
            } else {
              req.body.actualAmount = 0;
              req.body.walletAmount = parseFloat(
                req.body.totalAmount.toFixed(2)
              );
            }
          }
          req.body.paymentStatus = Constant.paymentStatus.completed;

          //BOOKING PAYMENT DEC FROM USER CARD WHILE PROMO NOT APPLY.
          if (req.body.paymentMode == Constant.paymentMode.card) {
            if (!req.body.cardId) {
              return res.ok(false, Constant.invalidStripCard, null);
            }
            //CHECK FOR USER CARD
            let cardData = await Model.Card.findOne({
              _id: mongoose.Types.ObjectId(req.body.cardId),
              isDeleted: false,
              isBlocked: false,
            });
            if (!cardData) {
              return res.ok(false, Constant.invalidStripCard, null);
            }
            let paymentObj = {
              amount: parseFloat(req.body.actualAmount),
              stripeCustomerId: cardData.stripeCustomerId,
              stripePaymentMethod: cardData.stripePaymentMethod,
              description: `Payment by ${userData.firstName} ${userData.lastName}-${req.body.bookingDate}--${userData.email}`,
            };
            if (req.body.actualAmount > 0) {
              let paymentData = await chargeStrip(paymentObj);
              if (
                paymentData &&
                paymentData.status &&
                paymentData.data &&
                paymentData.data.paymentId
              ) {
                paymentObj.trxId = paymentData.data.paymentId;
                paymentObj.captureMethod = paymentData.data.captureMethod;
                paymentObj.chargeId = paymentData.data.chargeId;
                paymentObj.paymentStatus = Constant.paymentStatus.completed;
                paymentObj.userId = userData._id;
                paymentObj.cardId = cardData._id;
                let transactionData = await Model.Transaction(
                  paymentObj
                ).save();
                req.body.transactionId = transactionData._id;
                req.body.trxId = transactionData.trxId;
                req.body.isPayementOnStrip = true;
              } else {
                return res.ok(
                  false,
                  Constant.errorInStripCardChargeAmount,
                  null
                );
              }
            }
          }
        }
        //IF PROMO APPLY END

        //CREATE BOOKING AND SAVE IN DATABASE.
        const bookingData = await new Model.Booking(req.body).save();
        if (
          req.body.paymentMode == Constant.paymentMode.card &&
          req.body.actualAmount
        ) {
          await Model.Transaction.update(
            { _id: mongoose.Types.ObjectId(req.body.transactionId) },
            {
              $set: {
                bookingId: mongoose.Types.ObjectId(bookingData._id),
              },
            }
          );
        }

        //IF BOOKING CREATE SUCESS THE TIME TO DEC AMOUNT FROM USER WALLET
        if (isPromoApply === true) {
          const promoAmountDic = (
            bookingData.promoAmount - bookingData.totalAmount
          ).toFixed(2);
          if (bookingData.paymentMode == Constant.paymentMode.wallet) {
            await Model.User.update(
              { _id: mongoose.Types.ObjectId(bookingData.userId) },
              { $inc: { walletAmount: promoAmountDic } }
            );
          }
          if (req.body.isWalletUsed) {
            await Model.User.update(
              { _id: mongoose.Types.ObjectId(bookingData.userId) },
              { $inc: { walletAmount: -bookingData.walletAmount } }
            );
          }
          //IF BOOKING CREATE SUCESS ADD PROMOCODE IS USED THEN CREATE PROMO LOG.
          const promoBody = {
            bookingId: bookingData._id,
            promoId: promoUserdId,
            userId: req.body.userId,
          };
          await PromoLogCreate(promoBody);
        } else {
          const promoAmountDic = bookingData.totalAmount.toFixed(2);
          if (bookingData.paymentMode == Constant.paymentMode.wallet) {
            await Model.User.update(
              { _id: mongoose.Types.ObjectId(bookingData.userId) },
              { $inc: { walletAmount: -promoAmountDic } }
            );
          }
          if (req.body.isWalletUsed) {
            await Model.User.update(
              { _id: mongoose.Types.ObjectId(bookingData.userId) },
              { $inc: { walletAmount: -bookingData.walletAmount } }
            );
          }
        }
        //IF BOOKING CREATE SUCESS THE TIME TO DEC AMOUNT FROM USER WALLET END

        //SEND BOOKING CREATE DATA TO DRIVER, NOTIFICATION AND ETC.
        if (req.body.isTripAllocated) {
          console.log("__________________");
          let sendUserData = await userController.userDataSend(userData);
          const sendBookingData = await userController.getCurrentBookingData(
            bookingData
          );
          driverController.availableFreeDriver(
            sendBookingData,
            sendUserData,
            {}
          );
        } else if (req.body.isSheduledBooking) {
          process.emit("scheduleBooking", bookingData);
        }
        //SEND BOOKING CREATE DATA TO DRIVER, NOTIFICATION AND ETC. END

        let apiResponse = Service.generate.generate(
          true,
          "Sucess",
          200,
          bookingData
        );
        res.send(apiResponse);
      }
    }
  } catch (error) {
    let apiResponse = Service.generate.generate(true, "Error..", 500, error);
    res.send(apiResponse);
  }
};

//EXPORT ALL FUNCTIONS
module.exports = {
  getBookingList: getBookingList,
  viewBookingById: viewBookingById,
  getBookingCardDetails: getBookingCardDetails,
  getRefundDetails: getRefundDetails,
  createBooking: createBooking,
};
