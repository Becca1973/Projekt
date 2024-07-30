const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const facebook = require("./api/facebook");
const instagram = require("./api/instagram");
const linkedin = require("./api/linkedIn");
const twitter = require("./api/twitter");
const reddit = require("./api/reddit");
const threads = require("./api/threads");

require("dotenv").config();

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = req.body.directory || "uploads";
    cb(null, path.join(__dirname, directory));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/facebook", upload.single("image"), facebook);
app.use("/api/instagram", upload.single("image"), instagram);
app.use("/api/linkedin", upload.single("image"), linkedin);
app.use("/api/twitter", upload.single("image"), twitter);
app.use("/api/reddit", upload.single("image"), reddit);
app.use("/api/threads", upload.single("image"), threads);

app.get("/", (req, res) => {
  res.send("Strežnik je aktiven.");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
