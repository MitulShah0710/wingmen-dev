const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var TransmissionTypeModelSchema = new Schema({
  transmissionTypeName: {
    type: String,
    required: true
  },
  isBlocked:{ type:Boolean,default:false},
  isDeleted :{ type:Boolean,default:false},
    
}, { timestamps: true })

module.exports = mongoose.model('TransmissionType',TransmissionTypeModelSchema);