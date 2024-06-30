import React, { useState } from "react";
import "./InputComponent.css";

const InputComponent = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const platforms = [
    "Facebook",
    "Twitter",
    "LinkedIn",
    "Instagram",
    "Reddit",
    "TikTok",
  ];

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  const handleSave = () => {
    const data = {
      title: title,
      text: text,
      image: image,
      platforms: selectedPlatforms,
    };
    console.log(data);
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
      <button className="save-button" onClick={handleSave}>
        Post
      </button>
    </div>
  );
};

export default InputComponent;
