import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader } from "../components/Loader/Loader";

const sorts = [
  {
    name: "Date",
    value: "date",
  },
  {
    name: "Likes",
    value: "likes",
  },
  {
    name: "Comments",
    value: "comments",
  },
  {
    name: "A-Z",
    value: "a-z",
  },
];

function AnalyticsPage() {
  const [sortType, setSortType] = useState("date");
  const [mergedPosts, setMergedPosts] = useState([]);
  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [redditError, setRedditError] = useState(null);
  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [redditLoading, setRedditLoading] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return;

        const response = await fetch(
          "http://localhost:5001/api/facebook/posts",
          {
            method: "POST",
            body: formData,
          }
        );

        const dataGet = await response.json();
        if (dataGet.error) {
          setTokenInvalid(true);
          return [];
        }
        return dataGet.data || [];
      } catch (error) {
        setFacebookError(error);
        return [];
      } finally {
        setFacebookLoading(false);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("encodedData"));
        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

        if (!data) return;

        const response = await fetch(
          "http://localhost:5001/api/instagram/posts",
          {
            method: "POST",
            body: formData,
          }
        );

        const dataGet = await response.json();
        if (dataGet.error) {
          setTokenInvalid(true);
          return [];
        }
        return dataGet || [];
      } catch (error) {
        setInstagramError(error);
        return [];
      } finally {
        setInstagramLoading(false);
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
        if (dataGet.error) {
          setTokenInvalid(true);
          return [];
        }
        return dataGet || [];
      } catch (error) {
        setRedditError(error);
        return [];
      } finally {
        setRedditLoading(false);
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
      //setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleSort = (sort) => {
    const sortedPosts = [...mergedPosts].sort((a, b) => {
      const getLikes = (post) =>
        post.facebook?.likes?.data.length ||
        post.instagram?.like_count ||
        post.reddit?.like_count ||
        0;

      const getComments = (post) =>
        post.facebook?.comments?.data.length ||
        post.instagram?.comments_count ||
        post.reddit?.comments_count ||
        0;

      const getDate = (post) => {
        const dateStr =
          post.facebook?.timestamp ||
          post.instagram?.timestamp ||
          post.reddit?.timestamp;

        // If dateStr exists, return a Date object, otherwise return a fallback date (e.g., 0)
        return dateStr ? new Date(dateStr) : new Date(0);
      };

      const getTitle = (post) =>
        post.facebook?.message ||
        post.instagram?.caption ||
        post.reddit?.title ||
        "";

      switch (sort) {
        case "likes":
          return getLikes(b) - getLikes(a);

        case "comments":
          return getComments(b) - getComments(a);

        case "date":
          return getDate(b) - getDate(a);

        case "a-z":
          return getTitle(a).localeCompare(getTitle(b));

        default:
          return 0;
      }
    });

    setMergedPosts(sortedPosts);
  };

  const handlePostClick = (post) => {
    localStorage.setItem("currentPost", JSON.stringify(post));
  };

  if (tokenInvalid) {
    return (
      <div className="container posts-content">
        <div className="error-message">
          <p>
            It looks like there is an issue with your tokens. Please{" "}
            <Link to="/profile">check your tokens</Link> and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container posts-content">
      <div className="select-fields">
        <div className="custom-select">
          <p>Sort By:</p>
          <select onChange={(e) => handleSort(e.target.value)} value={sortType}>
            {sorts.map(({ value, name }, index) => (
              <option key={index} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {facebookLoading || instagramLoading || redditLoading ? (
          <Loader />
        ) : facebookError || instagramError || redditError ? (
          <div className="container posts-content">
            <div className="error-message">
              <p>
                It looks like there is an issue with your tokens. Please{" "}
                <Link to="/my-profile">check your tokens</Link> and try again.
              </p>
            </div>
          </div>
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
