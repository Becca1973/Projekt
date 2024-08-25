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
  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);
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

    const mergePosts = (facebookPosts, instagramPosts) => {
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
      const facebook = await fetchFacebookPosts();
      const instagram = await fetchInstagramPosts();
      mergePosts(facebook, instagram);
    };

    fetchPosts();
  }, []);

  const handleSort = (sort) => {
    setSortType(sort);
    setMergedPosts((prevPosts) => {
      const sortedPosts = [...prevPosts];

      switch (sort) {
        case "likes":
          sortedPosts.sort((a, b) => {
            const aLikes =
              b.facebook?.likes?.data.length || b.instagram?.like_count || 0;
            const bLikes =
              a.facebook?.likes?.data.length || a.instagram?.like_count || 0;
            return aLikes - bLikes;
          });
          break;

        case "comments":
          sortedPosts.sort((a, b) => {
            const aComments =
              b.facebook?.comments?.data.length ||
              b.instagram?.comments_count ||
              0;
            const bComments =
              a.facebook?.comments?.data.length ||
              a.instagram?.comments_count ||
              0;
            return aComments - bComments;
          });
          break;

        case "date":
          sortedPosts.sort((a, b) => {
            const aDate = new Date(
              a.facebook?.timestamp || a.instagram?.timestamp || 0
            );
            const bDate = new Date(
              b.facebook?.timestamp || b.instagram?.timestamp || 0
            );
            return aDate - bDate;
          });
          break;

        case "a-z":
          sortedPosts.sort((a, b) => {
            const aCaption = a.facebook?.caption || a.instagram?.caption || "";
            const bCaption = b.facebook?.caption || b.instagram?.caption || "";
            return aCaption.localeCompare(bCaption);
          });
          break;

        default:
          break;
      }

      return sortedPosts;
    });
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
        {facebookLoading || instagramLoading ? (
          <Loader />
        ) : facebookError || instagramError ? (
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
                key={post.facebook ? post.facebook.id : post.instagram.id}
                onClick={() => handlePostClick(post)}
              >
                <div className="post-container">
                  <p className="post-caption">
                    {post.message?.match(/^[^\n]+/)[0] ||
                      post.caption?.match(/^[^\n]+/)[0] ||
                      "No caption"}
                  </p>

                  {post.facebook && post.facebook.full_picture ? (
                    <img
                      src={post.facebook.full_picture}
                      alt={post.facebook.message}
                      className="post-image"
                    />
                  ) : post.instagram && post.instagram.media_url ? (
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
                      post.facebook
                        ? post.facebook.created_time
                        : post.instagram.timestamp
                    ).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
