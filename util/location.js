const axios = require('axios');

const HttpError = require('../models/error-handler');

async function getCoordinatesByAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );
  const data = response.data;
  if (!data || data.status === 'ZERO_RESULTS' || data.results.length === 0) {
    throw new HttpError('No Place found with this Address', 422);
  }

  // console.log(data);
  const coordinates = data.results[0].geometry.location;

  return coordinates;
  // IF YOU DONT HAVE GOOGLE API KEY YOU CAN RETURN DUMMY LOCATION
  // return {
  //   lat: 24.9417598,
  //   lng: 46.712393
  // };
}

module.exports = getCoordinatesByAddress;
