import React, { useEffect, useState } from "react";
import axios from "axios";

function AnalyticsPage() {
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [linkedinPosts, setLinkedinPosts] = useState([]);
  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [linkedinError, setLinkedinError] = useState(null);
  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [linkedinLoading, setLinkedinLoading] = useState(true);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/facebook/posts"
        );
        setFacebookPosts(response.data.data || []);
      } catch (error) {
        setFacebookError(error);
      } finally {
        setFacebookLoading(false);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/instagram/posts"
        );
        setInstagramPosts(response.data || []);
      } catch (error) {
        setInstagramError(error);
      } finally {
        setInstagramLoading(false);
      }
    };

    const fetchLinkedinPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/linkedin/posts"
        );
        setLinkedinPosts(response.data || []);
      } catch (error) {
        setLinkedinError(error);
      } finally {
        setLinkedinLoading(false);
      }
    };

    fetchFacebookPosts();
    fetchInstagramPosts();
    fetchLinkedinPosts();
  }, []);

  return (
    <div>
      <h1>Facebook Posts</h1>
      <div>
        {facebookLoading ? (
          <p>Loading Facebook posts...</p>
        ) : facebookError ? (
          <p>Error loading Facebook posts: {facebookError.message}</p>
        ) : facebookPosts.length > 0 ? (
          facebookPosts.map((post) => (
            <div key={post.id} className="post-container">
              <p className="post-caption">{post.message}</p>
              {post.full_picture && (
                <img
                  src={post.full_picture}
                  alt={post.message}
                  className="post-image"
                />
              )}
              <p className="post-date">
                Date: {new Date(post.created_time).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No Facebook posts available.</p>
        )}
      </div>

      <h1>Instagram Posts</h1>
      <div>
        {instagramLoading ? (
          <p>Loading Instagram posts...</p>
        ) : instagramError ? (
          <p>Error loading Instagram posts: {instagramError.message}</p>
        ) : instagramPosts.length > 0 ? (
          instagramPosts.map((post) => (
            <div key={post.id} className="post-container">
              <p className="post-caption">Caption: {post.caption}</p>
              {post.media_url && (
                <img
                  src={post.media_url}
                  alt={post.caption}
                  className="post-image"
                />
              )}
              <p className="post-date">
                Date: {new Date(post.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No Instagram posts available.</p>
        )}
      </div>

      <h1>LinkedIn Posts</h1>
      <div>
        {linkedinLoading ? (
          <p>Loading LinkedIn posts...</p>
        ) : linkedinError ? (
          <p>Error loading LinkedIn posts: {linkedinError.message}</p>
        ) : linkedinPosts.length > 0 ? (
          linkedinPosts.map((post) => (
            <div key={post.id} className="post-container">
              <p className="post-caption">
                {
                  post.specificContent["com.linkedin.ugc.ShareContent"]
                    .shareCommentary.text
                }
              </p>
              {post.specificContent["com.linkedin.ugc.ShareContent"]
                .shareMedia &&
                post.specificContent["com.linkedin.ugc.ShareContent"].shareMedia
                  .length > 0 && (
                  <img
                    src={
                      post.specificContent["com.linkedin.ugc.ShareContent"]
                        .shareMedia[0].media
                    }
                    alt={
                      post.specificContent["com.linkedin.ugc.ShareContent"]
                        .shareCommentary.text
                    }
                    className="post-image"
                  />
                )}
              <p className="post-date">
                Date: {new Date(post.created.time).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No LinkedIn posts available.</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
