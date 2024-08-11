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
const ai = require("./api/ai");

const app = express();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let dynamicConfig = {};

app.post("/api/env", (req, res) => {
  console.log("Received POST request to /api/env");
  console.log("Request body:", req.body);

  const { facebookPageID, facebookPageAccessToken, ...rest } = req.body;

  dynamicConfig = {
    facebookPageID,
    facebookPageAccessToken,
    ...rest,
  };

  res.status(200).send("Configuration updated");
});

app.use((req, res, next) => {
  req.dynamicConfig = dynamicConfig;
  next();
});

app.use("/api/facebook", upload.single("media"), facebook);
app.use("/api/instagram", upload.single("media"), instagram);
app.use("/api/linkedin", upload.single("media"), linkedin);
app.use("/api/twitter", upload.single("media"), twitter);
app.use("/api/reddit", upload.single("media"), reddit);
app.use("/api/threads", upload.single("media"), threads);
app.use("/api/ai", ai);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(5001, () => {
  console.log("Server is running on port 5001");
});
