const express = require("express");
const router = express.Router();
const { ThreadsAPI } = require("threads-api");
require("dotenv").config();

// In-memory storage for posts
let threadsPosts = [];

router.post("/", async (req, res) => {
  const { title, text } = req.body;
  const image = req.file;

  try {
    const threadsApi = new ThreadsAPI({
      username: process.env.INSTAGRAM_USERNAME,
      password: process.env.INSTAGRAM_PASSWORD,
    });

    let publishOptions = {
      text: `${title}\n\n${text}`, // Combine title and text
    };

    if (image) {
      const fs = require("fs");
      const imageBuffer = fs.readFileSync(image.path);

      publishOptions.attachment = {
        image: {
          type: image.mimetype,
          data: imageBuffer,
        },
      };
    }

    const response = await threadsApi.publish(publishOptions);

    // Store the post in memory
    const newPost = {
      id: response.id,
      text: `${title}\n\n${text}`,
      image_url: response.image_url || null, // Adjust based on response
      timestamp: new Date().toISOString(),
    };

    threadsPosts.push(newPost);

    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error posting to Instagram Threads:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/posts", (req, res) => {
  try {
    return res.status(200).json({ success: true, posts: threadsPosts });
  } catch (error) {
    console.error("Error retrieving Instagram Threads posts:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
