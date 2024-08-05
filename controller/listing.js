const Listing = require("../models/listing.js");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/tilesets");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({path: "reviews", populate: {path:"author"}})
        .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you are request for does not exist");
        res.redirect("/listings");
    }


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
    
    const coordinates = await geocodeLocation(listing.location, listing.country);
    console.log(`latitude: ${coordinates.latitude}, longitude: ${coordinates.longitude}`);
    res.render("listings/show.ejs", { listing, coordinates });
};

module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you are request for does not exist");
        res.redirect("/listings");
    }
    let orginalImageUrl = listing.image.url;
    let originalImageUrl = orginalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing update succesfully !");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};