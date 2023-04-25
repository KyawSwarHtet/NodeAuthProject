"use strict";

var express = require('express');

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

var morgan = require('morgan');

var cors = require('cors');

require('dotenv').config();

var path = require('path');

var userRoute = require("./router/user-route");

var app = express();
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true
}).then(console.log("connected with MONGODB", process.env.MONGO_URL))["catch"](function (err) {
  console.log(err);
});
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"](path.join(__dirname, "public")));
app.use(cors());
app.use("/ProfileImages", express["static"](path.join(__dirname, "ProfileImages")));
app.set("view engine", "ejs");
app.set("views", "views"); // api path

app.use("/user", userRoute);
var PORT = process.env.PORT || 5000;
console.log("server is running on ", PORT);
app.listen(PORT);
//# sourceMappingURL=server.dev.js.map
