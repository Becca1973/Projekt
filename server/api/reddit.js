const express = require("express");
const cloudinary = require("cloudinary").v2;
const snoowrap = require("snoowrap");
const moment = require("moment");
require("dotenv").config();

const router = express.Router();

// Static subreddit
const STATIC_SUBREDDIT = "BrandBoost1";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Parse and decode the social tokens from the request body
function parseSocialTokens(data) {
  const parsedData = typeof data === "string" ? JSON.parse(data) : data;
  const decodedString = Buffer.from(parsedData.socialTokens, "base64").toString(
    "utf-8"
  );
  return JSON.parse(decodedString);
}

// Route for uploading media (image or video) and posting to Reddit
router.post("/", async (req, res) => {
  const { title, text, data } = req.body;
  const media = req.file;

  if (!title || !text || !media) {
    return res
      .status(400)
      .json({ error: "Title, text, and media are required" });
  }

  try {
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    if (!redditClientId || !redditSecret || !redditRefreshToken) {
      throw new Error("Missing Reddit credentials");
    }

    // Initialize Snoowrap
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    // Determine media type and upload to Cloudinary
    let resourceType = "image";
    if (media.mimetype.startsWith("video")) {
      resourceType = "video";
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(media.buffer);
    });

    if (!result || !result.secure_url) {
      throw new Error("Media upload to Cloudinary failed");
    }

    const mediaUrl = result.secure_url;

    // Post to Reddit with title, text, and media URL
    const submission = await r.getSubreddit(STATIC_SUBREDDIT).submitLink({
      title: title,
      text: text,
      url: mediaUrl, // Use the media URL directly for media posts
      sendReplies: true, // Optional: Reddit will notify you about comments
    });

    res.status(200).json({ success: true, postId: submission.id });
  } catch (error) {
    console.error("Failed to post to Reddit:", error.message);
    res.status(500).json({ error: "Failed to post to Reddit" });
  }
});

// Route for deleting Reddit post
// Route for deleting Reddit post
router.post("/delete/:id", async (req, res) => {
  const postId = req.params.id; // ID objave, ki jo želimo izbrisati
  const { data } = req.body; // Pridobimo potrebne podatke iz zahteve

  try {
    // Dekodiranje Reddit API poverilnic
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    // Inicializacija Snoowrap knjižnice s poverilnicami
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    // Pridobimo objavo, ki jo želimo izbrisati, z ID-jem objave
    const submission = r.getSubmission(postId);
    await submission.delete(); // Izvedemo brisanje objave

    return res
      .status(200)
      .json({ message: "Reddit post deleted successfully" }); // Vrnemo uspešen odgovor
  } catch (error) {
    console.error("Error deleting Reddit post:", error); // Zabeležimo napako v konzoli
    return res.status(500).json({ error: "Error deleting Reddit post" }); // Vrnemo napako v primeru neuspeha
  }
});

// Route for fetching recent posts from the subreddit
router.post("/posts", async (req, res) => {
  const { data } = req.body;

  try {
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    // Initialize Snoowrap
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    const posts = await r.getSubreddit(STATIC_SUBREDDIT).getNew();

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      text: post.selftext || "",
      media_url: post.url || "",
      created_time: post.created_utc,
      timestamp: moment.unix(post.created_utc).format("YYYY-MM-DD HH:mm:ss"),
      like_count: post.ups,
      comments_count: post.num_comments,
    }));
    console.log(formattedPosts);
    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching Reddit posts:", error.message);
    res.status(500).send("Error fetching Reddit posts");
  }
});

// Route for fetching a specific Reddit post with comments
router.post("/:id", async (req, res) => {
  const postId = req.params.id;
  const { data } = req.body;

  try {
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    // Initialize Snoowrap
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    const post = await r.getSubmission(postId).fetch();
    console.log(post);

    // Fetch and format comments
    const commentListing = await post.expandReplies({ depth: 3, limit: 25 });
    const formattedComments = mapComments(commentListing.comments); // Check if comments is an array

    const standardizedResponse = {
      id: post.id,
      title: post.title,
      content: post.title,
      text: post.selftext || "",
      media_url: post.url || "",
      num_crossposts: post.num_crossposts,
      timestamp: moment.unix(post.created_utc).format("YYYY-MM-DD HH:mm:ss"),
      like_count: post.ups,
      comments_count: post.num_comments,
      comments: formattedComments,
      views: post.view_count,
    };

    res.status(200).json(standardizedResponse);
  } catch (error) {
    console.error("Error fetching Reddit post:", error.message);
    res.status(500).send("Error fetching Reddit post");
  }
});

// Helper function to map comments and replies
function mapComments(comments) {
  if (!Array.isArray(comments)) return [];

  return comments.map((comment) => ({
    id: comment.id,
    text: comment.body,
    username: comment.author.name,
    timestamp: moment.unix(comment.created_utc).format("YYYY-MM-DD HH:mm:ss"),
    replies: mapComments(comment.replies),
  }));
}

// Route for posting a comment on a Reddit post
router.post("/comment/:id", async (req, res) => {
  const postId = req.params.id;
  const { message, data } = req.body;

  try {
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    // Initialize Snoowrap
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    const post = await r.getSubmission(postId);
    const comment = await post.reply(message);

    res.status(200).json({
      success: true,
      message: "Comment posted successfully",
      commentId: comment.id,
    });
  } catch (error) {
    console.error("Error posting Reddit comment:", error.message);
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// Route for replying to a Reddit comment
router.post("/reply/:commentId", async (req, res) => {
  const commentId = req.params.commentId;
  const { message, data } = req.body;

  try {
    const { redditClientId, redditSecret, redditRefreshToken } =
      parseSocialTokens(data);

    // Initialize Snoowrap
    const r = new snoowrap({
      userAgent: "BrandBoost/0.1 by getbrandbooster",
      clientId: redditClientId,
      clientSecret: redditSecret,
      refreshToken: redditRefreshToken,
    });

    const comment = await r.getComment(commentId);
    const reply = await comment.reply(message);

    res.status(200).json({
      success: true,
      message: "Reply posted successfully",
      replyId: reply.id,
    });
  } catch (error) {
    console.error("Error posting Reddit reply:", error.message);
    res.status(500).json({ error: "Failed to post reply" });
  }
});

module.exports = router;
