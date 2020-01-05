const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getCoordinatesByAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/error-handler');

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError('Could not find place somthing worng went!', 500);
    return next(err);
  }

  if (!place) {
    return next(new HttpError('Could not find place with this  id', 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

//get all user places
exports.getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    const err = new HttpError(
      'Could not find user place somthing worng went!',
      500
    );
    return next(err);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('Could not find place with this user id', 404));
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

//create new Place
exports.postPlace = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(
      new HttpError('Invalid Inputs Passed, Please Check Your Data!', 422)
    );
  }
  const { title, address, description } = req.body;

  let coordinates;
  try {
    //call google api to get coordinates for given address
    coordinates = await getCoordinatesByAddress(address);
  } catch (error) {
    return next(error);
  }

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    const err = new HttpError('Somthing worng went, Could not find user!', 500);

    return next(err);
  }

  if (!user) {
    return next(new HttpError('Could find user with this id!', 404));
  }

  const newPlace = new Place({
    title,
    address,
    description,
    image: req.file.path,
    location: coordinates,
    creator: req.userData.userId
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError('Could not create Place!', 500);
    return next(err);
  }

  res.status(201).json({ place: newPlace });
};

//update exisiting palce
exports.updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      'Somthing worng went, We colud not update palce!',
      500
    );
    return next(err);
  }

  if (!place) {
    return next(new HttpError('No Place Found!', 404));
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place', 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError(
      'Somthing wrong went, We could not save updated Place',
      500
    );
    return next(err);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

// Delete exisiting Place
exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    const err = new HttpError(
      'Somthing worng went!, We could not find place',
      500
    );
    return next(err);
  }

  if (!place) {
    return next(new HttpError('No Place Found!', 404));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError('You are not allowed to remove this place', 401));
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    console.log(error);
    const err = new HttpError(
      'Somthing worng went!, We could not find place',
      500
    );
    return next(err);
  }

  fs.unlink(imagePath, error => {
    console.log(error);
  });

  res.json({ message: ' palce has been removed!' });
};
