const Listing = require(".../models/listing.js");
const axios = require("axios");


async function geocodeLocation(location, country) {
    try {
        const encodedLocation = encodeURIComponent(`${location}, ${country}`);
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`);
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: lat, longitude: lon };
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error geocoding location:', error.message);
        return null;
    }
}

const coords = await geocodeLocation(listing.location, listing.country);

module.exports = coords;
