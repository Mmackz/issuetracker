"use strict";
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const db = require("./connection");
const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

let app = express();

app.use("/public", express.static(path.join(__dirname, "/public")));

//For FCC testing purposes only
app.use(cors({ origin: "*" }));
fccTestingRoutes(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db(async (client) => {
   const myDB = await client.db("issuetracker").collection("issues");
   //Routing for API
   apiRoutes(app, myDB);
});

//Sample front-end
app.route("/:project/").get(function (req, res) {
   res.sendFile(path.join(__dirname, "/views/issue.html"));
});

//Index page (static HTML)
app.route("/").get(function (req, res) {
   res.sendFile(path.join(__dirname, "/views/index.html"));
});

//404 Not Found Middleware
app.use(function (req, res, next) {
   res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
   console.log("Your app is listening on port " + listener.address().port);
   if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
      setTimeout(function () {
         try {
            runner.run();
         } catch (e) {
            console.log("Tests are not valid:");
            console.error(e);
         }
      }, 3500);
   }
});

module.exports = app; //for testing
