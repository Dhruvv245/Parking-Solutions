const Parking = require(`./../models/parkingModel`);
const catchAsync = require(`../utils/catchAsync`);

exports.getHome = catchAsync(async (req, res, next) => {
  res.status(200).render('home', {
    title: `Home`,
  });
});