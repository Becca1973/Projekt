import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { encode as base64Encode } from "base-64";
import ScheduleForm from "../ScheduleForm/ScheduleForm";
import { Loader } from "../../components/Loader/Loader"; // Import the Loader component

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
    redditUsername: "",
    redditPassword: "",
    redditId: "",
    redditSecret: "",
  });

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
  });

  useEffect(() => {
    const fetchTokens = async () => {
      if (user) {
        setLoading(true);

        try {
          const userDoc = doc(db, "users", user.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            const data = docSnap.data();
            // const data_ = { frequency: data.frequency, to: data.email };

            // await fetch("http://localhost:5001/api/set-schedule", {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify(data_),
            // });

            const encodedData = {
              socialTokens: base64Encode(
                JSON.stringify(data.socialTokens || {})
              ),
              profileData: base64Encode(
                JSON.stringify({
                  username: data.username || "",
                  email: data.email || "",
                })
              ),
            };

            setSocialTokens(data.socialTokens || {});
            setProfileData({
              username: data.username || "",
              email: data.email || "",
            });

            localStorage.setItem("encodedData", JSON.stringify(encodedData));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
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
      try {
        const userDoc = doc(db, "users", user.uid);
        await setDoc(
          userDoc,
          { socialTokens, ...profileData },
          { merge: true }
        );

        window.location.reload();
      } catch (error) {
        console.error("Error saving tokens:", error);
      }
    } else {
      console.error("User is not logged in.");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const setSchedule = async (scheduleData) => {
    if (!user) return;

    const userDoc = doc(db, "users", user.uid);
    await setDoc(userDoc, { socialTokens, ...scheduleData }, { merge: true });

    const docSnap = await getDoc(userDoc);

    if (!docSnap.exists()) return;

    const { frequency, email } = docSnap.data();
    const data = { frequency, to: email };

    try {
      const response = await fetch("http://localhost:5001/api/set-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error setting schedule:", error);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Profile Page</h2>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className="profile-details">
            <label>
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
          <div className="notifications">
            <h3>Notifications</h3>
            <ScheduleForm onSubmit={setSchedule} />
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
                <label htmlFor="redditClientId">Reddit Client ID</label>
                <input
                  type="text"
                  id="redditClientId"
                  name="redditClientId"
                  value={socialTokens.redditClientId}
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
              <div className="form-group">
                <label htmlFor="redditRefreshToken">Reddit Refresh Token</label>
                <input
                  type="text"
                  id="redditRefreshToken"
                  name="redditRefreshToken"
                  value={socialTokens.redditRefreshToken}
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
