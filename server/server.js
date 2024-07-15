const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const facebook = require("./api/facebook");
require("dotenv").config();

const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Shranimo originalno ime slike
  },
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API poti
app.use("/api/facebook", upload.single("image"), facebook);

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
