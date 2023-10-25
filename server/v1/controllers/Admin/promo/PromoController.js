const Model = require('../../../../models/index');
const Service = require('../../../../services/index');
const Constant = require('../../../../Constant');
const Validation = require('../../../Validations/index');
const mongoose = require('mongoose');
const moment = require('moment');


//CREATE PROMO CODE
let createPromo = async (req, res) => {
    try {
        const checkPromo = {
            isDeleted: false,
            promoCode: req.body.promoCode
        };
        const count = await Model.PromoCode.countDocuments(checkPromo);
        if (count > 0) {
            let apiResponse = Service.generate.generate(true, Constant.promoAlreadyExist, 500, count);
            res.send(apiResponse);
        } else {
            if (req.body.expireDate && (new Date(req.body.expireDate) == "Invalid Date"
                || moment().diff(req.body.expireDate, 'seconds') > 0)) {
                let apiResponse = Service.generate.generate(true, Constant.backDateNotAllowed, 500, {});
                res.send(apiResponse);
            } else {
                const newPromo = {
                    cashback: req.body.cashback,
                    percentage: req.body.percentage,
                    promoCode: req.body.promoCode,
                    individualUserPromoAttempt: req.body.individualUserPromoAttempt,
                    promoAttempt: req.body.individualUserPromoAttempt,
                    noOfPromoUsers: req.body.noOfPromoUsers,
                    isExpireDateAdded: req.body.isExpireDateAdded,
                    expireDate: req.body.expireDate,
                    isCash: req.body.isCash
                }
                const result = await Model.PromoCode(newPromo).save();
                let apiResponse = Service.generate.generate(true, "Sucess", 200, result);
                res.send(apiResponse);
            }
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}


//PROMOCODE LIST
let getPromocode = async (req, res) => {
    const { page, limit, search } = req.query;
    const query = { isDeleted: false }
    //SEARCH USER
    if (search != undefined) {
        query.$or = [
            {
                promoCode: {
                    $regex: search,
                    $options: 'i',
                },
            }
        ];
    }
    try {
        if (search) {
            const promoCode = await Model.PromoCode.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .exec()

            const count = await Model.PromoCode.countDocuments(query);
            const result = {
                promoCode,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
            };
            let apiResponse = Service.generate.generate(true, "Success", 200, result);
            res.send(apiResponse);
        } else {
            const promoCode = await Model.PromoCode.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Model.PromoCode.countDocuments(query);
            const result = {
                promoCode,
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


//PROMOCODE VIEW BY ID
let getPromoById = (req, res) => {
    Model.PromoCode.findById({ _id: mongoose.Types.ObjectId(req.params.id), isDeleted: false }, (err, result) => {
        if (err) {
            let apiResponse = Service.generate.generate(true, 'Error', 500, err)
            res.send(apiResponse)
        } else if (result == undefined || result == null || result == '') {
            let apiResponse = Service.generate.generate(true, 'No Driver Found', 500, null)
            res.send(apiResponse)
        } else {
            let apiResponse = Service.generate.generate(true, 'Success', 200, result)
            res.send(apiResponse)
        }
    })
}


//GET PROMO LOG
let getPromoLogs = async (req, res) => {
    const { page, limit } = req.query;
    const query = { promoId: mongoose.Types.ObjectId(req.params.id), isDeleted: false }
    try {
        const promoLogs = await Model.PromoLog.find(query)
            .populate([{ path: 'bookingId' }, { path: 'promoId' }, { path: 'userId' }])
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Model.PromoLog.countDocuments(query);
        const result = {
            promoLogs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
        let apiResponse = Service.generate.generate(true, "Success", 200, result);
        res.send(apiResponse);
    } catch (err) {
        let apiResponse = Service.generate.generate(true, "Error", 500, err);
        res.send(apiResponse);
    }
}


//INCREASE NO OF PROMO USER ATTEMP
let updateAttempt = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isUpdateAttemptPromoCode(req.body)) {
            let apiResponse = Service.generate.generate(true, Constant.required, 500);
            res.send(apiResponse);
        } else {
            const count = await Model.PromoCode.findOne({ _id: mongoose.Types.ObjectId(req.body._id) });
            if (count._id != req.body._id) {
                return res.ok(false, 'Promo code not found', null);
            }

            const updatePomo = {
                promoAttempt: req.body.promoAttempt
            }
            const promoUpdate = await Model.PromoCode.findOneAndUpdate({ _id: req.body._id }, { $set: updatePomo });
            let apiResponse = Service.generate.generate(true, "Sucess", 200, promoUpdate);
            res.send(apiResponse);
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}


//DELETE OR BLOCK PROMO CODE
let deleteBlockPromo = async (req, res) => {
    try {
        if (Validation.isAdminValidate.isUpdateAttemptPromoCode(req.body)) {
            let apiResponse = Service.generate.generate(true, Constant.required, 500);
            res.send(apiResponse);
        } else {
            const count = await Model.PromoCode.findById({ _id: mongoose.Types.ObjectId(req.body._id) });
            if (count._id != req.body._id) {
                return res.ok(false, 'Promo code not found', null);
            }

            const deleteBlock = {
                isBlocked: req.body.isBlocked,
                isDeleted: req.body.isDeleted || false
            }
            let promoUpdate = await Model.PromoCode.findOneAndUpdate({ _id: req.body._id }, { $set: deleteBlock });

            let apiResponse = Service.generate.generate(true, "Sucess", 200, promoUpdate);
            res.send(apiResponse);
        }
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
}










//EXPORT ALL FUNCTIONS
module.exports = {
    createPromo: createPromo,
    getPromocode: getPromocode,
    getPromoById: getPromoById,
    getPromoLogs: getPromoLogs,
    updateAttempt: updateAttempt,
    deleteBlockPromo: deleteBlockPromo
}