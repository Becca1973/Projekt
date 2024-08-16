import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiFillLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";

const sorts = [
  {
    name: "Likes",
    value: "likes",
  },
  {
    name: "Comments",
    value: "comments",
  },
];

const filters = [
  {
    name: "Instagram",
    value: "instagram",
  },
  {
    name: "Facebook",
    value: "facebook",
  },
  {
    name: "Reddit",
    value: "reddit",
  },
];

function AnalyticsPage() {
  const navigate = useNavigate();

  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("");

  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);

  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [redditError, setRedditError] = useState(null);

  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [redditLoading, setRedditLoading] = useState(true);

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

        setFacebookPosts(dataGet.data || []);
      } catch (error) {
        setFacebookError(error);
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

        setInstagramPosts(dataGet || []);
      } catch (error) {
        setInstagramError(error);
      } finally {
        setInstagramLoading(false);
      }
    };

    const fetchRedditPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/reddit/posts"
        );
        setRedditPosts(response.data || []);
      } catch (error) {
        setRedditError(error);
      } finally {
        setRedditLoading(false);
      }
    };

    function reset() {
      setFacebookPosts(null);
      setInstagramPosts(null);
      setRedditPosts(null);
    }

    switch (filter) {
      case "instagram":
        reset();
        fetchInstagramPosts();
        break;
      case "facebook":
        reset();
        fetchFacebookPosts();
        break;
      case "reddit":
        reset();
        fetchRedditPosts();
        break;
      default:
        reset();
        fetchInstagramPosts();
        fetchFacebookPosts();
        fetchRedditPosts();
        break;
    }
  }, [filter]);

  const handleSort = (sort) => {
    switch (sort) {
      case "likes":
        if (facebookPosts)
          setFacebookPosts(
            [...facebookPosts].sort(
              (a, b) =>
                (b.likes?.data.length || 0) - (a.likes?.data.length || 0)
            )
          );
        if (instagramPosts)
          setInstagramPosts(
            [...instagramPosts].sort(
              (a, b) => (b.like_count || 0) - (a.like_count || 0)
            )
          );
        break;
      case "comments":
        if (facebookPosts)
          setFacebookPosts(
            [...facebookPosts].sort(
              (a, b) =>
                (b.comments?.data.length || 0) - (a.comments?.data.length || 0)
            )
          );
        if (instagramPosts)
          setInstagramPosts(
            [...instagramPosts].sort(
              (a, b) => (b.comments_count || 0) - (a.comments_count || 0)
            )
          );
        break;
      default:
        break;
    }
  };

  return (
    <div className="container posts-content">
      <div className="select-fields">
        <div class="custom-select">
          <select onChange={(e) => handleSort(e.target.value)}>
            <option value="0">Sort by</option>
            {sorts.map(({ value, name }, index) => {
              return (
                <option key={index} value={value}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
        <div class="custom-select">
          <select onChange={(e) => setFilter(e.target.value)}>
            <option value="0">All platforms</option>
            {filters.map(({ value, name }, index) => {
              return (
                <option key={index} value={value}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div>
        {facebookPosts && (
          <div>
            <h1>Facebook Posts</h1>

            <div className="posts-container">
              {facebookLoading ? (
                <p>Loading Facebook posts...</p>
              ) : facebookError ? (
                <p>Error loading Facebook posts: {facebookError.message}</p>
              ) : facebookPosts.length > 0 ? (
                <div className="posts">
                  {facebookPosts.map((post) => (
                    <Link to={`/analytics/facebook/${post.id}`} key={post.id}>
                      <div className="post-container">
                        <p className="post-caption">{post.message}</p>

                        {post.full_picture ? (
                          <img
                            src={post.full_picture}
                            alt={post.message}
                            className="post-image"
                          />
                        ) : (
                          <p className="post-no-image">No image</p>
                        )}
                        <p className="post-date">
                          Date:{" "}
                          {new Date(post.created_time).toLocaleDateString()}
                        </p>
                        <div className="select-fields">
                          <p>
                            <AiFillLike /> {post.likes.data.length}
                          </p>
                          <p>
                            <FaComment /> {post.comments.data.length}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No Facebook posts available.</p>
              )}
            </div>
          </div>
        )}

        {instagramPosts && (
          <div>
            <h1>Instagram Posts</h1>
            <div className="posts-container">
              {instagramLoading ? (
                <p>Loading Instagram posts...</p>
              ) : instagramError ? (
                <p>Error loading Instagram posts: {instagramError.message}</p>
              ) : instagramPosts.length > 0 ? (
                <div className="posts">
                  {instagramPosts.map((post) => (
                    <Link to={`/analytics/instagram/${post.id}`} key={post.id}>
                      <div className="post-container">
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
                        <div className="select-fields">
                          <p>
                            <AiFillLike /> {post.like_count}
                          </p>
                          <p>
                            <FaComment /> {post.comments_count}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No Instagram posts available.</p>
              )}
            </div>
          </div>
        )}

        {redditPosts && (
          <div className="posts-container">
            <h1>Reddit Posts</h1>
            {redditLoading ? (
              <p>Loading Reddit posts...</p>
            ) : redditError ? (
              <p>Error loading Reddit posts: {redditError.message}</p>
            ) : redditPosts.length > 0 ? (
              <div className="posts">
                {redditPosts.map((post) => (
                  <Link to={`/analytics/reddit/${post.id}`} key={post.id}>
                    <div className="post-container">
                      <p className="post-title">Title: {post.title}</p>
                      <p className="post-text">Text: {post.text}</p>
                      {post.imageUrl &&
                      (post.imageUrl.endsWith(".jpg") ||
                        post.imageUrl.endsWith(".png") ||
                        post.imageUrl.endsWith(".gif")) ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="post-image"
                        />
                      ) : post.thumbnail &&
                        post.thumbnail.startsWith("http") ? (
                        <>
                          {post.thumbnail && (
                            <>
                              <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="post-image"
                              />
                            </>
                          )}
                        </>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No Reddit posts available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
