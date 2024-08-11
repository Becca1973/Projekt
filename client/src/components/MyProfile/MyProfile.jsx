import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";


function MyProfile() {
  const { user } = useUser();
  const [socialTokens, setSocialTokens] = useState({
    facebookAppID: "",
    facebookAppSecret: "",
    facebookPageID: "",
    facebookPageAccessToken: "",
    instagramBusinessAccountID: "",
    imgurClientID: "",
    instagramUsername: "",
    instagramPassword: "",
    // twitterUserToken: "",
    // twitterAppToken: "",
    // linkedinUserToken: "",
    // linkedinAppToken: "",
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
          setSocialTokens(data.socialTokens || {});
          setProfileData({
            username: data.username || "",
            email: data.email || "",
          });
          localStorage.setItem(
            "socialTokens",
            JSON.stringify(data.socialTokens || {})
          );
        }
      }
    };


    fetchTokens();
  }, [user]);


  useEffect(() => {
    localStorage.setItem("socialTokens", JSON.stringify(socialTokens));
  }, [socialTokens]);


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
            <label htmlFor="twitterUserToken">Twitter User Token</label>
            <input
              type="text"
              id="twitterUserToken"
              name="twitterUserToken"
              value={socialTokens.twitterUserToken}
              onChange={handleTokenChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="twitterAppToken">Twitter App Token</label>
            <input
              type="text"
              id="twitterAppToken"
              name="twitterAppToken"
              value={socialTokens.twitterAppToken}
              onChange={handleTokenChange}
            />
          </div>
        </div>
        <div className="social-group">


          <div className="form-group">
            <label htmlFor="linkedinUserToken">Linkedin User Token</label>
            <input
              type="text"
              id="linkedinUserToken"
              name="linkedinUserToken"
              value={socialTokens.linkedinUserToken}
              onChange={handleTokenChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="linkedinAppToken">Linkedin App Token</label>
            <input
              type="text"
              id="linkedinAppToken"
              name="linkedinAppToken"
              value={socialTokens.linkedinAppToken}
              onChange={handleTokenChange}
            />
          </div>
        </div>
        <button className="save-button" onClick={saveTokensToFirestore}>
          Save Tokens
        </button>
      </div>
    </div>
  );
}


export default MyProfile;
