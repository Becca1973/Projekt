import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const sorts = [
  { name: "Likes", value: "likes" },
  { name: "Comments", value: "comments" },
  { name: "Date", value: "date" },
  { name: "A-Z", value: "a-z" },
];

function AnalyticsPage() {
  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [mergedPosts, setMergedPosts] = useState([]);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        if (!data) return;

        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        const response = await fetch(
          "http://localhost:5001/api/facebook/posts",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await response.json();
        setFacebookPosts(result.data || []); // Ensure it's always an array
      } catch (error) {
        console.error("Error fetching Facebook posts:", error);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        if (!data) return;

        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        const response = await fetch(
          "http://localhost:5001/api/instagram/posts",
          {
            method: "POST",
            body: formData,
          }
        );
        const result = await response.json();
        setInstagramPosts(result || []); // Ensure it's always an array
      } catch (error) {
        console.error("Error fetching Instagram posts:", error);
      }
    };

    const mergePosts = (facebookPosts, instagramPosts) => {
      if (!Array.isArray(facebookPosts)) facebookPosts = [];
      if (!Array.isArray(instagramPosts)) instagramPosts = [];

      const combinedPosts = [...facebookPosts, ...instagramPosts];

      const merged = combinedPosts.reduce((acc, post) => {
        const messageOrCaption = post.message || post.caption;
        let existingPost = acc.find(
          (p) =>
            p.message === messageOrCaption || p.caption === messageOrCaption
        );

        if (existingPost) {
          if (post.message) {
            existingPost.facebook = { ...post };
          } else if (post.caption) {
            existingPost.instagram = { ...post };
          }
        } else {
          const newPost = post.message
            ? { facebook: { ...post }, message: post.message }
            : { instagram: { ...post }, caption: post.caption };
          acc.push(newPost);
        }

        return acc;
      }, []);

      localStorage.setItem("combinedPosts", JSON.stringify(combinedPosts));
      localStorage.setItem("mergedPosts", JSON.stringify(merged));
      setMergedPosts(merged);
    };

    const fetchPosts = async () => {
      await fetchFacebookPosts();
      await fetchInstagramPosts();
      mergePosts(facebookPosts, instagramPosts);
    };

    fetchPosts();
  }, [facebookPosts, instagramPosts]);

  const handleSort = (sort) => {
    setMergedPosts((prevPosts) => {
      const sortedPosts = [...prevPosts];
      switch (sort) {
        case "likes":
          return sortedPosts.sort(
            (a, b) =>
              (b.facebook?.likes?.data.length || b.instagram?.like_count || 0) -
              (a.facebook?.likes?.data.length || a.instagram?.like_count || 0)
          );
        case "comments":
          return sortedPosts.sort(
            (a, b) =>
              (b.facebook?.comments?.data.length ||
                b.instagram?.comments_count ||
                0) -
              (a.facebook?.comments?.data.length ||
                a.instagram?.comments_count ||
                0)
          );
        case "date":
          return sortedPosts.sort((a, b) => {
            const aTimestamp =
              a.facebook?.timestamp || a.instagram?.timestamp || 0;
            const bTimestamp =
              b.facebook?.timestamp || b.instagram?.timestamp || 0;
            return new Date(bTimestamp) - new Date(aTimestamp);
          });
        case "a-z":
          return sortedPosts.sort((a, b) => {
            const aCaption = a.facebook?.caption || a.instagram?.caption || "";
            const bCaption = b.facebook?.caption || b.instagram?.caption || "";
            return aCaption.localeCompare(bCaption);
          });
        default:
          return prevPosts;
      }
    });
  };

  return (
    <div className="container posts-content">
      <div className="select-fields">
        <div className="custom-select">
          <select onChange={(e) => handleSort(e.target.value)}>
            <option value="">Sort by</option>
            {sorts.map(({ value, name }, index) => (
              <option key={index} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {mergedPosts.length > 0 ? (
          <div className="posts-container">
            {mergedPosts.map((post) => (
              <Link
                to={`/analytics/details`}
                key={post.facebook ? post.facebook.id : post.instagram.id}
                onClick={() =>
                  localStorage.setItem("currentPost", JSON.stringify(post))
                }
              >
                <div className="post-container">
                  <p className="post-caption">
                    {post.message?.match(/^[^\n]+/)[0] ||
                      post.caption?.match(/^[^\n]+/)[0] ||
                      "No caption"}
                  </p>

                  {post.facebook?.full_picture ? (
                    <img
                      src={post.facebook.full_picture}
                      alt={post.facebook.message}
                      className="post-image"
                    />
                  ) : post.instagram?.media_url ? (
                    <img
                      src={post.instagram.media_url}
                      alt={post.instagram.caption || "Instagram post image"}
                      className="post-image"
                    />
                  ) : (
                    <p className="post-no-image">No image</p>
                  )}

                  <p className="post-date">
                    Date:{" "}
                    {new Date(
                      post.facebook?.created_time || post.instagram?.timestamp
                    ).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
