const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const response = require('./responses/index');
const config = require('./config/config');
const connection = require('./connection/connect');
const route = require('./route');
const app = express();
const morgan = require('morgan');
const fs = require('fs');
const socket = require('../server/sockets/index');
const cronJob = require('../server/v1/cron/cronjobs');
const cron = require("node-cron");
const { DriverController, UserController } = require('./v1/controllers');

// const options = {
//   key: fs.readFileSync("/etc/letsencrypt/live/mywngmn.com/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/mywngmn.com/fullchain.pem")
// };
// const options = {
//   cert: fs.readFileSync("/etc/letsencrypt/live/app.mywngmn.com/fullchain.pem"),
//   key: fs.readFileSync("/etc/letsencrypt/live/app.mywngmn.com/privkey.pem")
// };
// const server = require('https').createServer(app);
const server = require('http').createServer(app);
app.use(response.ok, response.serverError, response.forbidden, response.success);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', route);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '../server/uploads/')));

//app.use(express.static((path.join(__dirname,"../server/swagger"))));
const io = require('socket.io')(server)
socket(io)
connection.connect().then(success => {
  server.listen(config.port || 3000, () => {
    // server.listen(3081, () => {
    console.log(`Running on port ${config.port}.`);
    console.log(success);
  });
}).catch(error => {
  console.log('Db not connected!')
});

cronJob.startCronJobs();

cron.schedule('1 * * * * *', async function bookingConfirm() 
  {
    DriverController.ScheduledConfirmBookingStatus();
    DriverController.Reminder48();
    DriverController.Reminder24();
    DriverController.Reminder6();
    DriverController.assignEventDrivers();
    // UserController.paymentByDefault();
})

