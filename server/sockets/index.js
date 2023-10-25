const driver = require('./driverSockets');
const user = require('./userSockets');
const admin = require('./adminSockets');
const Model = require('../models/index');
async function messaageSendToDriver(io,payload){
  console.log("===3", payload)
    if(payload && payload.socketType){
      switch(payload.socketType){
        case 'BROAD_CAST':
          if(payload && payload.receiverId ){
            io.to(payload.receiverId).emit('sendDriverNotificationMessage',payload);
            console.log("sendDriverNotificationMessage",payload);
            if(payload && payload.isNotificationSave){
              Model.DriverNotification(payload).save();
            }
          }
        break;
        case 'DRIVER':
          if(payload && payload.receiverId ){
            io.in(payload.receiverId).emit('sendDriverNotificationMessage',payload);
            console.log("sendDriverNotificationMessage",payload);
            if(payload && payload.isNotificationSave){
              Model.DriverNotification(payload).save();
            }
        }
        break;
        default:
        break;
      }
    }
}
async function messaageSendToUser(io,payload){
    if(payload && payload.socketType){
      switch(payload.socketType){
        case 'BROAD_CAST':
          if(payload && payload.receiverId ){
            io.to(payload.receiverId).emit('sendUserNotificationMessage',payload);
            if(payload && payload.isNotificationSave){
              Model.UserNotification(payload).save();
            }
          }
        break;
        case 'USER':
          if(payload && payload.receiverId ){
            io.in(payload.receiverId).emit('sendUserNotificationMessage',payload);
            if(payload && payload.isNotificationSave){
              Model.UserNotification(payload).save();
            }
        }
        break;
        default:
        break;
      }
    }
}
async function messaageSendToAdmin(io,payload){
  if(payload && payload.socketType){
    switch(payload.socketType){
      case 'BROAD_CAST':
        if(payload && payload.receiverId ){
          io.to(payload.receiverId).emit('sendAdminNotificationMessage',payload);
          if(payload && payload.isNotificationSave){
            Model.AdminNotification(payload).save();
          }
        }
      break;
      case 'USER':
        if(payload && payload.receiverId ){
          io.in(payload.receiverId).emit('sendAdminNotificationMessage',payload);
          if(payload && payload.isNotificationSave){
            Model.AdminNotification(payload).save();
          }
      }
      break;
      default:
      break;
    }
  }
}
module.exports =(io)=>{
    io.on('connection',(socket)=>{
        console.log('connected to sockets');
        driver(io,socket);
        user(io,socket);
        admin(io,socket);
        socket.on('disconnect', function () {
            console.log("Disconnect")
        });
    });
    process.on('sendNotificationToDriver', async (payload) => {

      console.log("===2", payload);

        if(payload && payload.eventType){
          switch(payload.eventType){
            case 'BOOKING_ACCEPT_NOTIFICATION':
              break;
            case 'NEW_BOOKING_NOTIFICATION_SEND_TO_DRIVER':
              messaageSendToDriver(io,payload)
            break;
            case 'PAIRED_NOTIFICATION':
              messaageSendToDriver(io,payload);
            break;
            case 'PAIRED_SUCCESSFULLY_NOTIFICATION':
              messaageSendToDriver(io,payload)
            break;
            case 'UN_PAIRED_NOTIFICATION':
                messaageSendToDriver(io,payload)
            break;
            case 'USER_CANCEL_BOOKING_NOTIFICATION':
                messaageSendToDriver(io,payload)
            break;
            case 'USER_FINAL_COMPLETE_BOOKING_NOTIFICATION':
              messaageSendToDriver(io,payload)
            break;
            case 'ADMIN_ACCERPT_BOOKING_AND_ASSIGN_DRIVER_NOTIFICATION':
              messaageSendToDriver(io,payload)
            break;
            case 'TRIP_STATUS_CHANGED':
              messaageSendToDriver(io,payload)
              break;
            default:
            break;
          }
        }
    });
    process.on('sendNotificationToUser', async (payload) => {
        if(payload && payload.eventType){
          switch(payload.eventType){
            case 'DRIVER_ACCEPT_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
              break;
            case 'DRIVER_START_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload)
            break;
            case 'DRIVER_ONGOING_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'DRIVER_ARRIVED_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'DRIVER_COMPLETED_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'DRIVER_CANCEL_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'ADMIN_ACCEPT_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'ADMIN_COMPLETED_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'ADMIN_CANCEL_BOOKING_NOTIFICATION':
                messaageSendToUser(io,payload);
            break;
            case 'NO_DRIVER_AVAILABLE_CANCEL_BOOKING_NOTIFICATION':
              messaageSendToUser(io,payload);
              break;
            case 'AUTO_ALLOCATION_START':
              messaageSendToUser(io,payload);
            break;
            default:
            break;
          }
        }
    });
    process.on('sendNotificationToAdmin', async (payload) => {
      if(payload && payload.eventType){
        switch(payload.eventType){
          case 'NEW_EVENT_BOOKING_NOTIFICATION':
            messaageSendToAdmin(io,payload);
            break;
          case 'CANCEL_EVENT_BOOKING_BY_USER':
            messaageSendToAdmin(io,payload);
            break;
          case 'EDIT_EVENT_BOOKING_BY_USER':
            messaageSendToAdmin(io,payload);
            break;      default:
          break;
        }
      }
  });
} 