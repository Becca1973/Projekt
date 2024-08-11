import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/Comments/CommentsSection";


function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ title: "", content: "", comments: [], likes: 0 });


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const handleDelete = async () => {
    setLoading(true);
    setError(null);


    await fetch(`http://localhost:5001/api/facebook/${id}`, {
      method: "DELETE",
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Error deleting: " + response.statusText);
      }


      return navigate("/analytics");
    });
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/facebook/${id}`,
          {
            method: "GET",
          }
        );


        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }


        const result = await response.json();
        setData({ ...data, ...result, content: result.message });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);


  return (
    <div className="input-container">
      <h2>Details Post</h2>
      {loading ? (
        <>Loading...</>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <p>{data.title ? data.title : "No title"}</p>
          </div>
          <div className="form-group">
            <label htmlFor="text">Content*</label>
            <p>{data.content ? data.content : "No content"}</p>
          </div>
          <div className="form-group">
            <label htmlFor="text">Likes*</label>
            <p>{data.likes ? data.likes.data.length : "0"}</p>
          </div>
          <div className="form-group">
            <label htmlFor="text">Comments*</label>
            {data.comments.data && (
              <CommentSection comments={data.comments.data} postId={id} />
            )}

          </div>
          <div className="form-group">
            <img
              style={{ width: "100%" }}
              src={data.full_picture}
              alt={data.full_picture}
            />
          </div>


          {error && <p className="error">{error}</p>}
          <div className="details-buttons">
            <button
              className="delete-button"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}


export default DetailsPage;