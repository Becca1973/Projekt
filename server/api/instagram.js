const express = require("express");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs");

const router = express.Router();
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

router.post("/", async (req, res) => {

  const { title, text, data } = req.body;
  const file = req.file;

  const parsedData = JSON.parse(data);

  const decodedString = Buffer.from(parsedData.socialTokens, 'base64').toString('utf-8');
  const parsedDecoded = JSON.parse(decodedString);
  const { instagramBusinessAccountID, facebookPageAccessToken } = parsedDecoded;

  if (!title || !text) {
    return res
      .status(400)
      .json({ error: "Please fill out all fields and select at least one platform." });
  }

  try {

    if (file == undefined) {
      return res.status(400).json({ error: "Upload file to post" });
    }

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
      access_token: facebookPageAccessToken,
    };

    // For images and videos
    if (mediaType === "video") {
      mediaData.media_type = "REELS"; // Change this to "VIDEO" for non-Reels
      const initResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${instagramBusinessAccountID}/media`,
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
          Authorization: `OAuth ${facebookPageAccessToken}`,
          offset: 0,
          file_size: fileSize,
        },
      });

      if (uploadResponse.data.error) {
        throw new Error(uploadResponse.data.error.message);
      }

      // Publish Media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${instagramBusinessAccountID}/media_publish`,
        {
          creation_id: containerId,
          access_token: facebookPageAccessToken,
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
        `https://graph.facebook.com/v20.0/${instagramBusinessAccountID}/media`,
        {
          caption: `${title}\n\n${text}`,
          media_type: "IMAGE",
          image_url: mediaUrl,
          access_token: facebookPageAccessToken,
        }
      );

      if (initResponse.data.error) {
        throw new Error(initResponse.data.error.message);
      }

      const containerId = initResponse.data.id;

      // Publish Media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v20.0/${instagramBusinessAccountID}/media_publish`,
        {
          creation_id: containerId,
          access_token: facebookPageAccessToken,
        }
      );

      if (publishResponse.data.error) {
        throw new Error(publishResponse.data.error.message);
      }

      return res
        .status(200)
        .json({ success: true, postId: publishResponse.data.id });
    }

  } catch (error) {
    console.error("Error posting to Instagram:", error);
    return res.status(400).json({ error: "Instagram tokens are not valid or an error occurred" });
  }

});

router.post("/posts", async (req, res) => {

  const parsedData = JSON.parse(req.body.data);

  const decodedString = Buffer.from(parsedData.socialTokens, 'base64').toString('utf-8');
  const parsedDecoded = JSON.parse(decodedString);
  const { instagramBusinessAccountID, facebookPageAccessToken } = parsedDecoded;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${instagramBusinessAccountID}/media`,
      {
        params: {
          fields: "id,caption,media_type,media_url,thumbnail_url,timestamp",
          access_token: facebookPageAccessToken,
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

router.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v20.0/${postId}`,
      {
        params: {
          fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,comments{id,text,username,timestamp}",
          access_token: PAGE_ACCESS_TOKEN,
        },
      }
    );

    const post = response.data;

    // Fetch comments if they weren't included in the initial response
    if (!post.comments && post.comments_count > 0) {
      const commentsResponse = await axios.get(
        `https://graph.facebook.com/v20.0/${postId}/comments`,
        {
          params: {
            fields: "id,text,username,timestamp",
            access_token: PAGE_ACCESS_TOKEN,
          },
        }
      );
      post.comments = commentsResponse.data.data;
    }

    const standardizedResponse = {
      id: post.id,
      content: post.caption,
      timestamp: post.timestamp,
      media_url: post.media_url || post.thumbnail_url,
      like_count: post.like_count,
      comments_count: post.comments_count,
      comments: post.comments && post.comments.data ? post.comments.data.map(comment => ({
        id: comment.id,
        text: comment.text,
        username: comment.username,
        timestamp: comment.timestamp
      })) : [],
    };

    res.status(200).json(standardizedResponse);
  } catch (error) {
    console.error(`Error fetching Instagram post with ID ${postId}:`, error.message);
    res.status(500).json({
      message: `Error fetching Instagram post with ID ${postId}`,
      error: error.message,
    });
  }
});

// IMPORTANT! Instagram API doesn't support direct deletion of posts 
router.delete("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    // Update the post to hide it from the feed
    const updateResponse = await axios.post(
      `https://graph.facebook.com/v20.0/${postId}`,
      null,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          comment_enabled: false, // Disable comments
          is_hidden: true,
        },
      }
    );

    if (updateResponse.data && updateResponse.data.success) {
      console.log(`Successfully hid Instagram post with ID ${postId} from profile`);
      return res.status(200).json({ 
        message: "Post hidden from profile successfully", 
        data: updateResponse.data 
      });
    } else {
      throw new Error("Failed to hide post from profile");
    }
  } catch (error) {
    console.error(`Error hiding Instagram post with ID ${postId}:`, error.response?.data || error.message);
    
    if (error.response?.data?.error?.code === 100) {
      return res.status(404).json({
        message: "Post not found or not accessible",
        error: "The post may not exist, or your app doesn't have permission to access it."
      });
    }

    return res.status(error.response?.status || 500).json({
      message: "Error hiding Instagram post from profile",
      error: error.response?.data?.error?.message || error.message
    });
  }
});

router.post("/comment/:id", async (req, res) => {
  const postId = req.params.id;
  const { message } = req.body;
  const data = JSON.parse(req.body.data);
  const decodedString = Buffer.from(data.socialTokens, 'base64').toString('utf-8');
  const parsedDecoded = JSON.parse(decodedString);
  console.log('parsedDecoded', parsedDecoded);
  const { facebookPageAccessToken, instagramBusinessAccountID } = parsedDecoded;

  console.log('Received data:', { postId, message, instagramBusinessAccountID });

  if (!message || !instagramBusinessAccountID || !facebookPageAccessToken) {
    return res.status(400).json({ error: "Comment message, Instagram Business Account ID, and Facebook Page Access Token are required" });
  }

  try {

    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${postId}/comments`,
      null,
      {
        params: {
          message: message,
          access_token: facebookPageAccessToken
        }
      }
    );

    res.status(200).json({
      message: "Comment posted successfully",
      data: response.data
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Error occurred",
      details: error.response?.data?.error || error.message
    });
  }
});

module.exports = router;
