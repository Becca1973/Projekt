import React, { useState } from "react";
import "./AIGenerator.css";

const AIGenerator = ({ onContentGenerated }) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generatedText, setGeneratedText] = useState("");
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

  const generateText = async () => {
    setLoading(true);
    setError("");

    try {
      // Generiraj vsebino brez naslova
      const contentResponse = await fetch(
        "http://localhost:5001/api/ai/generate-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `Write a very short content for a social media post about "${prompt}".`,
          }),
        }
      );

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        throw new Error(errorData.message || "Error generating content");
      }

      const contentData = await contentResponse.json();
      setGeneratedText(contentData.text.trim());
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseContent = () => {
    onContentGenerated({ imageUrl, text: generatedText });
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
        <h2>Generate your post with AI</h2>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter prompt for image or text"
        />
        <div className="button-group">
          <button onClick={generateText} disabled={loading}>
            {loading ? "Generating Content..." : "Generate Content"}
          </button>
          <button onClick={generateImage} disabled={loading}>
            {loading ? "Generating Image..." : "Generate Image"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        {imageUrl && (
          <div>
            <img src={imageUrl} alt="Generated" />
            <button
              className="generated"
              onClick={handleUseContent}
              disabled={loading}
            >
              Use Generated Image
            </button>
          </div>
        )}
        {generatedText && (
          <div>
            <p>{generatedText}</p>
            <button
              className="generated"
              onClick={handleUseContent}
              disabled={loading}
            >
              Use Generated Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;
