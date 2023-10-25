module.exports = (req, res, next) => {
    res.serverError = function (message) {
        return res.status(500).send({success: false, message: message, data: null});
    };
    next();
};