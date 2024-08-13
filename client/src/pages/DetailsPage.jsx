import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/Comments/CommentsSection";

function DetailsPage() {
  const { platform, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ content: "", comments: [], like_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {

      const data = JSON.parse(localStorage.getItem('encodedData'));

      const formData = new FormData();
      formData.append("data", JSON.stringify(data))

      if (!data) return;

      const response = await fetch(`http://localhost:5001/api/${platform}/delete/${id}`, {
        method: "POST",
        body: formData
      });

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
      try {

        const data = JSON.parse(localStorage.getItem('encodedData'));

        const formData = new FormData();
        formData.append("data", JSON.stringify(data))

        if (!data) return;

        const response = await fetch(`http://localhost:5001/api/${platform}/${id}`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        setData({
          content: result.content,
          media_url: result.media_url,
          timestamp: result.timestamp,
          comments: result.comments,
          like_count: result.like_count,
          ...result
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
    <div className="input-container">
      <h2>Details Post</h2>
      {loading ? (
        <>Loading...</>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <p>{data.content || "No content"}</p>
          </div>
          <div className="form-group">
            <label htmlFor="likes">Likes</label>
            <p>{data.like_count}</p>
          </div>
          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            {data.comments && (
              <CommentSection comments={data.comments} postId={id} platform={platform}/>
            )}
          </div>
          <div className="form-group">
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
            { platform !== 'instagram' && 
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
            }
          </div>
        </>
      )}
    </div>
  );
}

export default DetailsPage;