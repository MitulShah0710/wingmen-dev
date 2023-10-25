var mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
var connect = function () {
    return new Promise((resolve, reject) => {
        // var url = 'mongodb://localhost:27017/wingmen';
        var url = 'mongodb+srv://manthan:manthan@cluster0.xgqwh.mongodb.net/wingmen';
        // 'mongodb+srv://manthan:manthan@cluster0.xgqwh.mongodb.net/wingmenLive
        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            return resolve('Db successfully connected!');
        });
    });
};

autoIncrement.initialize(mongoose);
module.exports = {
    connect: connect
};
