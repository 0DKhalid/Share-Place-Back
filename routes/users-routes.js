const express = require('express');
const { check } = require('express-validator');

const {
  getAllUsers,
  userSignup,
  userLogin
} = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', getAllUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').notEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  userSignup
);

router.post('/login', userLogin);

module.exports = router;
