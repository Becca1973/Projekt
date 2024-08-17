import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    name: "Merged",
    value: "merged",
  },
];

function AnalyticsPage() {
  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("");

  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [mergedPosts, setMergedPosts] = useState([]);

  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);

  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);

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
        setInstagramPosts(dataGet || []);
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
    switch (sort) {
      case "likes":
        setMergedPosts((prevPosts) =>
          [...prevPosts].sort(
            (a, b) =>
              (b.facebook?.likes?.data.length || b.instagram?.like_count || 0) -
              (a.facebook?.likes?.data.length || a.instagram?.like_count || 0)
          )
        );
        break;
      case "comments":
        setMergedPosts((prevPosts) =>
          [...prevPosts].sort(
            (a, b) =>
              (b.facebook?.comments?.data.length ||
                b.instagram?.comments_count ||
                0) -
              (a.facebook?.comments?.data.length ||
                a.instagram?.comments_count ||
                0)
          )
        );
        break;
      default:
        break;
    }
  };

  const getFilteredPosts = () => {
    switch (filter) {
      case "instagram":
        return instagramPosts;
      case "facebook":
        return facebookPosts;
      default:
        return mergedPosts;
    }
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
        <div className="custom-select">
          <select onChange={(e) => setFilter(e.target.value)}>
            <option value="">All platforms</option>
            {filters.map(({ value, name }, index) => (
              <option key={index} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {getFilteredPosts().length > 0 ? (
          <div className="posts-container">
            {getFilteredPosts().map((post) => (
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
                      alt={post.instagram.caption}
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
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
