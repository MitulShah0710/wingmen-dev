const Services = require('../services/index');
const Model = require('../models/index');
const Constant = require('../Constant');
module.exports = (req, res, next) => {
    if (req.headers && req.headers.authorization) {
        let remove1 = req.headers.authorization.replace('Bearer "', '')
        let remove2 = remove1.replace('"', '')
        const parts = remove2.split(' ');
        if (parts.length !== 2) return res.status(401).send({ success: false, message: Constant.unauthorizedRequest, data: null });
        const token = parts[1];
        const scheme = parts[0];
        Services.JwtService.verify(token, (error, user) => {
            if (error) return res.forbidden(Constant.tokenExpire);
            // console.log({ user })
            let query;
            if (scheme == 'SEC') {
                query = Model.User.findOne({
                    _id: Services.HashService.decrypt(user.payload._id),
                    token: token, isDeleted: false, isBlocked: false
                });
            } else if (scheme == 'SED') {
                query = Model.Driver.findOne({
                    _id: Services.HashService.decrypt(user.payload._id),
                    token: token, isDeleted: false, isBlocked: false
                });
            }
            else if (scheme == 'SEE') {
                query = Model.EventBooking.findOne({
                    _id: Services.HashService.decrypt(user.payload._id),
                    // token: token, isDeleted: false, isBlocked: false
                });
            }
            else if (scheme == 'SEM') {
                query = Model.EventManager.findOne({
                    _id: Services.HashService.decrypt(user.payload._id),
                    // token: token, isDeleted: false, isBlocked: false
                });
            } 
            else {
                query = Model.Admin.findOne({
                    _id: Services.HashService.decrypt(user.payload._id),
                    token: token, isDeleted: false, isBlocked: false
                });
            }
            query.then(user => {
                // console.log({ user })
                if (user) {
                    req.user = user;
                    next();
                } else {
                    res.status(401).send({ success: false, message: Constant.unauthorizedRequest, data: null });
                }
            });
        });
    } else {
        return res.status(401).send({ success: false, message: Constant.tokenMissing, data: null });
    }
};