import React, { useState } from "react";
import "./AIGenerator.css";

const AIGenerator = ({ onContentGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:5001/api/ai/generate-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error generating image");
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseImage = () => {
    onContentGenerated({ imageUrl }); // Poslednja sprememba tukaj
  };

  return (
    <div className="modal-overlay" onClick={() => onContentGenerated({})}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={() => onContentGenerated({})}
        >
          &times;
        </button>
        <h2>Generate Image with AI</h2>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt for image"
        />
        <button onClick={generateImage} disabled={loading}>
          {loading ? "Generating..." : "Generate Image"}
        </button>
        {error && <p className="error">{error}</p>}
        {imageUrl && (
          <div>
            <img src={imageUrl} alt="Generated" />
            <button onClick={handleUseImage}>Use Generated Image</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;
