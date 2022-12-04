var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var logger = require("morgan");
var cors = require("cors");

var usersRouter = require("./routes/usersRouter");
var campaignsRouter = require("./routes/campaignsRouter");
var imagesRouter = require("./routes/imagesRouter");

var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/users", usersRouter);
app.use("/campaigns", campaignsRouter);
app.use("/images", imagesRouter);

module.exports = app;
