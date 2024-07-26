const express = require("express");
const router = express.Router();
const { ThreadsAPI } = require('threads-api');
require("dotenv").config();

router.post("/", async (req, res) => {
    const { title, content } = req.body;

    try {
        const threadsApi = new ThreadsAPI({
            username: process.env.INSTAGRAM_USERNAME,
            password: process.env.INSTAGRAM_PASSWORD,
        });

        const response = await threadsApi.publish({
            title,
            content,
            url: "https://bitmidi.com", // Adjust according to the parameters required
        });
        return res.status(200).json({ success: true, response });

    } catch (error) {
        return res.status(500).send("Error posting to Instagram Threads");
    }
});

module.exports = router;