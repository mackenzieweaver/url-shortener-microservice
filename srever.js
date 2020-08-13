"use strict";

var cors = require("cors");
var express = require("express");
var app = express();
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

// parse data coming from post requests
var bodyParser = require("body-parser");
// mount the body-parser
app.use(bodyParser.urlencoded({ extended: false }));

/** this project needs a db !! **/
const mongoose = require("mongoose");
mongoose.connect(process.env.URI, { useNewUrlParser: true });

// Schemas and models
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});
const Url = mongoose.model("Url", urlSchema);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // connected
  console.log("Database connected");
  app.post("/api/shorturl/new",
    function handler(req, res) {
      const doc = new Url({original_url: req.body.url, short_url: Math.floor(Math.random() * 100)});
      doc.save();
      res.json(doc);
    }
  );
});

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:ext", function handler(req, res) {
  Url.findOne({ short_url: req.params.ext }, (err, doc) => {
    if(err) console.log(err);
    else res.redirect(doc.original_url);
  });
});

// Basic Configuration
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Node.js listening on port " + port + " ...");
});
