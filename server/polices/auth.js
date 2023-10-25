let jwt = require('jsonwebtoken');
const Model = require('../models/index');
const bcrypt = require('bcrypt-nodejs')
const Services = require('../services/index');
const Constant = require('../Constant');
module.exports = {
    verify: async (request, response, next) => {
        let token = request.headers.authorization;
        try {
            let decoded = await jwt.verify(token, 'iAmSecretKey');
            let user = await Model.Driver.find({ email: decoded.payload});
            if (user) {
                request.driver = user
                next()
            }
        } catch (error) {
            console.log('error',error);
         return   response.send(error)
            // return MESSAGES.ENTER_VALID_TOKEN(response);
        }
    },
    verifyUser: async (request, response, next) => {
        let token = request.headers.authorization;
        const parts = request.headers.authorization.split(' ');
        if (parts.length !== 2)
        return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        token = parts[1];
        try {
            let decoded = await jwt.verify(token, 'iAmSecretKey');
            let user = await Model.User.findOne({ _id:Services.HashService.decrypt(decoded.payload._id),isDeleted:false});
            if (user) {
                request.user = user
                next();
            }else if (user.isBlocked) {
                return response.status(401).send({success: false, message: Constant.userBlocked, data: null});
            }else{
                return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
            }
        } catch (error) {
            console.log('error',error);
            return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        }
    },
    verifyDriver: async (request, response, next) => {
        let token = request.headers.authorization;
        const parts = request.headers.authorization.split(' ');
        if (parts.length !== 2)
        return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        token = parts[1];
        try {
            let decoded = await jwt.verify(token, 'iAmSecretKey');
            let driver = await Model.Driver.findOne({ _id:Services.HashService.decrypt(decoded.payload._id),isDeleted:false});
            if (driver) {
                request.driver = driver
                next();
            }
            else{
                return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
            }
        } catch (error) {
            console.log('error',error);
            return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        }
    },
    verifyAdmin : async(request,response,next)=>{
        let token = request.headers.authorization;
        const parts = request.headers.authorization.split(' ');
        if (parts.length !== 2)
        return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        token = parts[1];
        try {
            let decoded = await jwt.verify(token, 'iAmSecretKey');
            query = Model.Admin.findOne({_id: Services.HashService.decrypt(decoded.payload._id),isDeleted:false});
            if (query) {
                request.admin = query
                next()
            }else if (query.isBlocked) {
                return response.status(401).send({success: false, message: Constant.userBlocked, data: null});
            }else{
                return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
            }
        } catch (error) {
            console.log('error',error);
            return response.status(401).send({success: false, message: Constant.unauthorizedRequest, data: null});
        }
    }
}
