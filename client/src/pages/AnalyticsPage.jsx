import React, { useEffect, useState } from "react";
import axios from "axios";

function AnalyticsPage() {
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [facebookLoading, setFacebookLoading] = useState(true); // Dodano stanje za nalaganje
  const [instagramLoading, setInstagramLoading] = useState(true); // Dodano stanje za nalaganje

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/facebook/posts"
        );
        console.log("Facebook posts:", response.data); // Preverite strukturo podatkov
        setFacebookPosts(response.data.data || []); // Zaščita pred undefined
      } catch (error) {
        console.error("Error fetching Facebook posts", error);
        setFacebookError(error);
      } finally {
        setFacebookLoading(false); // Nalaganje končano
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/instagram/posts"
        );
        console.log("Instagram posts:", response.data);
        setInstagramPosts(response.data || []);
      } catch (error) {
        console.error("Error fetching Instagram posts", error);
        setInstagramError(error);
      } finally {
        setInstagramLoading(false); // Nalaganje končano
      }
    };

    fetchFacebookPosts();
    fetchInstagramPosts();
  }, []);

  return (
    <div>
      <h1>Facebook Posts</h1>
      <div>
        {facebookLoading ? (
          <p>Loading Facebook posts...</p> // Prikaz nalaganja
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
          <p>Loading Instagram posts...</p> // Prikaz nalaganja
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
    </div>
  );
}

export default AnalyticsPage;
