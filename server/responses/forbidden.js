module.exports = (req, res, next) => {
    res.forbidden = function (message) {
        return res.status(403).send({success: false, message: message, data: null});
    };
    next();
};