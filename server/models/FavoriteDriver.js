const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FavoriteDriverModel = new Schema({
    driverId: { type: Schema.ObjectId, ref: 'Driver' },
    favoriteDriverId: { type: Schema.ObjectId, ref: 'Driver' },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
FavoriteDriverModel.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret, options) {
        delete ret.password;
        delete ret.__v;
    }
});

const FavoriteDriver = mongoose.model('FavoriteDriver', FavoriteDriverModel);
module.exports = FavoriteDriver;
