const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const facebook = require("./api/facebook");
const instagram = require("./api/instagram");
const linkedin = require("./api/linkedIn");
const twitter = require("./api/twitter");
const reddit = require("./api/reddit");
const threads = require("./api/threads");

const app = express();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB omejitev za slike in videe
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/facebook", upload.single("media"), facebook);
app.use("/api/instagram", upload.single("media"), instagram);
app.use("/api/linkedin", upload.single("media"), linkedin);
app.use("/api/twitter", upload.single("media"), twitter);
app.use("/api/reddit", upload.single("media"), reddit);
app.use("/api/threads", upload.single("media"), threads);

app.get("/", (req, res) => {
  res.send("Strežnik je aktiven.");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
