const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const LINKEDIN_PERSON_ID = process.env.LINKEDIN_PERSON_ID;
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;

router.post("/", async (req, res) => {
  const { title, text, platforms } = req.body;
  const selectedPlatforms = JSON.parse(platforms);

  if (!title || !text || selectedPlatforms.length === 0) {
    return res
      .status(400)
      .send("Please fill out all fields and select at least one platform.");
  }

  if (selectedPlatforms.includes("LinkedIn")) {
    try {
      const postData = {
        author: `urn:li:person:${LINKEDIN_PERSON_ID}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: `${title}\n\n${text}`,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postData,
        {
          headers: {
            Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ success: true, postId: response.data.id });
    } catch (error) {
      console.error("Error posting to LinkedIn:", error.message);
      res.status(500).send("Error posting to LinkedIn");
    }
  } else {
    res.status(200).send("No supported platform selected");
  }
});

module.exports = router;
