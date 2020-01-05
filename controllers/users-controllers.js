const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/error-handler');
const User = require('../models/user');

exports.getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (error) {
    const err = new HttpError('Could not find users, Please try agian', 500);
    return next(err);
  }

  if (!users || !users.length) {
    return next(new HttpError('No Users Found!', 404));
  }

  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

//user signup controller
exports.userSignup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid Inputs Passed, Please Check Your Data!', 422)
    );
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    const err = new HttpError('Signup faild, Please try agian later!', 500);
    return next(err);
  }

  if (existingUser) {
    return next(new HttpError('email alredy used!', 422));
  }

  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError('Could not create user please try again', 500);
    return next(err);
  }

  const newUser = new User({
    name,
    email,
    password: hashPassword,
    image: req.file.path,
    places: []
  });

  try {
    await newUser.save();
  } catch (error) {
    const err = new HttpError('Could not Save user, Please try again', 500);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SEC,
      { expiresIn: '1h' }
    );
  } catch (error) {
    const err = new HttpError('Could not create user! try again', 500);
    return next(err);
  }

  res.json({
    message: 'Signup success',
    userId: newUser.id,
    email: newUser.email,
    token
  });
};

//user login controller
exports.userLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let userExisit;

  try {
    userExisit = await User.findOne({ email });
  } catch (error) {
    const err = new HttpError(
      'Somthing worng went, When we try to find user',
      500
    );
    return next(err);
  }

  if (!userExisit) {
    return next(new HttpError('wrong cordintial!', 401));
  }

  let isValidPass;
  try {
    isValidPass = await bcrypt.compare(password, userExisit.password);
  } catch (error) {
    const err = new HttpError('Could not Login please try again', 500);
    return next(err);
  }

  if (!isValidPass) {
    return next(new HttpError('wrong cordintial!', 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: userExisit.id, email: userExisit.email },
      process.env.JWT_SEC,
      { expiresIn: '1h' }
    );
  } catch (error) {
    const err = new HttpError('Could not login user! try again111', 500);
    return next(err);
  }

  res.json({
    message: 'Login success!',
    userId: userExisit.id,
    email: userExisit.email,
    token
  });
};
