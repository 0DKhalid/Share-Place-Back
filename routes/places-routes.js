const express = require('express');
const { check } = require('express-validator');

const {
  getPlaceById,
  getPlacesByUserId,
  postPlace,
  updatePlace,
  deletePlace
} = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getPlacesByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    (check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty())
  ],
  postPlace
);

router.patch('/:pid', updatePlace);

router.delete('/:pid', deletePlace);

module.exports = router;
