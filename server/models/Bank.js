const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var bankModelSchema = new Schema({
    userId: { type: Schema.ObjectId, ref: 'Driver' },
    name: { type: String, required: true },
    accountNumber: { type: String },
    ban: { type: String },
    isDefault: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
},
    { timestamps: true })
bankModelSchema.set('toObject', { virtuals: true });
bankModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Bank', bankModelSchema);