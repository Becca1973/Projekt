const express = require("express");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage for files

const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
let ACCESS_TOKEN = ""; // To se bo nastavlo po pridobitvi access tokena

// Middleware za pridobivanje Access Tokena iz glavnega strežnika
router.use((req, res, next) => {
  ACCESS_TOKEN = req.accessToken;
  next();
});

// Funkcija za objavo na Instagram
const postToInstagram = async (imageUrl, caption) => {
  try {
    const createResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        image_url: imageUrl,
        caption: caption,
        access_token: ACCESS_TOKEN,
      }
    );
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
      {
        creation_id: createResponse.data.id,
        access_token: ACCESS_TOKEN,
      }
    );
    return publishResponse.data;
  } catch (error) {
    console.error("Napaka pri objavi na Instagram:", error);
    throw new Error("Napaka pri objavi na Instagram");
  }
};

// Konec točke za obdelavo objav na Instagram
router.post("/post", upload.single("image"), async (req, res) => {
  const { caption } = req.body;
  const image = req.file;

  if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    return res
      .status(500)
      .send("Manjkajoča zahtevana okoljska spremenljivka za Instagram.");
  }

  if (!caption || !image) {
    return res.status(400).send("Manjkajo polja: caption ali slika.");
  }

  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/${image.path}`;
    const result = await postToInstagram(imageUrl, caption);
    // Izbriši začasno sliko --> najprej se slika shrani na strežniku v mapo uploads, potem pa se zbriše zaradi varnosti in čiščenja prostora na disku
    fs.unlink(path.join(__dirname, "..", image.path), (err) => {
      if (err) console.error("Napaka pri brisanju začasne slike:", err);
    });
    res.json({ uspeh: true, result });
  } catch (error) {
    console.error("Napaka pri objavi na Instagram:", error);
    res.status(500).send("Napaka pri objavi na Instagram");
  }
});

module.exports = router;
