import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PostDetailPage() {
  const { platform, id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/${platform}/posts/${id}`
        );
        setPost(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [platform, id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>
        {platform.charAt(0).toUpperCase() + platform.slice(1)} Post Details
      </h1>
      {post && (
        <div>
          <p>{post.message || post.caption || post.text}</p>
          {post.full_picture || post.media_url || post.media ? (
            <img
              src={post.full_picture || post.media_url || post.media}
              alt={post.message || post.caption || post.text}
              className="post-image"
            />
          ) : null}
          <p>
            Date:{" "}
            {new Date(
              post.created_time || post.timestamp || post.created.time
            ).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default PostDetailPage;
