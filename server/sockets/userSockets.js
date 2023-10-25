const Constant = require('../Constant');
const _ = require('lodash');
const Model = require('../models/index');
const UserController = require('../v1/controllers/UserController');
const driverController = require('../v1/controllers/DriverController');
module.exports =  (io,socket)=>{
  socket.on("userSocketInitiated", function(data) {
    if(data && data.userId){
        console.log("Connect to room user",data)
        socket.join(data.userId);
    }
  })
  socket.on("getCurrentBookingStatus",async function (data) {
    let bookingData=await UserController.getCurrentBookingStatus(data);
    if(data && data.userId){
      data.status=200;
      io.in(data.userId).emit('replyCurrentBookingStatus',bookingData);
      console.log(bookingData,'socket bookingData');
    }
  });
  socket.on("sendChatMessageToDriver",async function (data) {
    if(data && data.driverId && data.userId && data.bookingId){
      let dataToSend={};
      data.receiverId=data.driverId;
      await Model.chatMessage(data).save();
      let userData=await UserController.getUserData(data);
      dataToSend.status=200;
      _.extend(dataToSend,data);
      _.extend(dataToSend,{userData:userData});
      console.log("sendChatMessageToDriver")
      io.in(data.driverId).emit('sendChatMessageToDriverSuccessfully',dataToSend);
      await driverController.sendChatBulkPushToDriver(data.driverId,dataToSend);
    }
  });
}