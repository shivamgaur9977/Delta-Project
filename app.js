if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/expressError.js');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto : {
    secret : process.env.SECRET,
  },
  touchAfter : 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    magAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


app.get("/category/trending", async(req, res) => {
  let category = "Trending";
  let listings = await Listing.find({category: "Trending"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/rooms", async(req, res) => {
  let category = "Rooms";
  let listings = await Listing.find({category: "Rooms"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/iconic_cities", async(req, res) => {
  let category = "Iconic Cities";
  let listings = await Listing.find({category: "Iconic Cities"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/mountain", async(req, res) => {
  let category = "Mountains";
  let listings = await Listing.find({category: "Mountain"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/castles", async(req, res) => {
  let category = "Castles"
  let listings = await Listing.find({category: "Castles"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/amazing_pools", async(req, res) => {
  let category = "Amazing Pools";
  let listings = await Listing.find({category: "Amazing Pools"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/camping", async(req, res) => {
  let category = "Camping";
  let listings = await Listing.find({category: "Camping"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/farms", async(req, res) => {
  let category = "Farms"
  let listings = await Listing.find({category: "Farms"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/arctic", async(req, res) => {
  let category = "Trending";
  let listings = await Listing.find({category: "Artic"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/category/domes", async(req, res) => {
  let category = "Domes";
  let listings = await Listing.find({category: "Domes"});
  res.render("listings/category.ejs", {listings, category});
});

app.get("/search", async(req, res) => {
  let searchQuery = (req.query.q).trim();
  let query = searchQuery.split(' ');
  if (query.length> 1) {
    let query1 = query[0][0].toUpperCase() + query[0].slice(1).toLowerCase();
    let query2 = query[1][0].toUpperCase() + query[1].slice(1).toLowerCase();
    query = query1+ " "+query2;
    let listings = await Listing.find({country:`${query}`});
    res.render("listings/searchQuery.ejs", {listings, searchQuery});
  }else {
    query = searchQuery[0].toUpperCase()+ searchQuery.slice(1);
    let listings = await Listing.find({country:`${query}`});
    res.render("listings/searchQuery.ejs", {listings, searchQuery});
  }
});
// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username:"delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

//Listing Router require:- 
app.use("/listings", listingRouter);

//Review Router Require:-
app.use("/listings/:id/reviews", reviewRouter);

//User Router requiring:-
app.use("/", userRouter);

//Page Not Found Middleware: -
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found !"));
});

//Middleware for Error:-
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});