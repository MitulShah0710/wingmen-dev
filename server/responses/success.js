module.exports = (req,res,next) => {
    res.success = function (success, message, data, count, cart) {
        res.status(200).send({success: success, message: message || 'SUCCESS', data: data || null, count: count || 0, cart: cart});
    };
    next();
};
