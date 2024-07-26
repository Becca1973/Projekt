import React, { useState } from "react";
import "./InputComponent.css";

const InputComponent = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const platforms = ["Facebook", "Twitter", "LinkedIn", "Instagram", "Reddit", "Threads"];

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTextChange = (e) => setText(e.target.value);
  const handleImageChange = (e) => setImage(e.target.files[0]);
  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title || !text || selectedPlatforms.length === 0) {
      setError("Please fill out all fields and select at least one platform.");
      return;
    }

    // Create a base FormData object
    const createFormData = () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);
      formData.append("image", image); // Assuming 'image' is a file object
      formData.append("selectedPlatforms", JSON.stringify(selectedPlatforms));
      return formData;
    };

    // Log FormData contents for debugging
    const logFormData = (formData) => {
      formData.forEach((value, key) => {
        console.log(key, value);
      });
    };

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const promises = [];

      if (selectedPlatforms.includes("Facebook")) {
        const fbFormData = createFormData();
        logFormData(fbFormData);
        promises.push(
          await fetch("http://localhost:5000/api/facebook", {
            method: "POST",
            body: fbFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to Facebook: " + response.statusText
              );
            }
          })
        );
      }

      if (selectedPlatforms.includes("Instagram")) {
        const instaFormData = createFormData();
        logFormData(instaFormData);
        promises.push(
          await fetch("http://localhost:5000/api/instagram", {
            method: "POST",
            body: instaFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to Instagram: " + response.statusText
              );
            }
          })
        );
      }

      if (selectedPlatforms.includes("LinkedIn")) {
        const linkedInFormData = createFormData();
        logFormData(linkedInFormData);
        promises.push(
          await fetch("http://localhost:5000/api/linkedin", {
            method: "POST",
            body: linkedInFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to LinkedIn: " + response.statusText
              );
            }
          })
        );
      }

      if (selectedPlatforms.includes("Twitter")) {
        const twitterFormData = createFormData();
        logFormData(twitterFormData);
        promises.push(
          await fetch("http://localhost:5000/api/twitter", {
            method: "POST",
            body: twitterFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to Twitter: " + response.statusText
              );
            }
          })
        );
      }

      if (selectedPlatforms.includes("Reddit")) {
        const twitterFormData = createFormData();
        logFormData(twitterFormData);
        promises.push(
          await fetch("http://localhost:5000/api/reddit", {
            method: "POST",
            body: twitterFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to Reddit: " + response.statusText
              );
            }
          })
        );
      }

      if (selectedPlatforms.includes("Threads")) {
        const twitterFormData = createFormData();
        logFormData(twitterFormData);
        promises.push(
          await fetch("http://localhost:5000/api/threads", {
            method: "POST",
            body: twitterFormData,
          }).then((response) => {
            if (!response.ok) {
              throw new Error(
                "Error posting to Threads: " + response.statusText
              );
            }
          })
        );
      }

      await Promise.all(promises);

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-container">
      <h2>Post Content to Social Media</h2>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          className="title-input"
          type="text"
          id="title"
          placeholder="Enter title..."
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="text">Content</label>
        <textarea
          className="text-input"
          id="text"
          placeholder="Enter text..."
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="image">Upload Image</label>
        <input
          className="image-input"
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <div className="form-group">
        <label>Choose Platforms</label>
        <div className="platforms">
          {platforms.map((platform) => (
            <div key={platform} className="checkbox-group">
              <input
                type="checkbox"
                id={platform}
                checked={selectedPlatforms.includes(platform)}
                onChange={() => handlePlatformChange(platform)}
              />
              <label htmlFor={platform}>{platform}</label>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <div className="success">Post successful!</div>}
      <button className="save-button" onClick={handleSave} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default InputComponent;