const express = require("express");
const axios = require("axios");
const router = express.Router();

const CLIENT_ID = process.env.FACEBOOK_APP_ID;
const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;

let ACCESS_TOKEN = ""; // To bo nastavilo po pridobitvi access tokena

// Middleware za pridobivanje Access Tokena iz glavnega strežnika
router.use((req, res, next) => {
  ACCESS_TOKEN = req.accessToken;
  next();
});

// Funkcija za pridobitev Access Tokena za Facebook
const getFacebookAccessToken = async () => {
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
    return tokenResponse.data.access_token;
  } catch (error) {
    console.error("Napaka pri pridobivanju Facebook Access Tokena:", error);
    throw new Error("Napaka pri pridobivanju Facebook Access Tokena");
  }
};

// Funkcija za objavo na Facebook
const postToFacebook = async (message, link) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v20.0/me/feed`,
      {
        message: message,
        link: link,
        access_token: ACCESS_TOKEN,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Napaka pri objavi na Facebook:", error);
    throw new Error("Napaka pri objavi na Facebook");
  }
};

// Konec točke za obdelavo objav na Facebook
router.post("/post", async (req, res) => {
  const { message, link } = req.body;

  if (!message) {
    return res.status(400).send("Manjkajo polja: message.");
  }

  try {
    const result = await postToFacebook(message, link || "");
    res.json({ uspeh: true, result });
  } catch (error) {
    console.error("Napaka pri objavi na Facebook:", error);
    res.status(500).send("Napaka pri objavi na Facebook");
  }
});

module.exports = { router, getFacebookAccessToken };
