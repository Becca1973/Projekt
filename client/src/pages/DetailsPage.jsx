import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/Comments/CommentsSection";
import { FaFacebook, FaInstagram, FaReddit } from "react-icons/fa";
import { Loader } from "../components/Loader/Loader";

function DetailsPage() {
  const { platform, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    content: "",
    text: "",
    comments: [],
    like_count: 0,
    share_count: 0,
    media_url: "",
    timestamp: "",
    views: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = JSON.parse(localStorage.getItem("encodedData"));
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (!data) return;
      const response = await fetch(
        `http://localhost:5001/api/${platform}/delete/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Error deleting: " + response.statusText);
      }
      navigate("/analytics");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return;

        const response = await fetch(
          `http://localhost:5001/api/${platform}/${id}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        setData({
          content: result.content || result.title,
          text: result.text,
          media_url: result.media_url || result.thumbnail_url,
          timestamp: result.timestamp,
          comments: result.comments || result.num_comments,
          like_count: result.like_count || 0,
          share_count: result.share_count || result.num_crossposts || 0,
          views: result.views || result.view_count || 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform, id]);

  return (
    <div className="input-container container">
      {loading ? (
        <Loader />
      ) : (
        <>
          <h2>
            {platform === "facebook" && <FaFacebook className="elm" />}
            {platform === "instagram" && <FaInstagram className="elm" />}
            {platform === "reddit" && <FaReddit className="elm" />}
            {platform.charAt(0).toUpperCase() + platform.slice(1)} Detailed Post
          </h2>

          <div className="post-details-image-container">
            <div className="post-det">
              <div className="post-det-before">
                <div className="post-det-1">
                  {data.media_url && (
                    <img
                      style={{ width: "100%" }}
                      src={data.media_url}
                      alt="Post media"
                    />
                  )}
                </div>
                {error && <p className="error">{error}</p>}
                <div className="details-buttons">
                  {platform === "instagram" ? (
                    <p>Instagram does not support deleting posts with API.</p>
                  ) : platform === "reddit" ? (
                    <p>Reddit API does not support deleting posts.</p>
                  ) : (
                    <button
                      className="delete-button"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
              <div className="post-det-1">
                <div className="form-group">
                  <label htmlFor="content">Title</label>
                  <p>
                    {data.content.match(/^[^\n]+/)[0] ||
                      data.content ||
                      "No content"}
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="content">Description</label>
                  <p>
                    {data.text ||
                      data.content.split("\n").slice(1).join("\n") ||
                      "No content"}
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="likes">Likes</label>
                  <p>{data.like_count}</p>
                </div>
                <div className="form-group">
                  <label htmlFor="shares">Shares</label>
                  {platform === "instagram" ? (
                    <p>Instagram API does not support share count.</p>
                  ) : (
                    <p>{data.share_count}</p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="views">Views</label>
                  <p>{data.views}</p>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="comments">Comments</label>
            </div>
            {data.comments && (
              <CommentSection
                comments={data.comments}
                postId={id}
                platform={platform}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DetailsPage;
