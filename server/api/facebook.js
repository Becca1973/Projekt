const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const router = express.Router();
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

// let localStorageTokens = JSON.parse(localStorage.getItem("socialTokens"));

// const router = express.Router();
// const PAGE_ID = localStorageTokens.facebookPageID;
// const PAGE_ACCESS_TOKEN = localStorageTokens.facebookPageAccessToken;

router.post("/", async (req, res) => {
  const { title, text, selectedPlatforms } = req.body;
  const file = req.file;

  let platforms;
  try {
    platforms =
      typeof selectedPlatforms === "string"
        ? JSON.parse(selectedPlatforms)
        : selectedPlatforms;
  } catch (error) {
    console.error("Error parsing selectedPlatforms:", error.message);
    return res.status(400).send("Invalid selectedPlatforms format");
  }

  if (!title || !text || !platforms || platforms.length === 0) {
    return res
      .status(400)
      .send("Please fill out all fields and select at least one platform.");
  }

  if (platforms.includes("Facebook")) {
    try {
      let postId = "";
      if (file) {
        const formData = new FormData();
        formData.append("access_token", PAGE_ACCESS_TOKEN);
        const message = `${title}\n\n${text}`;

        if (file.mimetype.startsWith("image/")) {
          formData.append("source", file.buffer, {
            filename: file.originalname,
          });
          formData.append("caption", message);

          const uploadResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${PAGE_ID}/photos`,
            formData,
            {
              headers: formData.getHeaders(),
            }
          );

          postId = uploadResponse.data.id;
        } else if (file.mimetype.startsWith("video/")) {
          formData.append("file", file.buffer, { filename: file.originalname });
          formData.append("description", message);

          const uploadResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${PAGE_ID}/videos`,
            formData,
            {
              headers: formData.getHeaders(),
            }
          );

          postId = uploadResponse.data.id;
        } else {
          return res.status(400).send("Unsupported media type");
        }
      }

      res.status(200).json({ success: true, postId });
    } catch (error) {
      console.error("Error posting to Facebook:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
      }
      res.status(500).send("Error posting to Facebook");
    }
  } else {
    res.status(200).send("No supported platform selected");
  }
});

router.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${PAGE_ID}/posts?access_token=${PAGE_ACCESS_TOKEN}&fields=id,message,created_time,full_picture`
    );
    console.log("Fetched Facebook posts:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Facebook posts:", error.message);
    res.status(500).send("Error fetching Facebook posts");
  }
});

router.get("/posts/:id", async (req, res) => {
  const postId = req.params.id; // Get the post ID from the URL
  console.log(postId);
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${postId}?access_token=${PAGE_ACCESS_TOKEN}&fields=id,message,created_time,full_picture`
    );
    console.log(`Fetched Facebook post with ID ${postId}:`, response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      `Error fetching Facebook post with ID ${postId}:`,
      error.message
    );
    res.status(500).send(`Error fetching Facebook post with ID ${postId}`);
  }
});

module.exports = router;
