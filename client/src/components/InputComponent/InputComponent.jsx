import React, { useState } from "react";
import "./InputComponent.css";
import AIGenerator from "../AIGenerator/AIGenerator";

const InputComponent = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null); // State for preview
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [aiDialogVisible, setAiDialogVisible] = useState(false);

  const platforms = [
    "Facebook",
    "Twitter",
    "LinkedIn",
    "Instagram",
    "Reddit",
    "Threads",
  ];

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTextChange = (e) => setText(e.target.value);
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);
    if (file && file.type.startsWith("image/")) {
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    } else {
      setMediaPreview(null); // Clear preview if not an image
    }
  };
  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  const fileInputRef = React.useRef();

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title || !text || selectedPlatforms.length === 0) {
      setError("Please fill out all fields and select at least one platform.");
      return;
    }

    const createFormData = () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("text", text);

      console.log("Media object:", media); // Debugging
      console.log("Media is File:", media instanceof File); // Debugging
      console.log("Media is Blob:", media instanceof Blob); // Debugging

      if (media && media instanceof File) {
        formData.append("media", media); // Dodaj datoteko, če je pravilno nastavljena
      }

      formData.append("selectedPlatforms", JSON.stringify(selectedPlatforms));
      return formData;
    };

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
          await fetch("http://localhost:5001/api/facebook", {
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
          fetch("http://localhost:5001/api/instagram", {
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
          fetch("http://localhost:5001/api/linkedin", {
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
          fetch("http://localhost:5001/api/twitter", {
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
        const redditFormData = createFormData();
        logFormData(redditFormData);
        promises.push(
          fetch("http://localhost:5001/api/reddit", {
            method: "POST",
            body: redditFormData,
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
        const threadsFormData = createFormData();
        logFormData(threadsFormData);
        promises.push(
          fetch("http://localhost:5001/api/threads", {
            method: "POST",
            body: threadsFormData,
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

  const handleAIGenerateContent = (generatedContent) => {
    if (generatedContent.imageUrl) {
      fetch(generatedContent.imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], "generated-image.jpg", {
            type: blob.type,
          });

          // Dodaj datoteko v media stanje
          setMedia(file);
          const previewUrl = URL.createObjectURL(file);
          setMediaPreview(previewUrl);

          // Simuliraj nalaganje datoteke v polje
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          if (fileInputRef.current) {
            fileInputRef.current.files = dataTransfer.files;
          }
        })
        .catch((error) => console.error("Error fetching image:", error));
    }
    setAiDialogVisible(false);
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
        <label htmlFor="media">Upload Image or Video</label>
        <input
          ref={fileInputRef} // Dodano za referenco
          className="media-input"
          type="file"
          id="media"
          accept="image/*,video/*"
          onChange={handleMediaChange}
        />
        {mediaPreview && (
          <div className="media-preview">
            <img src={mediaPreview} alt="Preview" />
          </div>
        )}
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
      <button type="button" onClick={() => setAiDialogVisible(true)}>
        Generate image with AI
      </button>
      {error && <p className="error">{error}</p>}
      {success && <div className="success">Post successful!</div>}
      <button className="save-button" onClick={handleSave} disabled={loading}>
        {loading ? "Posting..." : "Post"}
      </button>
      {aiDialogVisible && (
        <div
          className="modal-overlay"
          onClick={() => setAiDialogVisible(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AIGenerator onContentGenerated={handleAIGenerateContent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InputComponent;
