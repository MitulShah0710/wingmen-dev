const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WalletModel = new Schema({
    firstName: 
        {
            type: String, default: ''
        },
    lastName: 
        {
            type: String, default: ''
        },
    walletAmount: 
        { 
            type: Number, default: 0 
        },
    isDeleted: 
        {
            type: Boolean,
            default: false
        }},
    {
        timestamps: true
});
const Wallet = mongoose.model('Wallet', WalletModel);
module.exports = Wallet;
