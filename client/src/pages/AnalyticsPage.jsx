import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AiFillLike } from "react-icons/ai";
import { FaComment } from "react-icons/fa";


const sorts = [
  {
    name: 'Likes',
    value: 'likes'
  },
  {
    name: 'Comments',
    value: 'comments'
  }
]

const filters = [
  {
    name: 'Instagram',
    value: 'instagram'
  },
  {
    name: 'Facebook',
    value: 'facebook'
  },
  {
    name: 'Reddit',
    value: 'reddit'
  }
]


function AnalyticsPage() {
  const navigate = useNavigate();

  const [sort, setSort] = useState('');
  const [filter, setFilter] = useState('');

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

        const data = JSON.parse(localStorage.getItem('encodedData'));

        const formData = new FormData();
        formData.append("data", JSON.stringify(data))

        if (!data) return;

        const response = await fetch("http://localhost:5001/api/facebook/posts", {
          method: "POST",
          body: formData
        });

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

        const data = JSON.parse(localStorage.getItem('encodedData'));

        const formData = new FormData();
        formData.append("data", JSON.stringify(data))

        if (!data) return;

        const response = await fetch("http://localhost:5001/api/instagram/posts", {
          method: "POST",
          body: formData
        });

        const dataGet = await response.json();

        setInstagramPosts(dataGet || []);
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

    function reset() {
      setFacebookPosts(null);
      setInstagramPosts(null);
      setRedditPosts(null)
    }



    switch (filter) {
      case 'instagram':
        reset();
        fetchInstagramPosts();
        break;
      case 'facebook':
        reset();
        fetchFacebookPosts();
        break;
      case 'reddit':
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



    // fetchLinkedinPosts();
    // fetchThreadsPosts();
    // fetchTwitterPosts();
  }, [filter]);


  const handleSort = (sort) => {
    switch (sort) {
      case 'likes':
        if (facebookPosts) setFacebookPosts([...facebookPosts].sort((a, b) => (b.likes?.data.length || 0) - (a.likes?.data.length || 0)));
        if (instagramPosts) setInstagramPosts([...instagramPosts].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)));
        break;
      case 'comments':
        if (facebookPosts) setFacebookPosts([...facebookPosts].sort((a, b) => (b.comments?.data.length || 0) - (a.comments?.data.length || 0)));
        if (instagramPosts) setInstagramPosts([...instagramPosts].sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0)));
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
              return <option key={index} value={value}>{name}</option>
            })}
          </select>
        </div>
        <div class="custom-select">
          <select onChange={(e) => setFilter(e.target.value)}>
            <option value="0">All platforms</option>
            {filters.map(({ value, name }, index) => {
              return <option key={index} value={value}>{name}</option>
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
                          Date: {new Date(post.created_time).toLocaleDateString()}
                        </p>
                        <div className="select-fields">
                          <p><AiFillLike /> {post.likes.data.length}</p>
                          <p><FaComment /> {post.comments.data.length}</p>
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
                          <p><AiFillLike /> {post.like_count}</p>
                          <p><FaComment /> {post.comments_count}</p>
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

        {/* <h1>LinkedIn Posts</h1>
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
      </div> */}

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
                      ) : post.thumbnail && post.thumbnail.startsWith("http") ? (
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

                      {/* <p className="post-date">
         Date: {new Date(post.created_utc * 1000).toLocaleDateString()}
       </p> */}

                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p>No Reddit posts available.</p>
            )}

          </div>
        )}


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
    </div>
  );
}

export default AnalyticsPage;
