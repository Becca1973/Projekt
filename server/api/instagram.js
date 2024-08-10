const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs");

const router = express.Router();
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

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

  if (platforms.includes("Instagram")) {
    try {
      if (file) {
        let mediaUrl = "";
        let mediaType = "";

        // Determine media type and upload to Cloudinary
        if (file.mimetype.startsWith("video")) {
          mediaType = "video";
        } else if (file.mimetype.startsWith("image")) {
          mediaType = "image";
        } else {
          return res.status(400).send("Unsupported file type.");
        }

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: mediaType }, (error, result) => {
              if (error) return reject(error);
              resolve(result);
            })
            .end(file.buffer);
        });

        mediaUrl = result.secure_url;

        // Initialize Media Container
        const mediaData = {
          caption: `${title}\n\n${text}`,
          media_type: mediaType.toUpperCase(),
          [mediaType + "_url"]: mediaUrl,
          access_token: PAGE_ACCESS_TOKEN,
        };

        // For images and videos
        if (mediaType === "video") {
          mediaData.media_type = "REELS"; // Change this to "VIDEO" for non-Reels
          const initResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
            {
              ...mediaData,
              upload_type: "resumable",
            }
          );

          if (initResponse.data.error) {
            throw new Error(initResponse.data.error.message);
          }

          const containerId = initResponse.data.id;
          const uploadUri = `https://rupload.facebook.com/ig-api-upload/v20.0/${containerId}`;

          // Upload Video
          const fileSize = file.size;
          const uploadResponse = await axios.post(uploadUri, file.buffer, {
            headers: {
              Authorization: `OAuth ${PAGE_ACCESS_TOKEN}`,
              offset: 0,
              file_size: fileSize,
            },
          });

          if (uploadResponse.data.error) {
            throw new Error(uploadResponse.data.error.message);
          }

          // Publish Media
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
            {
              creation_id: containerId,
              access_token: PAGE_ACCESS_TOKEN,
            }
          );

          if (publishResponse.data.error) {
            throw new Error(publishResponse.data.error.message);
          }

          res
            .status(200)
            .json({ success: true, postId: publishResponse.data.id });
        } else if (mediaType === "image") {
          // For images, initialize media container without resumable upload
          const initResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
            {
              caption: `${title}\n\n${text}`,
              media_type: "IMAGE",
              image_url: mediaUrl,
              access_token: PAGE_ACCESS_TOKEN,
            }
          );

          if (initResponse.data.error) {
            throw new Error(initResponse.data.error.message);
          }

          const containerId = initResponse.data.id;

          // Publish Media
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish`,
            {
              creation_id: containerId,
              access_token: PAGE_ACCESS_TOKEN,
            }
          );

          if (publishResponse.data.error) {
            throw new Error(publishResponse.data.error.message);
          }

          res
            .status(200)
            .json({ success: true, postId: publishResponse.data.id });
        }
      } else {
        res.status(400).send("No file uploaded.");
      }
    } catch (error) {
      console.error("Error posting to Instagram:", error.message);
      res.status(500).send("Error posting to Instagram: " + error.message);
    }
  } else {
    res.status(200).send("No supported platform selected");
  }
});

router.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`,
      {
        params: {
          fields: "id,caption,media_type,media_url,thumbnail_url,timestamp",
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );

    const posts = response.data.data;

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error retrieving Instagram posts:", error.message);
    res.status(500).send("Error retrieving Instagram posts: " + error.message);
  }
});

module.exports = router;
