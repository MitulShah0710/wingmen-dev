const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var TeamModelSchema = new Schema({
  teamName: {
    type: String,
    required: true
  },
  teamMembers:{type:Number,default:0},
  isBlocked:{ type:Boolean,default:false},
  isDeleted :{ type:Boolean,default:false},
    
}, { timestamps: true })

module.exports = mongoose.model('Team',TeamModelSchema);