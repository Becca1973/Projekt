const express = require("express");
const axios = require("axios");
const router = express.Router();

router.use(express.json());

router.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt for image:", prompt);

  try {
    const response = await axios.post(
      "https://api.aimlapi.com/images/generations",
      {
        model: "prompthero/openjourney",
        prompt: prompt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 148829ca85614d3293a3781299bad67a`,
        },
        responseType: "json",
      }
    );

    console.log("API response status:", response.status);

    const imageBase64 = response.data.output.choices[0].image_base64;
    if (!imageBase64) {
      throw new Error("Image base64 data not found in API response");
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }
    res
      .status(500)
      .json({ message: "Error generating image", error: error.message });
  }
});

router.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;
  console.log("Received prompt for text:", prompt);

  try {
    const response = await axios.post(
      "https://api.aimlapi.com/completions",
      {
        model: "Qwen/Qwen1.5-0.5B",
        prompt: prompt,
        max_tokens: 60, // Adjust as needed
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 148829ca85614d3293a3781299bad67a`,
        },
        responseType: "json",
      }
    );

    const generatedText = response.data.choices[0].text.trim();
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating text:", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }
    res
      .status(500)
      .json({ message: "Error generating text", error: error.message });
  }
});

module.exports = router;
