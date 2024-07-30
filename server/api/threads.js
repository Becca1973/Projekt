const express = require("express");
const router = express.Router();
const { ThreadsAPI } = require("threads-api");
require("dotenv").config();

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
      const fs = require('fs');
      const imageBuffer = fs.readFileSync(image.path);

      publishOptions.attachment = {
        image: {
          type: image.mimetype,
          data: imageBuffer,
        },
      };
    }

    const response = await threadsApi.publish(publishOptions);

    return res.status(200).json({ success: true, response });

  } catch (error) {
    console.error("Error posting to Instagram Threads:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;