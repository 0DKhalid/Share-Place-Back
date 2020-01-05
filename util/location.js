const axios = require('axios');

const HttpError = require('../models/error-handler');

const API_KEY = 'AIzaSyCC68KiU89t67N9o553vfaYMGB25Palies';

async function getCoordinatesByAddress(address) {
  // const response = await axios.get(
  //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
  //     address
  //   )}&key=${API_KEY}`
  // );
  // const data = response.data;
  // if (!data || data.status === 'ZERO_RESULTS' || data.results.length === 0) {
  //   throw new HttpError('No Place found with this Address', 422);
  // }

  // console.log(data);
  // const coordinates = data.results[0].geometry.location;

  return {
    lat: 24.9417598,
    lng: 46.712393
  };
}

module.exports = getCoordinatesByAddress;
