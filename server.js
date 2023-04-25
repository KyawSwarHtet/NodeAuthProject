const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const path = require('path')

const userRoute = require("./router/user-route")

const app = express()

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
}).then(console.log("connected with MONGODB",process.env.MONGO_URL)).catch((err) => {
    console.log(err)
})


app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")));
app.use(cors())
app.use(
  "/ProfileImages",
  express.static(path.join(__dirname, "ProfileImages"))
);

app.set("view engine", "ejs");
app.set("views", "views")

// api path
app.use("/user", userRoute);



const PORT = process.env.PORT || 5000
console.log("server is running on ",PORT)
app.listen(PORT)