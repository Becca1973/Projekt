const express = require('express');
const axios = require('axios');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());

// Twitter API credentials
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET_KEY = process.env.TWITTER_API_SECRET_KEY;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

const oauth = OAuth({
  consumer: { key: TWITTER_API_KEY, secret: TWITTER_API_SECRET_KEY },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const twitterUploadImage = async (imagePath) => {
  const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
  const url = 'https://upload.twitter.com/1.1/media/upload.json';

  const request_data = {
    url,
    method: 'POST',
    data: { media_data: imageData },
  };

  const headers = oauth.toHeader(oauth.authorize(request_data, {
    key: TWITTER_ACCESS_TOKEN,
    secret: TWITTER_ACCESS_TOKEN_SECRET,
  }));

  const response = await axios.post(url, request_data.data, {
    headers: {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.media_id_string;
};

app.post('/post', (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error parsing the form data' });
    }

    const text = fields.text;
    const image = files.image;

    try {
      let media_id = null;

      if (image) {
        media_id = await twitterUploadImage(image.path);
        fs.unlinkSync(image.path); // Remove the file after uploading
      }

      const url = 'https://api.twitter.com/1.1/statuses/update.json';
      const request_data = {
        url,
        method: 'POST',
        data: { status: text, media_ids: media_id },
      };

      const headers = oauth.toHeader(oauth.authorize(request_data, {
        key: TWITTER_ACCESS_TOKEN,
        secret: TWITTER_ACCESS_TOKEN_SECRET,
      }));

      const response = await axios.post(url, request_data.data, {
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      res.json(response.data);
    } catch (error) {
      console.error('Error posting tweet:', error);
      res.status(500).json({ error: 'Error posting tweet' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${3000}`);
});
