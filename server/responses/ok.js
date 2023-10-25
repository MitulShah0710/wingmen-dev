module.exports = (req,res,next) => {
    res.ok = function (success, message, data) {
        res.status(200).send({success: success, message: message || 'SUCCESS', data: data || null});
    };
    next();
};