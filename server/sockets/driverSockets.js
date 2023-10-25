const Constant = require('../Constant');
const Model = require('../models/index');
const Service = require('../services/index');
const _ = require('lodash');
const driverController = require('../v1/controllers/DriverController');
const UserController = require('../v1/controllers/UserController');

module.exports = (io, socket) => {
  socket.on("driverSocketInitiated", function (data) {
    if (data && data.driverId) {
      console.log("Connect to room driver", data);
      socket.join(data.driverId);
    }
  });

  socket.on("sendDriverLocationToUser", async function (data) {
    // console.log('===6updateingg',data);
    driverController.updateDriverLongLat(data);
    if (data && data.bookingId) {
      data.status = 200;
      io.in(data.driverId).emit('updateLatLongSuccessfully', data);
      let foundBooking = await Model.Booking.findOne({ _id: data.bookingId, bookingStatus: { $nin: ['COMPLETED', 'CANCELED', 'PENDINGS'] } });//for a particualar booking
      console.log(foundBooking,'inupdatelatlngsocket sent to trackDriver');
      if (!foundBooking) io.emit('trackDriver', { status: 404, message: Constant.driverNotFound })
      io.in(foundBooking.bookingId).emit('trackDriver', data);
    }
  });

  socket.on('trackDriver', function (data) {//admin emits booking Id
    console.log('===trackDriveradmin added', data)
    if (data && data.bookingId) {
      socket.join(data.bookingId);
    }
  });


  socket.on("askForPaired", async function (data) {
    let popUpData = await driverController.checkAskPairedRequesTime(data);
    if (data && data.driverId) {
      popUpData.status = 200;
      io.in(data.driverId).emit('askForPairedSuccessfully', popUpData);
    }
  });
  socket.on("getCurrentBookingStatusForDriver", async function (data) {
    let bookingData = await driverController.getCurrentBookingStatus(data);
    if (data && data.driverId) {
      data.status = 200;
      io.in(data.driverId).emit('replyCurrentBookingStatusForDriver', bookingData);
    }
  });
  socket.on("sendChatMessageToUser", async function (data) {
    if (data && data.userId && data.driverId && data.bookingId) {
      let dataToSend = {};
      // dataToSend.data={};
      data.receiverId = data.userId;
      await Model.chatMessage(data).save();
      let driverData = await driverController.getDriverData(data);
      dataToSend.status = 200;
      _.extend(dataToSend, data);
      _.extend(dataToSend, { driverData: driverData });
      console.log("sendChatMessageToUser")
      io.in(data.userId).emit('sendChatMessageToUserSuccessfully', dataToSend);
      await UserController.sendChatBulkPushToUser(data.userId, dataToSend);
    }
  });
  socket.on("sendDriverLocationToUser", function (data) {
    if (data && data.userId) {
      data.status = 200;
      io.in(data.userId).emit('sendDriverLocationToUserSuccessfully', data);
    }
  });
  socket.on("sendChatMessageDriverToDriver", async function (data) {
    if (data && data.driverId && data.receiverId) {
      let dataToSend = {};
      dataToSend.data = {};
      data.receiverId = data.receiverId;
      data.coDriverId = data.receiverId;
      await Model.DriverChatMessage(data).save();
      let driverData = await driverController.getDriverData(data);
      dataToSend.data.status = 200;
      data.isDriverDataPass = true;
      data.eventType = Constant.eventType.chatSendDriverToDriver;
      _.extend(dataToSend, data);
      _.extend(dataToSend, { driverData: driverData });
      io.in(data.receiverId).emit('sendChatMessageDriverToDriverSuccessfully', dataToSend);
      await driverController.sendChatBulkPushToDriver(data.receiverId, dataToSend);
    }
  });
}