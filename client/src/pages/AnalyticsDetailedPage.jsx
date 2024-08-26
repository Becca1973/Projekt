import React, { useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { Link } from "react-router-dom";
import AnalyticsCharts from "../components/AnalyticsCharts/AnalyticsCharts";

function AnalyticsDetailedPage() {
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    const storedPost = JSON.parse(localStorage.getItem("currentPost"));
    console.log("Stored Post:", storedPost); // Check the whole object
    setCurrentPost(storedPost);
  }, []);

  if (!currentPost) {
    return <p>No post selected.</p>;
  }

  const facebookLikes = currentPost.facebook
    ? currentPost.facebook.likes?.summary?.total_count || 0
    : 0;

  const facebookComments = currentPost.facebook
    ? currentPost.facebook.comments?.summary?.total_count || 0
    : 0;

  const instagramLikes = currentPost.instagram
    ? currentPost.instagram.like_count || 0
    : 0;

  const instagramComments = currentPost.instagram
    ? currentPost.instagram.comments_count || 0
    : 0;

  const redditLikes = currentPost.reddit
    ? currentPost.reddit.like_count || 0
    : 0;

  const redditComments = currentPost.reddit
    ? currentPost.reddit.comments_count || 0
    : 0;

  const totalEngagement =
    facebookLikes +
    facebookComments +
    instagramLikes +
    instagramComments +
    redditLikes +
    redditComments;

  const postsArray = [
    currentPost.facebook ? "facebook" : null,
    currentPost.instagram ? "instagram" : null,
    currentPost.reddit ? "reddit" : null,
  ].filter(Boolean);

  const numberOfPosts = postsArray.length;

  // Ensure this calculation is done before using averageEngagement in JSX
  const averageEngagement =
    numberOfPosts > 0 ? totalEngagement / numberOfPosts : 0;

  return (
    <div className="container poster-detail">
      <h2>Post Details</h2>

      <div className={`posts-grid posts-${numberOfPosts}`}>
        {/* Facebook Post Details */}
        {currentPost.facebook && (
          <Link to={`/analytics/details/facebook/${currentPost.facebook.id}`}>
            <div className="post-container">
              <h3>Facebook Post</h3>
              <p className="post-caption">
                {currentPost.facebook.message?.match(/^[^\n]+/)[0] ||
                  "No caption"}
              </p>
              {currentPost.facebook.full_picture ? (
                <img
                  src={currentPost.facebook.full_picture}
                  alt={currentPost.facebook.message}
                  className="post-image"
                />
              ) : (
                <p className="post-no-image">No image</p>
              )}
              <p className="post-date">
                Date:{" "}
                {new Date(
                  currentPost.facebook.created_time
                ).toLocaleDateString()}
              </p>
              <div className="select-fields">
                <p>
                  <AiFillLike /> {facebookLikes}
                </p>
                <p>
                  <FaComment /> {facebookComments}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Instagram Post Details */}
        {currentPost.instagram && (
          <Link to={`/analytics/details/instagram/${currentPost.instagram.id}`}>
            <div className="post-container">
              <h3>Instagram Post</h3>
              <p className="post-caption">
                {currentPost.instagram.caption?.match(/^[^\n]+/)[0] ||
                  "No caption"}
              </p>
              {currentPost.instagram.thumbnail_url ||
              currentPost.instagram.media_url ? (
                <img
                  src={
                    currentPost.instagram.thumbnail_url ||
                    currentPost.instagram.media_url
                  }
                  alt={currentPost.instagram.caption}
                  className="post-image"
                />
              ) : (
                <p className="post-no-image">No image</p>
              )}
              <p className="post-date">
                Date:{" "}
                {new Date(currentPost.instagram.timestamp).toLocaleDateString()}
              </p>
              <div className="select-fields">
                <p>
                  <AiFillLike /> {instagramLikes}
                </p>
                <p>
                  <FaComment /> {instagramComments}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Reddit Post Details */}
        {currentPost.reddit && (
          <Link to={`/analytics/details/reddit/${currentPost.reddit.id}`}>
            <div className="post-container">
              <h3>Reddit Post</h3>
              <p className="post-caption">
                {currentPost.reddit.title || "No title"}
              </p>
              {currentPost.reddit.media_url ? (
                <img
                  src={currentPost.reddit.media_url}
                  alt={currentPost.reddit.title}
                  className="post-image"
                />
              ) : (
                <p className="post-no-image">No image</p>
              )}
              <p className="post-date">
                Date:{" "}
                {new Date(currentPost.reddit.timestamp).toLocaleDateString()}
              </p>
              <div className="select-fields">
                <p>
                  <AiFillLike /> {redditLikes}
                </p>
                <p>
                  <FaComment /> {redditComments}
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Total Engagement */}
      <div className="total-engagement">
        <div className="engagement-item">
          <p>{totalEngagement}</p>
          <h3>Total Engagement</h3>
        </div>
        <div className="engagement-item">
          <p>{averageEngagement.toFixed(2)}</p>
          <h3>Average Engagement per Post</h3>
        </div>
      </div>

      <AnalyticsCharts
        facebookPost={currentPost.facebook}
        instagramPost={currentPost.instagram}
        redditPost={currentPost.reddit}
      />
    </div>
  );
}

export default AnalyticsDetailedPage;
