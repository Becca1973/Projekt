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

  const platforms = [
    "Facebook",
    "Twitter",
    "LinkedIn",
    "Instagram",
    "Reddit",
    "TikTok",
  ];

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

  const handleSave = async () => {
    if (!title || !text || selectedPlatforms.length === 0) {
      setError("Please fill out all fields and select at least one platform.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const data = new FormData();
    data.append("title", title);
    data.append("text", text);
    if (image) {
      data.append("image", image);
    }
    data.append("platforms", JSON.stringify(selectedPlatforms));

    try {
      const response = await fetch("http://localhost:5000/api/facebook", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setError("Error posting: " + response.statusText);
      }
    } catch (error) {
      setError("Error posting: " + error.message);
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
      {success && <p className="success">Post successful!</p>}
      <button className="save-button" onClick={handleSave} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
    </div>
  );
};

export default InputComponent;
