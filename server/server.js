const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");

const facebook = require("./api/facebook");
const instagram = require("./api/instagram");
const linkedin = require("./linkedin");
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
app.use("/uploads", express.static("uploads"));

// API poti
app.use("/api/facebook", upload.single("image"), facebook);
app.use("/api/instagram", upload.single("image"), instagram);
app.use("/api/linkedin", linkedin);

app.get("/", (req, res) => {
  res.send("Strežnik je aktiven.");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
