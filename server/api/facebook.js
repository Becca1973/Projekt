const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const router = express.Router();
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

router.post("/", async (req, res) => {
  const { title, text, data } = req.body;
  const file = req.file;
  const parsedData = JSON.parse(data);

  const decodedString = Buffer.from(parsedData.socialTokens, 'base64').toString('utf-8');
  const parsedDecoded = JSON.parse(decodedString);
  const {facebookPageID, facebookPageAccessToken} = parsedDecoded;

  // Parse profileData if needed
  // const { username, email } = typeof profileData === 'string' ? JSON.parse(profileData) : profileData;

  if (!title || !text) {
    return res
      .status(400)
      .json({ error: "Please fill out all fields and select at least one platform." });
  }

  if (file == undefined) {
    return res.status(400).json({ error: "Upload file to post" });
  }

  try {
    let postId = "";

    const formData = new FormData();
    formData.append("access_token", facebookPageAccessToken);
    const message = `${title}\n\n${text}`;

    if (file.mimetype.startsWith("image/")) {
      formData.append("source", file.buffer, {
        filename: file.originalname,
      });
      formData.append("caption", message);

      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${facebookPageID}/photos`,
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
        `https://graph.facebook.com/v20.0/${facebookPageID}/videos`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      if (!uploadResponse.data) {
        return res.status(400).send("Cannot post");
      }

      postId = uploadResponse.data.id;
    }

    return res.status(200).json({ success: true, postId });
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return res.status(400).json({ error: "Facebook tokens are not valid or an error occurred" });
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

router.post("/comment/:id", async (req, res) => {
  const { message } = req.body;
  const postId = req.params.id;

  if (!postId || !message) {
    return res.status(400).json({ error: "Post ID and message are required" });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${postId}/comments`,
      {
        message: message,
        access_token: PAGE_ACCESS_TOKEN,
      }
    );

    res.status(200).json({
      success: true,
      message: "Comment posted successfully",
      commentId: response.data.id,
    });
  } catch (error) {
    console.error(
      "Error posting Facebook comment:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      error: "Failed to post comment",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const response = await axios.get(`https://graph.facebook.com/${postId}`, {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
        fields: "id,message,created_time,full_picture,likes.summary(true),comments{id,message,created_time,from}",
      },
    });

    const standardizedResponse = {
      id: response.data.id,
      content: response.data.message,
      timestamp: response.data.created_time,
      media_url: response.data.full_picture,
      like_count: response.data.likes.summary.total_count,
      comments_count: response.data.comments ? response.data.comments.data.length : 0,
      comments: response.data.comments ? response.data.comments.data.map(comment => ({
        id: comment.id,
        text: comment.message,
        username: comment.from.name,
        timestamp: comment.created_time
      })) : [],
    };

    res.status(200).json(standardizedResponse);
  } catch (error) {
    console.error("Error fetching Facebook post:", error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      message: "Error fetching Facebook post",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
