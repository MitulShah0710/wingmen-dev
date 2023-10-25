const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var StateModelSchema = new Schema({
  stateName: {
    type: String,
    required: true
  },
  isBlocked:{ type:Boolean,default:false},
  isDeleted :{ type:Boolean,default:false},
    
}, { timestamps: true })

module.exports = mongoose.model('State',StateModelSchema);