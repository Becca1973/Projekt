const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const router = express.Router();
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

router.post("/", async (req, res) => {
  const { title, text, platforms } = req.body;
  const selectedPlatforms = JSON.parse(platforms);

  if (!title || !text || selectedPlatforms.length === 0) {
    return res
      .status(400)
      .send("Please fill out all fields and select at least one platform.");
  }

  if (selectedPlatforms.includes("Facebook")) {
    try {
      let imageUrl = "";
      if (req.file) {
        const formData = new FormData();
        formData.append("access_token", PAGE_ACCESS_TOKEN);
        formData.append("source", fs.createReadStream(req.file.path));
        const uploadResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${PAGE_ID}/photos`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imageUrl = uploadResponse.data.url;
      }

      // Pripravite podatke za objavo
      let postData = {
        access_token: PAGE_ACCESS_TOKEN,
        message: `${title}\n\n${text}`,
      };

      // Če je bila naložena slika, jo priložite k sporočilu
      if (imageUrl) {
        postData = {
          ...postData,
          attached_media: [{ media: { image_url: imageUrl } }],
        };
      }

      // Objavite na Facebook stran
      const postResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${PAGE_ID}/feed`,
        postData
      );

      res.status(200).json({ success: true, postId: postResponse.data.id });
    } catch (error) {
      console.error("Error posting to Facebook:", error.message);
      res.status(500).send("Error posting to Facebook");
    }
  } else {
    res.status(200).send("No supported platform selected");
  }
});

module.exports = router;
