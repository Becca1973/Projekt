const express = require("express");
const Reddit = require("reddit");
require("dotenv").config();

const router = express.Router();

const reddit = new Reddit({
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_ID,
  appSecret: process.env.REDDIT_SECRET,
  userAgent: "MyApp/1.0.0 (http://example.com)",
});

router.post("/", async (req, res) => {
  const { title } = req.body;

  try {
    const response = await reddit.post("/api/submit", {
      sr: "Susci",
      kind: "link",
      resubmit: true,
      title,
      url: "https://bitmidi.com",
    });

    return res.status(200).json({ success: true, response });
  } catch (error) {
    return res.status(500).send("Error posting to Reddit");
  }
});

module.exports = router;