const Constant = require('../Constant');
const Model = require('../models/index');
module.exports =  (io,socket)=>{
  socket.on("adminSocketInitiated", function(data) {
    console.log("adminSocketInitiated",data)
    if(data && data.adminId){
        socket.join(data.adminId);
    }
  })
} 