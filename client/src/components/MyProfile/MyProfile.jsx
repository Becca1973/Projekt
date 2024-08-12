import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { encode as base64Encode } from 'base-64';

function MyProfile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);


  const [socialTokens, setSocialTokens] = useState({
    facebookPageID: "",
    facebookPageAccessToken: "",
    instagramBusinessAccountID: "",
    instagramUsername: "",
    instagramPassword: "",
    imgurClientID: "",
    twitterApiKey: "",
    twitterApiSecret: "",
    twitterAccessToken: "",
    twitterApiTokenSecret: "",
    twitterBearerToken: "",
    redditUsername: "",
    redditPassword: "",
    redditId: "",
    redditSecret: "",
    threadsPassword: "",
    threadsUsername: ""
  });

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    const fetchTokens = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Encode sensitive data
          const encodedData = {
            socialTokens: base64Encode(JSON.stringify(data.socialTokens || {})),
            profileData: base64Encode(JSON.stringify({
              username: data.username || "",
              email: data.email || "",
            }))
          };

          // Set state with encoded data
          setSocialTokens(data.socialTokens || {});
          setProfileData({
            username: data.username || "",
            email: data.email || "",
          });

          // Store encoded data in localStorage
          localStorage.setItem("encodedData", JSON.stringify(encodedData));
          setLoading(false);
        }
      }
    };

    fetchTokens();

  }, [user]);


  const handleTokenChange = (e) => {
    const { name, value } = e.target;
    setSocialTokens((prevTokens) => ({
      ...prevTokens,
      [name]: value,
    }));
  };

  const saveTokensToFirestore = async () => {
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      await setDoc(userDoc, { socialTokens, ...profileData }, { merge: true });
      alert("Tokens saved successfully!");
    } else {
      alert("User is not logged in.");
    }
  };

  /* FIX OVO */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile Page</h2>
      {loading ? (
        <>Loading...</>
      ) : (
        <div>
          <div className="profile-details">
            <label>
              {/* FIX OVO */}
              Username:
              <input
                type="text"
                name="username"
                disabled
                value={profileData.username}
                onChange={handleProfileChange}
              />
            </label>
            <label>
              {/* FIX OVO */}
              Email:
              <input
                disabled
                type="text"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />
            </label>
          </div>
          <div className="social-tokens">
            <h3>Social Media Tokens</h3>
            <div className="social-group">
              <div className="form-group">
                <label htmlFor="facebookAppID">Facebook App ID</label>
                <input
                  type="text"
                  id="facebookAppID"
                  name="facebookAppID"
                  value={socialTokens.facebookAppID}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="facebookAppSecret">Facebook App Secret</label>
                <input
                  type="text"
                  id="facebookAppSecret"
                  name="facebookAppSecret"
                  value={socialTokens.facebookAppSecret}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="facebookPageID">Facebook Page ID</label>
                <input
                  type="text"
                  id="facebookPageID"
                  name="facebookPageID"
                  value={socialTokens.facebookPageID}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="facebookPageAccessToken">
                  Facebook Page Access Token
                </label>
                <input
                  type="text"
                  id="facebookPageAccessToken"
                  name="facebookPageAccessToken"
                  value={socialTokens.facebookPageAccessToken}
                  onChange={handleTokenChange}
                />
              </div>
            </div>
            <div className="social-group">
              <div className="form-group">
                <label htmlFor="instagramBusinessAccountID">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  id="instagramBusinessAccountID"
                  name="instagramBusinessAccountID"
                  value={socialTokens.instagramBusinessAccountID}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="imgurClientID">Imgur Client ID</label>
                <input
                  type="text"
                  id="imgurClientID"
                  name="imgurClientID"
                  value={socialTokens.imgurClientID}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="instagramUsername">Instagram Username</label>
                <input
                  type="text"
                  id="instagramUsername"
                  name="instagramUsername"
                  value={socialTokens.instagramUsername}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="instagramPassword">Instagram Password</label>
                <input
                  type="text"
                  id="instagramPassword"
                  name="instagramPassword"
                  value={socialTokens.instagramPassword}
                  onChange={handleTokenChange}
                />
              </div>
            </div>
            <div className="social-group">
              <div className="form-group">
                <label htmlFor="twitterApiKey">Twitter Api Key</label>
                <input
                  type="text"
                  id="twitterApiKey"
                  name="twitterApiKey"
                  value={socialTokens.twitterApiKey}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="twitterApiSecret">Twitter Api Secret</label>
                <input
                  type="text"
                  id="twitterApiSecret"
                  name="twitterApiSecret"
                  value={socialTokens.twitterApiSecret}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="twitterAccessToken">Twitter Access Token</label>
                <input
                  type="text"
                  id="twitterAccessToken"
                  name="twitterAccessToken"
                  value={socialTokens.twitterAccessToken}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="twitterApiTokenSecret">Twitter Secret Token</label>
                <input
                  type="text"
                  id="twitterApiTokenSecret"
                  name="twitterApiTokenSecret"
                  value={socialTokens.twitterApiTokenSecret}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="twitterBearerToken">Twitter Bearer Token</label>
                <input
                  type="text"
                  id="twitterBearerToken"
                  name="twitterBearerToken"
                  value={socialTokens.twitterBearerToken}
                  onChange={handleTokenChange}
                />
              </div>
            </div>

            <div className="social-group">
              <div className="form-group">
                <label htmlFor="redditUsername">Reddit Username</label>
                <input
                  type="text"
                  id="redditUsername"
                  name="redditUsername"
                  value={socialTokens.redditUsername}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="redditPassword">Reddit Password</label>
                <input
                  type="text"
                  id="redditPassword"
                  name="redditPassword"
                  value={socialTokens.redditPassword}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="redditId">Reddit ID</label>
                <input
                  type="text"
                  id="redditId"
                  name="redditId"
                  value={socialTokens.redditId}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="redditSecret">Reddit Secret</label>
                <input
                  type="text"
                  id="redditSecret"
                  name="redditSecret"
                  value={socialTokens.redditSecret}
                  onChange={handleTokenChange}
                />
              </div>
         
            </div>
            <div className="social-group">


              <div className="form-group">
                <label htmlFor="threadsUsername">Threads Username</label>
                <input
                  type="text"
                  id="threadsUsername"
                  name="threadsUsername"
                  value={socialTokens.threadsUsername}
                  onChange={handleTokenChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="threadsPassword">Threads Password</label>
                <input
                  type="text"
                  id="threadsPassword"
                  name="threadsPassword"
                  value={socialTokens.threadsPassword}
                  onChange={handleTokenChange}
                />
              </div>
            </div>
            <button className="save-button" onClick={saveTokensToFirestore}>
              Save Tokens
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyProfile;
