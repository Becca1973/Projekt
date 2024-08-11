const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const { PassThrough } = require("stream");
const router = express.Router();

// Middleware to parse application/x-www-form-urlencoded data
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json()); // Ensure JSON parsing

// File upload handler with form-data
router.post("/", async (req, res) => {
  const { title, text, selectedPlatforms } = req.body;
  const file = req.files?.file; // Adjust based on how file is provided (e.g., req.files.file for form-data)

  const { facebookPageID, facebookPageAccessToken } = req.dynamicConfig;

  if (!facebookPageID || !facebookPageAccessToken) {
    return res.status(500).send("Configuration not available");
  }

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
    const message = `${title}\n\n${text}`;

    try {
      let postId = "";

      if (file) {
        const formData = new FormData();
        formData.append("access_token", facebookPageAccessToken);
        formData.append("message", message);

        const fileStream = new PassThrough();
        fileStream.end(file.data); // Assuming file.data is a Buffer

        formData.append("source", fileStream, {
          filename: file.name,
          contentType: file.mimetype,
        });

        const uploadResponse = file.mimetype.startsWith("image/")
          ? await axios.post(
              `https://graph.facebook.com/v20.0/${facebookPageID}/photos`,
              formData,
              { headers: formData.getHeaders() }
            )
          : file.mimetype.startsWith("video/")
          ? await axios.post(
              `https://graph.facebook.com/v20.0/${facebookPageID}/videos`,
              formData,
              { headers: formData.getHeaders() }
            )
          : null;

        if (uploadResponse) {
          postId = uploadResponse.data.id;
        } else {
          return res.status(400).send("Unsupported media type");
        }
      } else {
        const textResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${facebookPageID}/feed`,
          {
            message,
            access_token: facebookPageAccessToken,
          }
        );
        postId = textResponse.data.id;
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

// Fetch posts
router.get("/posts", async (req, res) => {
  const { facebookPageID, facebookPageAccessToken } = req.dynamicConfig;

  if (!facebookPageID || !facebookPageAccessToken) {
    return res.status(500).send("Configuration not available");
  }

  try {
    const response = await axios.get(
      `https://graph.facebook.com/${facebookPageID}/posts`,
      {
        params: {
          access_token: facebookPageAccessToken,
          fields: "id,message,created_time,full_picture",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Facebook posts:", error.message);
    res.status(500).send("Error fetching Facebook posts");
  }
});

// Fetch a specific post
router.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  const { facebookPageAccessToken } = req.dynamicConfig;

  try {
    const response = await axios.get(`https://graph.facebook.com/${postId}`, {
      params: {
        access_token: facebookPageAccessToken,
        fields: "id,message,created_time,full_picture",
      },
    });
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
