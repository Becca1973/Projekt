const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();


const router = express.Router();
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;


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


router.delete("/:id", async (req, res) => {
  const postId = req.params.id;


  try {
    const response = await axios.delete(
      `https://graph.facebook.com/${postId}?access_token=${PAGE_ACCESS_TOKEN}`
    );


    return res
      .status(200)
      .json({ message: "Post deleted successfully", data: response.data });
  } catch (error) {
    console.error("Error deleting Facebook post:", error.message);
    return res.status(500).send("Error deleting Facebook post");
  }
});


router.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${PAGE_ID}/posts?access_token=${PAGE_ACCESS_TOKEN}&fields=id,message,created_time,full_picture`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Facebook posts:", error.message);
    res.status(500).send("Error fetching Facebook posts");
  }
});

router.post('/comment/:id', async (req, res) => {
  const message = req.body;
  const postId = req.params.id;

  if (!postId || !message) {
    return res.status(400).json({ error: 'Post ID and message are required' });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${postId}/comments`,
      {
        message: message,
        access_token: PAGE_ACCESS_TOKEN
      }
    );

    res.status(200).json({
      success: true,
      message: 'Comment posted successfully',
      commentId: response.data.id
    });
  } catch (error) {
    console.error('Error posting Facebook comment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to post comment',
      details: error.response?.data?.error?.message || error.message
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const response = await axios.get(
      `https://graph.facebook.com/${postId}`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: 'id,message,created_time,full_picture,likes.summary(true),comments{id,message,created_time,from}'
        }
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching Facebook post:', error.response ? error.response.data : error.message);

    if (error.response) {
      res.status(error.response.status).json({
        message: 'Error fetching Facebook post',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        message: 'Error fetching Facebook post',
        error: error.message
      });
    }
  }
});


module.exports = router;


