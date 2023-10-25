const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PairedDriverRequestModel = new Schema({
    driverId:  { type: Schema.ObjectId, ref: 'Driver' },
    receiverId:  { type: Schema.ObjectId, ref: 'Driver' },
    expiryDate:{type:Date},
    pairedStatus:{type: String,
        enum: ['PENDING','ACCEPTED'],
        default: 'PENDING'
    },
    isBlocked:{
        type : Boolean,
        default :false
    },
    isDeleted : {
        type : Boolean,
        default :false
    }
}, {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
});

const PairedDriverRequest = mongoose.model('PairedDriverRequest', PairedDriverRequestModel);
module.exports = PairedDriverRequest;
