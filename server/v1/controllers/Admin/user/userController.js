const Model = require('../../../../models/index');
const Service = require('../../../../services/index');
const Constant = require('../../../../Constant');
const Validation = require('../../../Validations/index');
const mongoose = require('mongoose');
const stripePay = require('stripe');
const config = require('../../../../config/config');
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);


//CHECK FOR ADMIN AUTHORIZATION
let checkAdmin = (req, res) => {
    try {
        const adminCheck = req.user
        let apiResponse = Service.generate.generate(true, 'Success', 200, adminCheck)
        res.send(apiResponse)
    } catch (error) {
        let apiResponse = Service.generate.generate(true, 'Error', 200, error)
        res.send(apiResponse)
    }
}

let checkEventManager = (req, res) => {
    try {
        const adminCheck = req.user
        let apiResponse = Service.generate.generate(true, 'Success', 200, adminCheck)
        res.send(apiResponse)
    } catch (error) {
        let apiResponse = Service.generate.generate(true, 'Error', 200, error)
        res.send(apiResponse)
    }
}

//CREATE USER
let createUserFromAdmin = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isUserSignUpValid(req.body)) {
            let apiResponse = Service.generate.generate(true, Constant.required, 500);
            res.send(apiResponse);
        } else {
            req.body.email = req.body.email.toLowerCase();
            if (req.body.email) {
                const emailUser = await Model.User.findOne({ email: req.body.email, isDeleted: false });
                if (emailUser) {
                    return res.ok(false, Constant.emailAlreadyExist, null);
                }
            }
            if (req.body.phone) {
                const phoneUser = await Model.User.findOne({ phone: req.body.phone, isDeleted: false });
                if (phoneUser) {
                    return res.ok(false, Constant.phoneAlreadyExist, null);
                }
            }
            req.body.image = '';
            if (req.file && req.file.filename) {
                req.body.image = `${Constant.userImage}/${req.file.filename}`;
            }
            req.body.isApproved = true;
            req.body, isVerified = true;
            req.body.profileStatus = 'COMPLETED';
            req.body.isPhoneVerified = true;
            req.body.singUpType = 'EMAIL';
            let coordinates = []
            let location = {}
            if (req.body.latitude && req.body.longitude) {
                coordinates.push(Number(req.body.longitude))
                coordinates.push(Number(req.body.latitude))
                location.type = "Point";
                location.coordinates = coordinates
            }
            req.body.location = location;
            const userCreate = await new Model.User(req.body).save();
            let apiResponse = Service.generate.generate(true, "Success", 200, userCreate);
            res.send(apiResponse);
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}

//USER VERIFY | BLOCK | UNBLOCK | DELETED
let userControl = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isValidId(req.body)) {
            let apiResponse = Service.generate.generate(true, Constant.required, 500);
            res.send(apiResponse);
        } else {
            let setObj = {};
            let message = null;
            if (req.body.isApproved != undefined) {
                setObj.isApproved = req.body.isApproved;
                message = req.body.isApproved ? Constant.aproveDriver : Constant.unAproveDriver;
            }
            if (req.body.isBlocked != undefined) {
                setObj.isBlocked = req.body.isBlocked;
                message = req.body.isBlocked ? Constant.blocked : Constant.UnBlocked;
            }
            if (req.body.isDeleted != undefined) {
                setObj.isDeleted = req.body.isDeleted;
                message = Constant.deleted;
            }
            if (req.body.isVerified != undefined) {
                setObj.isVerified = req.body.isVerified;
                message = 'Verified Successfully';
            }
            await Model.User.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(req.body._id)
            }, { $set: setObj })
            const userData = await Model.User.findOne({ _id: mongoose.Types.ObjectId(req.body._id) });

            let apiResponse = Service.generate.generate(true, message, 200, userData);
            res.send(apiResponse);
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}

//USER LIST
let getUsers = async (req, res) => {
    const { page, limit, search } = req.query;
    const query = { isDeleted: false }
    //SEARCH USER
    if (search != undefined) {
        query.$or = [
            {
                firstName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                lastName: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                phone: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                email: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    try {
        if (search) {
            const userList = await Model.User.find(query)
                .populate({ path: "userCard" })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec()

            const count = await Model.User.countDocuments(query);
            const result = {
                userList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        } else {
            const userList = await Model.User.find(query)
                .populate({ path: "userCard" })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Model.User.countDocuments(query);
            const result = {
                userList,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        }
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }

}

//USER VIEW BY ID
let getUserById = (req, res) => {
    Model.User.findById({ _id: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No user Found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'userCard' })
}

//USER RIDE BOOKING LIST
let getUserBookingList = (req, res) => {
    Model.Booking.find({ userId: mongoose.Types.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No user booking found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'userId' })
}

//USER DEVICE TYPE VIEW
let getUserDevice = (req, res) => {
    Model.Device.find({ userId: mongoose.Types.ObjectId(req.params.id) }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No device found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'userId' })
}

//USER CREDIT CARD LIST
let getUserCard = (req, res) => {
    Model.Card.find({ userId: mongoose.Types.ObjectId(req.params.id), isBlocked: false, isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No card found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate({ path: 'userId' })
}

//GET VEHICLE BY USER
let getUserVehicle = (req, res) => {
    Model.Vehicle.find({ userId: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No user vehicle found', 404, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    }).populate([{ path: 'transmissionTypeId' }, { path: 'vehicleTypeId' }])
}

//USER CREDIT CARD DELETE
let deleteUserCard = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isValiDeleteCard(req.body))
            return res.ok(false, Constant.required, null);

        await Model.Card.deleteOne({
            _id: mongoose.Types.ObjectId(req.body.cardId),
            userId: mongoose.Types.ObjectId(req.body.userId)
        })

        return res.ok(true, null, {});
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}

//USE IN CREDIT CARD CREATE
async function createStripeCustomer(opts) {
    let response = { status: false, data: {} }
    try {
        //CREATE OBJECT FOR STRIPE
        let request = {
            payment_method: opts.stripePaymentMethod,
            description: `Customer creation ${opts.name}`,
            metadata: opts.metadata || null,
            email: opts.email || null,
            invoice_settings: {
                default_payment_method: opts.stripePaymentMethod
            }
        }

        let result = await stripe.customers.create(request);
        if (result && result.id) {
            response.status = true,
                response.data = result
            return response
        }
        return response
    } catch (error) {
        response.status = false;
        response.data = error
        return response
    }
}

//USE IN CREDIT CARD CREATE
async function checkCardDetails(cardResult) {
    try {
        //CREATE OBJECT FOR STRIPE
        let criteria = {
            brand: cardResult.brand,
            last4Digits: cardResult.last4Digits,
            expiryDate: cardResult.expiryDate
        }
        let cardData = await Model.Card.findOne(criteria);
        if (cardData) {
            if (cardData && cardData.stripeCustomerId && cardData.stripePaymentMethod) {
                cardResult.stripeCustomerId = cardData.stripeCustomerId;
                cardResult.stripePaymentMethod = cardData.stripePaymentMethod;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

//USER CREDIT CARD ADD
let createUserCard = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isValidUserCard(req.body))
            return res.ok(false, Constant.required, {});
        //CARD CREATE
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
                number: req.body.cardNumber,
                exp_month: parseInt(req.body.cardExpMonth),
                exp_year: parseInt(req.body.cardExpYear),
                cvc: req.body.cardCvv,
            },
        });
        //USER DATA
        const userData = await Model.User.findOne({ _id: req.body.userId }, { email: 1, _id: 1 });
        if (!userData) {
            return res.ok(false, Constant.userNotFound, null);
        }
        //CHECK FOR CARD
        const cardDataCheck = await Model.Card.findOne({
            userId: mongoose.Types.ObjectId(req.body.userId),
            isDeleted: false, isBlocked: false
        });
        let stripePaymentMethod = paymentMethod.id;
        let description = `Create customer ${userData.email} -${userData._id}`;
        let meta_data = req.body.meta_data || null;
        let opts = {
            stripePaymentMethod: stripePaymentMethod,
            description: description,
            meta_data: meta_data,
            name: userData.firstName,
            email: userData.email
        }
        //CREATE CUSTOMER ID FROM STRIPE
        cardData = {
            stripePaymentMethod: paymentMethod.id,
            last4Digits: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
            funding: paymentMethod.card.funding,
            expiryDate: paymentMethod.card.exp_month + '-' + paymentMethod.card.exp_year
        }
        let result = await checkCardDetails(cardData);
        if (!result) {
            let stripeDetail = await createStripeCustomer(opts)
            if (!stripeDetail.status) {
                return res.ok(false, Constant.stripCardError, null);
            }
            cardData.userId = req.body.userId;
            cardData.stripeCustomerId = stripeDetail.data.id;
            if (!cardDataCheck) {
                cardData.isDefault = true;
            }
        }
        card = await Model.Card(cardData).save();
        const oldCard = await Model.User.findOne({ '_id': req.body.userId })
        let arr = []
        for (let i = 0; i < oldCard.userCard.length; i++) {
            arr.push(oldCard.userCard[i]);
        }
        arr.push(card.id)
        const finalData = await Model.User.updateOne({ '_id': mongoose.Types.ObjectId(req.body.userId) }, { $set: { userCard: arr } })
        let apiResponse = Service.generate.generate(true, "Success", 200, finalData);
        res.send(apiResponse);
    } catch (error) {
        console.log(error);
        let apiResponse = Service.generate.generate(true, "Error", 301, error);
        res.send(apiResponse);
    }
}


//EXPORT ALL FUNCTIONS
module.exports = {
    checkAdmin: checkAdmin,
    checkEventManager: checkEventManager,
    createUserFromAdmin: createUserFromAdmin,
    userControl: userControl,
    getUsers: getUsers,
    getUserById: getUserById,
    getUserBookingList: getUserBookingList,
    getUserDevice: getUserDevice,
    getUserVehicle: getUserVehicle,
    getUserCard: getUserCard,
    deleteUserCard: deleteUserCard,
    createUserCard: createUserCard
}