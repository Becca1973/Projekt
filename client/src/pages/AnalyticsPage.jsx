import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AnalyticsPage() {
  const navigate = useNavigate();

  const [facebookPosts, setFacebookPosts] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [redditPosts, setRedditPosts] = useState([]);
  const [linkedinPosts, setLinkedinPosts] = useState([]);
  const [threadsPosts, setThreadsPosts] = useState([]);
  const [twitterPosts, setTwitterPosts] = useState([]);

  const [facebookError, setFacebookError] = useState(null);
  const [instagramError, setInstagramError] = useState(null);
  const [redditError, setRedditError] = useState(null);
  const [linkedinError, setLinkedinError] = useState(null);
  const [threadsError, setThreadsError] = useState(null);
  const [twitterError, setTwitterError] = useState(null);

  const [facebookLoading, setFacebookLoading] = useState(true);
  const [instagramLoading, setInstagramLoading] = useState(true);
  const [redditLoading, setRedditLoading] = useState(true);
  const [linkedinLoading, setLinkedinLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [twitterLoading, setTwitterLoading] = useState(true);

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/facebook/posts"
        );
        setFacebookPosts(response.data.data || []);
      } catch (error) {
        setFacebookError(error);
      } finally {
        setFacebookLoading(false);
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/instagram/posts"
        );
        setInstagramPosts(response.data || []);
      } catch (error) {
        setInstagramError(error);
      } finally {
        setInstagramLoading(false);
      }
    };

    // const fetchLinkedinPosts = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://localhost:5001/api/linkedin/posts"
    //     );
    //     setLinkedinPosts(response.data || []);
    //   } catch (error) {
    //     setLinkedinError(error);
    //   } finally {
    //     setLinkedinLoading(false);
    //   }
    // };

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

    // const fetchThreadsPosts = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://localhost:5001/api/threads/posts"
    //     );
    //     setThreadsPosts(response.data.posts || []);
    //   } catch (error) {
    //     setThreadsError(error);
    //   } finally {
    //     setThreadsLoading(false);
    //   }
    // };

    // const fetchTwitterPosts = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://localhost:5001/api/twitter/posts"
    //     );
    //     setTwitterPosts(response.data.tweets || []);
    //   } catch (error) {
    //     setTwitterError(error);
    //   } finally {
    //     setTwitterLoading(false);
    //   }
    // };

    fetchFacebookPosts();
    fetchInstagramPosts();
    fetchRedditPosts();
    // fetchLinkedinPosts();
    // fetchThreadsPosts();
    // fetchTwitterPosts();
  }, []);

  const handleRoute = (id) => {
    return navigate("/details/" + id);
  };

  return (
    <div className="posts-content">
      <h1>Facebook Posts</h1>
      <div className="posts-container">
        {facebookLoading ? (
          <p>Loading Facebook posts...</p>
        ) : facebookError ? (
          <p>Error loading Facebook posts: {facebookError.message}</p>
        ) : facebookPosts.length > 0 ? (
          <div className="posts">
            {facebookPosts.map((post) => (
              <div
                onClick={() => handleRoute(post.id)}
                key={post.id}
                className="post-container"
              >
                <p className="post-caption">{post.message}</p>
                {post.full_picture && (
                  <img
                    src={post.full_picture}
                    alt={post.message}
                    className="post-image"
                  />
                )}
                <p className="post-date">
                  Date: {new Date(post.created_time).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No Facebook posts available.</p>
        )}
      </div>

      <h1>Instagram Posts</h1>
      <div className="posts-container">
        {instagramLoading ? (
          <p>Loading Instagram posts...</p>
        ) : instagramError ? (
          <p>Error loading Instagram posts: {instagramError.message}</p>
        ) : instagramPosts.length > 0 ? (
          <div className="posts">
            {instagramPosts.map((post) => (
              <div
                onClick={() => handleRoute(post.id)}
                key={post.id}
                className="post-container"
              >
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
              </div>
            ))}
          </div>
        ) : (
          <p>No Instagram posts available.</p>
        )}
      </div>

      <h1>LinkedIn Posts</h1>
      <div className="posts-container">
        {linkedinLoading ? (
          <p>Loading LinkedIn posts...</p>
        ) : linkedinError ? (
          <p>Error loading LinkedIn posts: {linkedinError.message}</p>
        ) : linkedinPosts.length > 0 ? (
          <div className="posts">
            {linkedinPosts.map((post) => (
              <div
                onClick={() => handleRoute(post.id)}
                key={post.id}
                className="post-container"
              >
                <p className="post-caption">
                  {
                    post.specificContent["com.linkedin.ugc.ShareContent"]
                      .shareCommentary.text
                  }
                </p>
                {post.specificContent["com.linkedin.ugc.ShareContent"]
                  .shareMedia &&
                  post.specificContent["com.linkedin.ugc.ShareContent"]
                    .shareMedia.length > 0 && (
                    <img
                      src={
                        post.specificContent["com.linkedin.ugc.ShareContent"]
                          .shareMedia[0].media
                      }
                      alt={
                        post.specificContent["com.linkedin.ugc.ShareContent"]
                          .shareCommentary.text
                      }
                      className="post-image"
                    />
                  )}
                <p className="post-date">
                  Date: {new Date(post.created.time).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No LinkedIn posts available.</p>
        )}
      </div>

      <div>
        <h1>Reddit Posts</h1>
        {redditLoading ? (
          <p>Loading Reddit posts...</p>
        ) : redditError ? (
          <p>Error loading Reddit posts: {redditError.message}</p>
        ) : redditPosts.length > 0 ? (
          redditPosts.map((post) => (
            <Link to={`/analytics/reddit/${post.id}`} key={post.id}>
              <div className="post-container">
                <p className="post-title">Title: {post.title}</p>
                <p className="post-text">Text: {post.text}</p>

                {/* Check if the post has an image */}
                {console.log(post)}
                {post.imageUrl &&
                (post.imageUrl.endsWith(".jpg") ||
                  post.imageUrl.endsWith(".png") ||
                  post.imageUrl.endsWith(".gif")) ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="post-image"
                  />
                ) : post.thumbnail && post.thumbnail.startsWith("http") ? (
                  <img
                    src={post.thumbnail.replace(/&amp;/g, "&")}
                    alt={post.title}
                    className="post-image"
                  />
                ) : null}

                <p className="post-date">
                  Date: {new Date(post.created_utc * 1000).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>No Reddit posts available.</p>
        )}
      </div>

      {/* <h1>Instagram Threads Posts</h1>
      <div>
        {threadsLoading ? (
          <p>Loading Instagram Threads posts...</p>
        ) : threadsError ? (
          <p>Error loading Instagram Threads posts: {threadsError.message}</p>
        ) : threadsPosts.length > 0 ? (
          threadsPosts.map((post) => (
            <Link to={`/analytics/threads/${post.id}`} key={post.id}>
              <div className="post-container">
                <p className="post-caption">{post.text}</p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.text}
                    className="post-image"
                  />
                )}
                <p className="post-date">
                  Date: {new Date(post.timestamp).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>No Instagram Threads posts available.</p>
        )}
      </div> */}

      {/* <h1>Twitter Posts</h1>
      <div>
        {twitterLoading ? (
          <p>Loading Twitter posts...</p>
        ) : twitterError ? (
          <p>Error loading Twitter posts: {twitterError.message}</p>
        ) : twitterPosts.length > 0 ? (
          twitterPosts.map((post) => (
            <Link to={`/analytics/twitter/${post.id}`} key={post.id}>
              <div className="post-container">
                <p className="post-text">{post.text}</p>
                {post.attachments &&
                post.attachments.media_keys &&
                post.attachments.media_keys.length > 0 ? (
                  <img
                    src={post.attachments.media_keys[0].url}
                    alt={post.text}
                    className="post-image"
                  />
                ) : null}
                <p className="post-date">
                  Date: {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>No Twitter posts available.</p>
        )}
      </div> */}
    </div>
  );
}

export default AnalyticsPage;
