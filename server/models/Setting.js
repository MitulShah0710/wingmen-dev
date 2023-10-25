const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SettingModel = new Schema({
    appHome: {
        type: Array
    }
}, {
    timestamps: true
});
const Setting = mongoose.model('Setting', SettingModel);
module.exports = Setting;
