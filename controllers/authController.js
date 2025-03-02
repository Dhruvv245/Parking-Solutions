const { promisify } = require(`util`);
const jwt = require(`jsonwebtoken`);
const catchAsync = require('./../utils/catchAsync');
const User = require(`./../models/userModel`);
const AppError = require(`./../utils/appError`);
const Email = require(`../utils/email`);
const crypto = require(`crypto`);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === `production` ? true : false,
  };
  res.cookie(`jwt`, token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: `success`,
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get(`host`)}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.signin = async (req, res, next) => {
  const { email, password } = req.body;
  //1.Check if the mail and password exist
  if (!email || !password) {
    return next(new AppError(`Please provide your email and password`, 400));
  }
  //2.Check if user exists && password is correct
  const user = await User.findOne({ email }).select(`+password`);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect email or password`, 401));
  }
  //3.If everything is Ok,send token to client
  createSendToken(user, 200, res);
};

exports.protect = catchAsync(async (req, res, next) => {
  //1.Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(`Bearer`)
  ) {
    token = req.headers.authorization.split(` `)[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token || token.split(`.`).length !== 3) {
    return next(
      new AppError(`You are not logged in! Please log in to get access`, 401)
    );
  }
  //2.Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3.Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError(`The user with this token doesn't exist`, 401));
  }
  //4.Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(`Password changed recently! Please login again`, 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

exports.logout = (req, res) => {
  res.cookie(`jwt`, `logged out`, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: `success`,
  });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You don't have permission to perform this action`, 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`There is no user with this email address`, 404));
  }
  //2.Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3.Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      `host`
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendpasswordReset();
    res.status(200).json({
      status: `success`,
      message: `Token sent to email!`,
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        `There was an error in sending the email! Try again later`,
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1.Get user based on the token
  const hashedToken = crypto
    .createHash(`sha256`)
    .update(req.params.token)
    .digest(`hex`);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2.If the token has not expired and there is a user, set the new password
  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3.Update the changePasswordAt property for the user
  //4.Log the user in, send the JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1.Get user from collection
  const user = await User.findById(req.user.id).select(`+password`);
  //2.Check if the POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError(`Your current password is wrong`, 401));
  //3.If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4.Log user in, send JWT
  createSendToken(user, 200, res);
});
