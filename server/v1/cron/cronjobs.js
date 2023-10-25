const Constant = require('../../Constant');
const moment=require('moment');
const Model = require('../../models/index');
const Service = require('../../services/index');
const mongoose = require('mongoose');
const driverController = require('../../v1/controllers/DriverController');
const Agenda = require('agenda');
const agenda = new Agenda({db: {address:'mongodb+srv://manthan:manthan@cluster0.xgqwh.mongodb.net/wingmen',collection: 'scheduledbookings'}});
// const agenda = new Agenda({db: {address:'mongodb://localhost:27017/wingmen',collection: 'scheduledbookings'}});

exports.startCronJobs=startCronJobs;
exports.sendNotificationToUserForCancelBookingDelayTime=sendNotificationToUserForCancelBookingDelayTime;

async function sendNotificationToUserForCancelBooking(bookingData,userData){
    let payload={
        title:'Wingmen',
        message:Constant.bookingMessages.noDriverAvailabeltripCanceled,
        eventType:Constant.eventType.noDriverAvailableCancelBooking,
        receiverId:bookingData.userId,
        bookingData:bookingData,
        bookingId:bookingData._id,
        isUserNotification:true,
        isNotificationSave:false
    };
    let setObj={
        bookingStatus:'CANCELED',
        isCanceledByCron:true
    }
    await Model.Booking.update({_id:mongoose.Types.ObjectId(bookingData._id)},{$set:setObj});
    if(bookingData.driverId){
        await driverController.driverAvailabelStausUpdate(driverData);
    }
    if(bookingData.coDriverId){
        await driverController.driverAvailabelStausUpdate(coDriverData);
    }
    if(userData && userData.isNotification){
        const userDeviceData=await Model.Device.find({userId:mongoose.Types.ObjectId(bookingData.userId)});
        if(userDeviceData && userDeviceData.length){
            for(let i=0;i<userDeviceData.length;i++){
                payload.token=userDeviceData[i].deviceToken;
                if(userDeviceData[i].deviceType=='IOS'){
                   Service.PushNotificationService.sendIosPushNotification(payload);
                }else if(userDeviceData[i].deviceType=='ANDROID'){
                    Service.PushNotificationService.sendAndroidPushNotifiction(payload);
                }
            }
        }
    }
    payload.isNotificationSave=true;
    payload.socketType=Constant.socketType.user;
    process.emit("sendNotificationToUser",payload);
}
async function sendNotificationToUserForCancelBookingDelayTime(bookingData,userData){
    setTimeout(async function () {
        console.log("delay 10 second")
        await sendNotificationToUserForCancelBooking(bookingData,userData)
      }, 1000);
}
/*
GET BOOKING DETAILS
LAST FIVE MIN WITH
PENDING STATE
IS SCHEDULED FALSE
*/
async function getBooking(bookingDataObj){
try {
    let nowTime = moment().subtract(5,'m').toISOString();
    let criteria={
        _id:mongoose.Types.ObjectId(bookingDataObj.bookingId),
        bookingStatus:'PENDING',
        isTripAllocated:true,
        isSheduledBooking:false,
        createdAt:{$lt:nowTime}
    }
    const bookingData=await Model.Booking.findOne(criteria);
    if(bookingData){
        const userData=await Model.User.findOne({_id:bookingData.userId},{isNotification:1})
        sendNotificationToUserForCancelBookingDelayTime(bookingData,userData);
    }
    if(bookingData && bookingData.paymentMode==Constant.paymentMode.wallet ||
        bookingData.paymentMode==Constant.paymentMode.card){
        await Model.User.update({_id: mongoose.Types.ObjectId(bookingData.userId)},
            {$inc:{walletAmount:(bookingData.totalAmount)}});
    }
    if(bookingData && bookingData.paymentMode==Constant.paymentMode.cash){
        await Model.User.update({_id: mongoose.Types.ObjectId(bookingData.userId)},
        {$inc:{walletAmount:(bookingData.walletAmount )}});
    }
} catch (error) {

}
}

/*
CRON FOR AUTO ALLOCATION API'S
*/

agenda.define('bookingScheduled', async job => {
    const bookingData=job.attrs.data;
    if(bookingData && bookingData.bookingId){
        console.log("booking scheduled",bookingData.bookingId)
        driverController.cronForAutoAllocation({bookingId:bookingData.bookingId});
        job.remove(function(err) {
            if(!err) console.log("Successfully removed  job from collection");
        })
    }
  });
  agenda.define('cancelBookingScheduled', async job => {
    const bookingData=job.attrs.data;
    if(bookingData && bookingData.bookingId){
        console.log("cancel booking scheduled",bookingData.bookingId)
        getBooking({bookingId:bookingData.bookingId});
        job.remove(function(err) {
            if(!err) console.log("Successfully removed canceled job from collection");
        })
    }
  });
async function startCronJobs(){
    await agenda.start();

}

process.on('scheduleBooking',async(bookingData)=>{
    console.log("date",new Date(bookingData.bookingDate))
    await agenda.schedule(new Date(bookingData.bookingDate), 'bookingScheduled',{bookingId:bookingData._id});
})
process.on('scheduleBookingForCancel',async(scheduleObj)=>{
    let second=scheduleObj.adminData.timeToScheduled || 30;
    console.log("cancel date",new Date(moment(scheduleObj.bookingData.bookingDate).add(second,'s')));
    await agenda.schedule(new Date(moment(scheduleObj.bookingData.bookingDate).add(second,'s')), 'cancelBookingScheduled',{bookingId:scheduleObj.bookingData._id});
})
