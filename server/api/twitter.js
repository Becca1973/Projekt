const express = require("express");
const { TwitterApi } = require("twitter-api-v2");

require("dotenv").config();

const router = express.Router();
// Twitter API credentials
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET_KEY = process.env.TWITTER_API_SECRET_KEY;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

const client = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET_KEY,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
  bearerToken: TWITTER_BEARER_TOKEN, 
}); 

const rwClient = client.readWrite;

router.post("/", async (req, res) => {
  const { text } = req.body;
  const image = req.file;

  try {
    let tweetOptions = { text };

    if (image) {
      const mediaId = await client.v1.uploadMedia(image.path);
      tweetOptions.media = { media_ids: [mediaId] };
    }

    const tweet = await rwClient.v2.tweet(tweetOptions);

    res.json({ success: true, tweet });
  } catch (error) {
    console.error("Error posting tweet:", error);
    res
      .status(403)
      .json({ error: "Request failed with code 403", details: error.message });
  }
});

module.exports = router;