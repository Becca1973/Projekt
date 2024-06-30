import React, { useState } from "react";

function InputComponent() {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("text", text);
    formData.append("image", image);

    try {
      console.log("Sending form data:", formData);
      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Tweet posted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert("Error posting tweet: " + errorData.error);
      }
    } catch (error) {
      console.error("Error posting tweet:", error);
      alert("Error posting tweet.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder="Enter your text"
        required
      />
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        required
      />
      <button type="submit">Post</button>
    </form>
  );
}

export default InputComponent;
