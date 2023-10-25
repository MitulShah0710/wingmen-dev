const Model = require("../../../../models/index");
const Service = require("../../../../services/index");
const bcrypt = require("bcrypt-nodejs");
const moment = require("moment");
const _ = require("lodash");
const Constant = require("../../../../Constant");
const Validation = require("../../../Validations/index");
const mongoose = require("mongoose");
const stripePay = require("stripe");
const config = require("../../../../config/config");
const { forEach } = require("lodash");
const { LogContext } = require("twilio/lib/rest/serverless/v1/service/environment/log");
const { Wallet } = require("../../../../models/index");
const stripe = stripePay(config.stripKey);
// const stripe = stripePay(config.stripKeyTest);

//GET USER COUNT AND WEEK COUNT FOR DASHBOARD
let userGraphData = async (req, res) => {
    try {
        weekInput1 = [0, 0, 0, 0, 0, 0, 0];
        const query1 = { isDeleted: false };
        //CREATE QUERY FOR AGGREGATE
        const pipeline1 = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf("week").add(1, "d")),
                        $lte: new Date(moment().endOf("week").add(1, "d")),
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayofweek: {
                        $dayOfWeek: "$createdAt",
                    },
                },
            },
            {
                $group: {
                    _id: "$dayofweek",
                    totaldocs: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ];
        const weekData1 = await Model.User.aggregate(pipeline1);
        //COUNT TOTAL NUMBER OF USERS FROM DATABASE
        const count1 = await Model.User.countDocuments(query1);
        //MAPPING WEEK DATA INTO ARRAY
        weekData1.map((row) => {
            weekInput1[parseInt(row._id)] = row.totaldocs;
        });

        //CREATE RESPONSE FOR GRAPH FORMATE.
        const dataToSend1 = {
            analyticsData: {
                customers: count1,
            },
            series: [
                {
                    name: "customers",
                    data: weekInput1,
                },
            ],
        };
        //SEND DATA
        let apiResponse = Service.generate.generate(
            true,
            "Success",
            200,
            dataToSend1
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

//GET DRIVER COUNT AND WEEK COUNT FOR DASHBOARD
let driverGraphData = async (req, res) => {
    try {
        weekInput2 = [0, 0, 0, 0, 0, 0, 0];
        const query2 = { isDeleted: false };
        //CREATE QUERY FOR AGGREGATE
        const pipeline2 = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf("week").add(1, "d")),
                        $lte: new Date(moment().endOf("week").add(1, "d")),
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayofweek: {
                        $dayOfWeek: "$createdAt",
                    },
                },
            },
            {
                $group: {
                    _id: "$dayofweek",
                    totaldocs: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ];
        const weekData2 = await Model.Driver.aggregate(pipeline2);
        //COUNT TOTAL NUMBER OF DRIVER FROM DATABASE
        const count2 = await Model.Driver.countDocuments(query2);
        //MAPPING WEEK DATA INTO ARRAY
        weekData2.map((row) => {
            weekInput2[parseInt(row._id)] = row.totaldocs;
        });

        //CREATE RESPONCE FOR GRAPH FORMATE.
        const dataToSend2 = {
            analyticsData: {
                drivers: count2,
            },
            series: [
                {
                    name: "drivers",
                    data: weekInput2,
                },
            ],
        };
        //SEND DATA
        let apiResponse = Service.generate.generate(
            true,
            "Sucess",
            200,
            dataToSend2
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

//GET BOOKING COUNTS FOR DASHBOARD
let bookingGraphData = async (req, res) => {
    try {
        let pending = [];
        let complete = [];
        let cancle = [];
        var totalPend = 0;
        var totalComp = 0;
        var totalCanc = 0;

        //GET ALL TOTAL BOOKING COUNT QUERY
        const totalBooking = { isDeleted: false };

        //WEEK AGGREGATE QUERY CREATE
        if (req.body.week) {
            pending = [
                { $match: { bookingStatus: "PENDING" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("week")),
                            $lte: new Date(moment().endOf("week")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayofweek: {
                            $dayOfWeek: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayofweek",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            complete = [
                { $match: { bookingStatus: "COMPLETED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("week")),
                            $lte: new Date(moment().endOf("week")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayofweek: {
                            $dayOfWeek: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayofweek",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            cancle = [
                { $match: { bookingStatus: "CANCELED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("week")),
                            $lte: new Date(moment().endOf("week")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayofweek: {
                            $dayOfWeek: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayofweek",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
        }

        //MONTH AGGREGATE QUERY CREATE
        if (req.body.month) {
            pending = [
                { $match: { bookingStatus: "PENDING" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("month")),
                            $lte: new Date(moment().endOf("month")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfMonth: {
                            $dayOfMonth: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfMonth",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            complete = [
                { $match: { bookingStatus: "COMPLETED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("month")),
                            $lte: new Date(moment().endOf("month")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfMonth: {
                            $dayOfMonth: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfMonth",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            cancle = [
                { $match: { bookingStatus: "CANCELED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("month")),
                            $lte: new Date(moment().endOf("month")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfMonth: {
                            $dayOfMonth: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfMonth",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
        }

        //YEAR AGGREGATE QUERY CREATE
        if (req.body.year) {
            pending = [
                { $match: { bookingStatus: "PENDING" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("year")),
                            $lte: new Date(moment().endOf("year")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfYear: {
                            $dayOfYear: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfYear",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            complete = [
                { $match: { bookingStatus: "COMPLETED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("year")),
                            $lte: new Date(moment().endOf("year")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfYear: {
                            $dayOfYear: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfYear",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
            cancle = [
                { $match: { bookingStatus: "CANCELED" } },
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(moment().startOf("year")),
                            $lte: new Date(moment().endOf("year")),
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        dayOfYear: {
                            $dayOfYear: "$createdAt",
                        },
                    },
                },
                {
                    $group: {
                        _id: "$dayOfYear",
                        totaldocs: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ];
        }

        //AGGREGATE FOR COMPLETE BOOKING
        const compCount = await Model.Booking.aggregate(complete);
        for (let i = 0; i < compCount.length; i++) {
            const element = compCount[i];
            totalComp += element.totaldocs;
        }

        //AGGREGATE FOR CANCLED BOOKING
        const canCount = await Model.Booking.aggregate(cancle);
        for (let i = 0; i < canCount.length; i++) {
            const element = canCount[i];
            totalCanc += element.totaldocs;
        }

        //AGGREGATE FOR PENDING BOOKING
        const pendCount = await Model.Booking.aggregate(pending);
        for (let i = 0; i < pendCount.length; i++) {
            const element = pendCount[i];
            totalPend += element.totaldocs;
        }

        //FIND TOTAL COUNT FOR BOOKINGS
        const totalCount = await Model.Booking.countDocuments(totalBooking);

        //RESPONSE CREATE FOR GRAPH
        const dataToSend3 = {
            last_days: ["Week", "Month", "Year"],
            CompleteBooking: totalComp,
            cancleBooking: totalCanc,
            pendingBooking: totalPend,
            title: "Booking Tracker",
            totalBooking: totalCount,
        };

        let apiResponse = Service.generate.generate(
            true,
            "Sucess",
            200,
            dataToSend3
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

//GET DRIVER, CODRIVER, PAIRED-DRIVER FOR DASHBOARD
let driverStatusGraphData = async (req, res) => {
    try {
        //CREATE QUERY FOR FIND DRIVER CODRIVER AND PAIRED DRIVER COUNT.
        const driverQuery = {
            isBlocked: false,
            isDeleted: false,
            isPilot: true,
            isCopilot: false,
        };
        const coDriverQuery = {
            isBlocked: false,
            isDeleted: false,
            isPilot: false,
            isCopilot: true,
        };
        const pairedDriverQuery = {
            isBlocked: false,
            isDeleted: false,
            isPairedDriver: true,
        };

        //COUNT DRIVER CODRIVER AND PAIRED DRIVER.
        const totalDriver = await Model.Driver.countDocuments(driverQuery);
        const totalCoDriver = await Model.Driver.countDocuments(coDriverQuery);
        const totalPaired = await Model.Driver.countDocuments(pairedDriverQuery);

        //RESPONSE CREATE FOR GRAPH
        const dataToSend4 = {
            chart_info: [
                {
                    icon: "Monitor",
                    iconColor: "text-primary",
                    name: "Driver",
                    upDown: 2,
                    usage: totalDriver,
                },
                {
                    icon: "Tablet",
                    iconColor: "text-warning",
                    name: "Co_Driver",
                    upDown: 8,
                    usage: totalCoDriver,
                },
                {
                    icon: "Tablet",
                    iconColor: "text-danger",
                    name: "Paired Driver",
                    upDown: -5,
                    usage: totalPaired,
                },
            ],
        };

        let apiResponse = Service.generate.generate(
            true,
            "Sucess",
            200,
            dataToSend4
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

// TOTAL EARNING FOR DRIVER AND CO-DRIVER

let earningGraphData = async (req, res) => {


  try {
    let pipeline5 = [];
    let pipeline6 = [];
    let pipeline7 = [];
    let sum1 = 0, sum2 = 0, sum3 = 0;
    // WEEK AGGREGATE QUERY
    weekInput5 = [0, 0, 0, 0, 0, 0, 0];
    pipeline5 = [
      {
        $match: {
          createdAt: {
            $gte: new Date(moment().startOf("week").add(0, "d")),
            $lte: new Date(moment().endOf("week").add(0, "d")),
          },
        },
      },
      {
        $project: {
          driverEarningAmount: 1,
          createdAt: 1,
          total: {
            $sum: "$driverEarningAmount",
          },
          dayofweek: {
            $dayOfWeek: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$dayofweek",
          total: {
            $sum: "$driverEarningAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    const weekDriverDATA = await Model.DriverEaring.aggregate(pipeline5);
    for (var k = 0; k < weekDriverDATA.length; k++) {
        sum1 += weekDriverDATA[k].total;
    }
    weekDriverDATA.map((row) => {
      weekInput5[parseInt(row._id - 1)] = row.total;
        // weekInput5.push(row.total);
    });

    //MONTH AGGREGATE QUERY

    monthInput5 = [0, 0, 0, 0, 0,];
    pipeline6 = [
      {
        $match: {
          createdAt: {
            $gte: new Date(moment().startOf("month")),
            $lte: new Date(moment().endOf("month")),
          },
        },
      },
      {
        $project: {
          driverEarningAmount: 1,
          createdAt: 1,
          total: {
            $sum: "$driverEarningAmount",
          },
          week: {
            $week: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$week",
          total: {
            $sum: "$driverEarningAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const monthDriverDATA = await Model.DriverEaring.aggregate(pipeline6);
    for (var l = 0; l < monthDriverDATA.length; l++) {
        sum2 += monthDriverDATA[l].total;
    }
    monthDriverDATA.map((row) => {
    //   monthInput5.push(row.total);
        monthInput5[parseInt(row._id - 1)] = row.total;
    });

    //YEAR AGGREGATE QUERY

    yearInput5 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    pipeline7 = [
      {
        $match: {
          createdAt: {
            $gte: new Date(moment().startOf("year").add(1, "m")),
            $lte: new Date(moment().endOf("year").add(1, "m")),
          },
        },
      },
      {
        $project: {
          driverEarningAmount: 1,
          createdAt: 1,
          total: {
            $sum: "$driverEarningAmount",
          },
          month: {
            $month: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$month",
          total: {
            $sum: "$driverEarningAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const yearDriverDATA = await Model.DriverEaring.aggregate(pipeline7);
    for (var m = 0; m < yearDriverDATA.length; m++) {
        sum3 += yearDriverDATA[m].total;
    }
    yearDriverDATA.map((row) => {
      yearInput5[parseInt(row._id - 1)] = row.total;
    });

    //TOTAL EARNINGS
    var totalDriverEARNING = 0;
    var totalCoDriverEARNING = 0;
    var totalTipEARNING = 0;
    var totalEARNING = 0;

    const query1 = {
      isDriver: true,
      isCoDriver: false,
    };
    const query2 = {
      isDriver: false,
      isCoDriver: true,
    };
    const query3 = {
      bookingStatus: "COMPLETED",
    };
    const query4 = {
      __v: 0,
    };

    const totalDriverEarning = await Model.DriverEaring.find(query1);
    for (let i = 0; i < totalDriverEarning.length; i++) {
      const element = totalDriverEarning[i];
      totalDriverEARNING += element.driverEarningAmount;
    }
    const totalCoDriverEarning = await Model.DriverEaring.find(query2);
    for (let i = 0; i < totalCoDriverEarning.length; i++) {
      const element = totalCoDriverEarning[i];
      totalCoDriverEARNING += element.driverEarningAmount;
    }
    const totalTipEarning = await Model.DriverEaring.find(query3);
    for (let i = 0; i < totalTipEarning.length; i++) {
      const element = totalTipEarning[i];
      totalTipEARNING += element.isTipAmount;
    }
    const totalEarnings = await Model.DriverEaring.find(query4);
    for (let i = 0; i < totalEarnings.length; i++) {
      const element = totalEarnings[i];
      totalEARNING += element.driverEarningAmount;
    }

    // GROWTH
    const weekGrowth = sum1;
    const monthGrowth = sum2 - sum1;
    const yearGrowth = sum3 - sum2;
    // RESPONSE CREATE FOR GRAPH
    const dataToSend5 = {
      last_days: ["Week", "Month", "Year"],
      weekGrowth,
      monthGrowth,
      yearGrowth,
      totalDriverEARNING,
      totalCoDriverEARNING,
      totalTipEARNING,
      totalEARNING,
      EarningsPerDay: weekInput5,
      EarningsPerWeek: monthInput5,
      EarningsPerMonth: yearInput5,
    };

    let apiResponse = Service.generate.generate(
      true,
      "Success",
      200,
      dataToSend5
    );
    res.send(apiResponse);
  } catch (error) {
    let apiResponse = Service.generate.generate(true, "Error", 500, error);
    res.send(apiResponse);
  }
};

//GET DEVICE TYPE FOR DASHBOARD
let deviceTypeGraphData = async (req, res) => {
    try {
        //CREATE QUERY FOR FIND DEVICE TYPE.
        const androidDevice = { deviceType: "ANDROID" };
        const iosDevice = { deviceType: "IOS" };

        //COUNT DEVICE TYPE.
        const totalAndroid = await Model.Device.countDocuments(androidDevice);
        const totalIos = await Model.Device.countDocuments(iosDevice);

        //RESPONSE CREATE FOR GRAPH
        const dataToSend = {
            chart_info: {
                android: totalAndroid,
                ios: totalIos,
            },
        };

        let apiResponse = Service.generate.generate(
            true,
            "Sucess",
            200,
            dataToSend
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

// GET PROMOCODE DATA FOR DASHBOARD
let promoGraphData = async (req, res) => {
    try {
        const PastMonth = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(
                            moment().startOf("month").subtract(1, "months").add(1, "d")
                        ),
                        $lte: new Date(
                            moment().endOf("month").subtract(1, "months").add(1, "d")
                        ),
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayofmonth: {
                        $dayOfMonth: "$createdAt",
                    },
                },
            },
            {
                $group: {
                    _id: "$dayofmonth",
                    totaldocs: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ];

        const weeklydata = await Model.PromoLog.aggregate(PastMonth);
        totalInput1 = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
        ];

        weeklydata.map((row) => {
            totalInput1[parseInt(row._id)] = row.totaldocs;
        });

        let farray1 = [0, 0, 0, 0, 0, 0, 0];

        b = [];
        let sum = 0, sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0, sum5 = 0;
        indivsum = [];

        arr1 = [];

        while (totalInput1.length) {
            b = totalInput1.splice(0, 7);

            sum = 0;
            farray1 = [b[0], b[1], b[2], b[3], b[4], b[5], b[6]];

            for (let k = 0; k < farray1.length; k++) {
                const element1 = farray1[k];
                if (farray1[k] == undefined) {
                    sum;
                    break;
                } else {
                    sum += element1;
                }
            }
            arr1.push(sum);
        }
        // console.log(arr1);

        sum1 = arr1[0];
        sum2 = arr1[1];
        sum3 = arr1[2];
        sum4 = arr1[3];
        sum5 = arr1[4];

        const currentMonth = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(moment().startOf("month").add(1, "d")),
                        $lte: new Date(moment().endOf("month").add(1, "d")),
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayofmonth: {
                        $dayOfMonth: "$createdAt",
                    },
                },
            },
            {
                $group: {
                    _id: "$dayofmonth",
                    totaldocs: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ];

        const currentweeklydata = await Model.PromoLog.aggregate(currentMonth);
        totalInput2 = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0,
        ];

        currentweeklydata.map((row) => {
            totalInput2[parseInt(row._id)] = row.totaldocs;
        });

        let farray2 = [0, 0, 0, 0, 0, 0, 0];

        b = [];
        let avgsum = 0;
        let sum6 = 0;
        let sum7 = 0;
        let sum8 = 0;
        let sum9 = 0;
        let sum10 = 0;
        indivsum = [];

        arr2 = [];

        while (totalInput2.length) {
            c = totalInput2.splice(0, 7);
            // console.log(b);

            avgsum = 0;
            farray2 = [c[0], c[1], c[2], c[3], c[4], c[5], c[6]];
            // console.log(farray1);

            for (let l = 0; l < farray2.length; l++) {
                const element2 = farray2[l];
                if (farray2[l] == undefined) {
                    avgsum;
                    break;
                } else {
                    avgsum += element2;
                }
            }
            arr2.push(avgsum);
        }
        //   console.log(arr2);

        sum6 = arr2[0];
        sum7 = arr2[1];
        sum8 = arr2[2];
        sum9 = arr2[3];
        sum10 = arr2[4];

        // TOTAL WEEKLY PROMOCODE USED
        const dataToSend2 = {
            series: [
                {
                    name: "Past Month",
                    data: [sum1, sum2, sum3, sum4, sum5],
                },
                {
                    name: "This Month",
                    data: [sum6, sum7, sum8, sum9, sum10],
                },
            ],
        };

        let apiResponse = Service.generate.generate(
            true,
            "Success",
            200,
            dataToSend2
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

// // TYPE OF TRANSACTION / PAYMENT DONE THROUGH
let transactionGraphData = async (req, res) => {
    try {
        var refundAMT = 0;
        var totalWalletAMT = 0;
        var totalCashAMT = 0;

        const query = {
            paymentMode: "WALLET",
        };

        //AGGREGATE FOR WALLET TRANSACTION
        const totalWalletAmt = await Model.DriverEaring.find(query);

        for (let i = 0; i < totalWalletAmt.length; i++) {
            const element = totalWalletAmt[i];
            totalWalletAMT += element.driverEarningAmount;
        }

        const query1 = {
            paymentMode: "CASH",
        };

        const totalCashAmt = await Model.DriverEaring.find(query1);

        for (let i = 0; i < totalCashAmt.length; i++) {
            const element = totalCashAmt[i];
            totalCashAMT += element.driverEarningAmount;
        }

        const query2 = {
            isDeleted: false,
        };

        const totalRefundAmt = await Model.Refund.find(query2);

        for (let i = 0; i < totalRefundAmt.length; i++) {
            const element = totalRefundAmt[i];
            refundAMT += element.amount;
        }

        //RESPONSE CREATE FOR GRAPH
        const dataToSend = {
            totalWALLETAMT: totalWalletAMT,
            totalCASHAMT: totalCashAMT,
            totalREFUNDAMT: refundAMT,
        };

        let apiResponse = Service.generate.generate(
            true,
            "Sucess",
            200,
            dataToSend
        );
        res.send(apiResponse);
    } catch (error) {
        let apiResponse = Service.generate.generate(true, "Error", 500, error);
        res.send(apiResponse);
    }
};

let usersWalletAmount = async (req, res) => {
    try {
        const query = { isDeleted: false };
        const limit = parseInt(req.body.limit) || 10;
        const skip = parseInt(req.body.skip) || 0;
        const page = parseInt(req.body.page) || 1;
        if (req.body.search != undefined) {
            query.$or = [
              {
                firstName: {
                  $regex: req.body.search,
                  $options: 'i',
                },
              },
            ];
        }
        const users = await Model.User.find(query).limit(limit).skip((page - 1) * limit);
        const count = await Model.User.countDocuments(query);
        const result = {
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
        // for (let i = 0; i < users.length; i++) {
        //     const element1 = users[i].firstName;
        //     const element = users[i].walletAmount;
        //     dataToSend.push(element1);
        //     dataToSend.push(element);
        //     console.log(i);
        // } 
        return res.ok(true, 'SUCCESS', result);
        // return res.success(true, null, await Model.ContactUs.find(query).limit(limit).skip(skip).sort({ createdAt: -1 }), count);
    } 
    catch (error) 
    {
        return res.serverError(Constant.serverError);
    }
};

let addWalletAmtToUser = async (req, res) => {
    try {
        const User = await Model.User.findById(req.body._id);
        const wallet = User.walletAmount;
        const amt = req.body.walletAmt;
        const newWallet = parseInt(wallet) + parseInt(amt);
        const finaldata = await Model.User.findByIdAndUpdate(req.body._id, {walletAmount: newWallet});
        const updatedData = await Model.User.findById(req.body._id);
        const dataToSave = {
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            walletAmount: amt,
        }
        const saveData = await Model.Wallet(dataToSave).save();
        return res.ok(true, Constant.walletCharged, `Wallet now $${newWallet}`);
    } catch (error) {
        return res.serverError(Constant.serverError);
    }
}

let walletGraphData = async (req, res) => {
    try {
        
        const totalWalletAmtAdded = await Wallet.aggregate([
            // {$match: constant.excludeDeleted},  
            // {$match: {status: 'kept'}},  
            {$project: {walletAmount: 1}},  
            {$group: {_id:"_id", totalAmountAdded: { $sum: "$walletAmount"}}},
            {$project: { totalAmountAdded: 1, _id: 0}},
          ])
        return res.ok(true, 'SUCCESS', totalWalletAmtAdded);
    } catch (error) {
        return res.serverError(Constant.serverError);
    }
}

let walletAmtAddedList = async(req, res) => {
    const list = await Model.Wallet.aggregate([
        { $project : { _id : 0, firstName : 1, lastName: 1, walletAmount : 1} }
      ])
    return res.ok(true, 'SUCCESS', list);
}

//EXPORT ALL FUNCTIONS
module.exports = {
    userGraphData: userGraphData,
    driverGraphData: driverGraphData,
    bookingGraphData: bookingGraphData,
    driverStatusGraphData: driverStatusGraphData,
    deviceTypeGraphData: deviceTypeGraphData,
    transactionGraphData: transactionGraphData,
    earningGraphData: earningGraphData,
    promoGraphData: promoGraphData,
    usersWalletAmount: usersWalletAmount,
    addWalletAmtToUser: addWalletAmtToUser,
    walletGraphData: walletGraphData,
    walletAmtAddedList: walletAmtAddedList
};
