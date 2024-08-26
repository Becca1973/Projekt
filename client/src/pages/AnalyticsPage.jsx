import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const sorts = [
  { name: "Likes", value: "likes" },
  { name: "Comments", value: "comments" },
  { name: "Date", value: "date" },
  { name: "A-Z", value: "a-z" },
];

function AnalyticsPage() {
  const [filter, setFilter] = useState("");
  const [mergedPosts, setMergedPosts] = useState([]);

  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [redditError, setRedditError] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return [];

        const response = await fetch(
          "http://localhost:5001/api/facebook/posts",
          {
            method: "POST",
            body: formData,
          }
        );

        const dataGet = await response.json();
        return dataGet.data || [];
      } catch (error) {
        setFacebookError(error);
        return [];
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return [];

        const response = await fetch(
          "http://localhost:5001/api/instagram/posts",
          {
            method: "POST",
            body: formData,
          }
        );

        const dataGet = await response.json();
        return dataGet || [];
      } catch (error) {
        setInstagramError(error);
        return [];
      }
    };

    const fetchRedditPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return [];

        const response = await fetch("http://localhost:5001/api/reddit/posts", {
          method: "POST",
          body: formData,
        });
        const dataGet = await response.json();
        return dataGet || [];
      } catch (error) {
        setRedditError(error);
        return [];
      }
    };

    const mergePosts = (facebookPosts, instagramPosts, redditPosts) => {
      const combinedPosts = [
        ...facebookPosts,
        ...instagramPosts,
        ...redditPosts,
      ];

      const merged = combinedPosts.reduce((acc, post) => {
        const contentIdentifier =
          post.message?.match(/^[^\n.?!]+[.!?]*/)?.[0]?.trim() ||
          post.caption?.match(/^[^\n.?!]+[.!?]*/)?.[0]?.trim() ||
          post.title;

        let existingPost = acc.find(
          (p) =>
            p.message?.match(/^[^\n.?!]+[.!?]*/)?.[0]?.trim() ===
              contentIdentifier ||
            p.caption?.match(/^[^\n.?!]+[.!?]*/)?.[0]?.trim() ===
              contentIdentifier ||
            p.title === contentIdentifier
        );

        if (existingPost) {
          if (post.message && !existingPost.facebook) {
            existingPost.facebook = { ...post };
          } else if (post.caption && !existingPost.instagram) {
            existingPost.instagram = { ...post };
          } else if (post.title && !existingPost.reddit) {
            existingPost.reddit = { ...post };
          }
        } else {
          const newPost = {};

          if (post.message) {
            newPost.facebook = { ...post };
            newPost.message = post.message
              .match(/^[^\n.?!]+[.!?]*/)?.[0]
              ?.trim();
          } else if (post.caption) {
            newPost.instagram = { ...post };
            newPost.caption = post.caption
              .match(/^[^\n.?!]+[.!?]*/)?.[0]
              ?.trim();
          } else if (post.title) {
            newPost.reddit = { ...post };
            newPost.title = post.title;
          }

          acc.push(newPost);
        }

        return acc;
      }, []);

      localStorage.setItem("mergedPosts", JSON.stringify(merged));
      setMergedPosts(merged);
    };

    const fetchPosts = async () => {
      const facebook = await fetchFacebookPosts();
      const instagram = await fetchInstagramPosts();
      const reddit = await fetchRedditPosts();
      mergePosts(facebook, instagram, reddit);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleSort = (sort) => {
    const sortedPosts = [...mergedPosts].sort((a, b) => {
      switch (sort) {
        case "likes":
          return (
            (b.facebook?.likes?.data.length || b.instagram?.like_count || 0) -
            (a.facebook?.likes?.data.length || a.instagram?.like_count || 0)
          );
        case "comments":
          return (
            (b.facebook?.comments?.data.length ||
              b.instagram?.comments_count ||
              b.reddit?.comments_count ||
              0) -
            (a.facebook?.comments?.data.length ||
              a.instagram?.comments_count ||
              a.reddit?.comments_count ||
              0)
          );
        case "date":
          return (
            new Date(
              b.facebook?.created_time ||
                b.instagram?.timestamp ||
                b.reddit?.timestamp
            ) -
            new Date(
              a.facebook?.created_time ||
                a.instagram?.timestamp ||
                a.reddit?.timestamp
            )
          );
        case "a-z":
          return (
            a.facebook?.message ||
            a.instagram?.caption ||
            a.reddit?.title ||
            ""
          ).localeCompare(
            b.facebook?.message || b.instagram?.caption || b.reddit?.title || ""
          );
        default:
          return 0;
      }
    });

    setMergedPosts(sortedPosts);
  };

  const handlePostClick = (post) => {
    localStorage.setItem("currentPost", JSON.stringify(post));
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
        {loading ? (
          <p>Loading...</p>
        ) : mergedPosts.length > 0 ? (
          <div className="posts-container">
            {mergedPosts.map((post) => (
              <Link
                to={`/analytics/details`}
                key={post.facebook?.id || post.instagram?.id || post.reddit?.id}
                onClick={() => handlePostClick(post)}
              >
                <div className="post-container">
                  <p className="post-caption">
                    {post.facebook?.message
                      ?.match(/^[^\n.?!]+[.!?]*/)?.[0]
                      ?.trim() ||
                      post.instagram?.caption
                        ?.match(/^[^\n.?!]+[.!?]*/)?.[0]
                        ?.trim() ||
                      post.reddit?.title ||
                      "No caption"}
                  </p>
                  {post.facebook && post.facebook.full_picture ? (
                    <img
                      src={post.facebook.full_picture}
                      alt={post.facebook.message}
                      className="post-image"
                    />
                  ) : post.instagram &&
                    post.instagram.media_type === "VIDEO" ? (
                    <img
                      src={post.instagram.thumbnail_url}
                      alt={post.instagram.caption}
                      className="post-image"
                    />
                  ) : post.instagram && post.instagram.media_url ? (
                    <img
                      src={post.instagram.media_url}
                      alt={post.instagram.caption}
                      className="post-image"
                    />
                  ) : post.reddit && post.reddit.media_url ? (
                    <img
                      src={post.reddit.media_url}
                      alt={post.reddit.title}
                      className="post-image"
                    />
                  ) : (
                    <p className="post-no-image">No image available</p>
                  )}
                  <p className="post-date">
                    Date:{" "}
                    {new Date(
                      post.facebook?.created_time ||
                        post.instagram?.timestamp ||
                        post.reddit?.timestamp
                    ).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
