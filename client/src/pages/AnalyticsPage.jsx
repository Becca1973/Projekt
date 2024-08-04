import React, { useEffect, useState } from "react";
import axios from "axios";

function AnalyticsPage() {
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const response = await axios.get("/api/facebook/posts");
        setFacebookPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching Facebook posts", error);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get("/api/instagram/posts");
        setInstagramPosts(response.data.data);
      } catch (error) {
        console.error("Error fetching Instagram posts", error);
      }
    };

    fetchFacebookPosts();
    fetchInstagramPosts();
  }, []);

  return (
    <div>
      <h1>Facebook Posts</h1>
      <div>
        {facebookPosts.map((post) => (
          <div key={post.id}>
            <p>{post.message}</p>
            {post.full_picture && (
              <img src={post.full_picture} alt={post.message} />
            )}
            <p>{new Date(post.created_time).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <h1>Instagram Posts</h1>
      <div>
        {instagramPosts.map((post) => (
          <div key={post.id}>
            {post.media_type === "IMAGE" && (
              <img src={post.media_url} alt={post.caption} />
            )}
            {post.media_type === "VIDEO" && (
              <video controls src={post.media_url} />
            )}
            <p>{post.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsPage;
