const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
const CLIENT_ID = process.env.FACEBOOK_APP_ID;
const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;
let ACCESS_TOKEN = ""; // Shared Access Token

// Pridobivanje Access Tokena s pomočjo App ID in Secret
const getAccessToken = async () => {
  try {
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/oauth/access_token",
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      }
    );
    ACCESS_TOKEN = tokenResponse.data.access_token;
  } catch (error) {
    console.error("Napaka pri pridobivanju Access Tokena:", error);
  }
};

// Get Access Token ob zagonu strežnika
getAccessToken();

// Posreduj Access Token v podmodula
app.use((req, res, next) => {
  req.accessToken = ACCESS_TOKEN;
  next();
});

// Import routes
const instagramRoutes = require("./api/instagram");
const facebookRoutes = require("./api/facebook");

// Use routes
app.use("/instagram", instagramRoutes);
app.use("/facebook", facebookRoutes.router);

// Preverjanje če dela
app.get("/", (req, res) => {
  res.send("Strežnik je aktiven.");
});

app.listen(5000, () => {
  console.log("Strežnik teče na portu 5000");
});

//Server zaenkrat za instagram api in facebook api
