const express = require("express");
const axios = require("axios");
const app = express();

const CLIENT_ID = "493202163034115";
const CLIENT_SECRET = "c4c2131fe44f8a135e642ebebb702ce2";
const REDIRECT_URI = "YOUR_REDIRECT_URI";

app.get("/auth", (req, res) => {
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement`;
  res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenResponse = await axios.post(
      "https://graph.facebook.com/v12.0/oauth/access_token",
      null,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code: code,
        },
      }
    );
    const { access_token } = tokenResponse.data;
    // Save the access token to your database or session
    res.json({ access_token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error exchanging code for access token");
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
