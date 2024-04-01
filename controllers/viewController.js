const Parking = require(`./../models/parkingModel`);
const User = require(`./../models/userModel`);
const catchAsync = require(`../utils/catchAsync`);

exports.getHome = catchAsync(async (req, res, next) => {
  res.status(200).render('home', {
    title: `Home`,
  });
});

exports.findParking = catchAsync(async (req, res, next) => {
  const parkings = await Parking.find();
  res.status(200).render(`findParking`, {
    title: `Find Parking`,
    parkings,
  });
});

exports.listParking = catchAsync(async (req, res, next) => {
  res.status(200).render(`listParking`, {
    title: `List Parking`,
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render(`accountTry`, {
    title: `Your account`,
  });
});
