var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");

const PublishedCampaign = require("./models/publishedCampaign");
PublishedCampaign.find();
const PublishedReward = require("./models/publishedReward");
PublishedReward.find();

var usersRouter = require("./routes/usersRouter");
var unpublishedCampaignsRouter = require("./routes/unpublishedCampaignsRouter");
var publishedCampaignsRouter = require("./routes/publishedCampaignsRouter");
var imagesRouter = require("./routes/imagesRouter");

var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/users", usersRouter);
app.use("/unpublishedCampaigns", unpublishedCampaignsRouter);
app.use("/publishedCampaigns", publishedCampaignsRouter);
app.use("/images", imagesRouter);

module.exports = app;
