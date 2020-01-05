const jwt = require('jsonwebtoken');

const HttpError = require('../models/error-handler');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Authentication Faild', 401);
    }

    const { userId, email } = jwt.verify(token, process.env.JWT_SEC);

    req.userData = {
      userId,
      email
    };

    next();
  } catch (error) {
    const err = new HttpError('Authentication Faild', 401);
    return next(err);
  }
};
