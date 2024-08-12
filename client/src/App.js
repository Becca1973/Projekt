import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import { UserProvider } from "./components/MyProfile/UserContext";
import Navigation from "./components/Navigation/Navigation";
import AnalyticsPage from "./pages/AnalyticsPage";
import ContactPage from "./pages/ContactPage";
import FeaturesPage from "./pages/FeaturesPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import DetailsPage from "./pages/DetailsPage";

import axios from "axios";

// MOGOCE JE TISTO BOLJSE PREBACIT V MYPROFILE PAGE AMPAK ZDAJ KO RAZVIJAMO NEK BO TUKAJ
const sendDataToServer = async () => {
  const socialTokens = JSON.parse(localStorage.getItem("socialTokens"));

  if (socialTokens) {
    try {
      await axios.post("http://localhost:5001/api/env", socialTokens);
      console.log("Data sent to server successfully.");
    } catch (error) {
      console.error("Error sending data to server:", error);
    }
  } else {
    console.error("No socialTokens found in localStorage.");
  }
};
sendDataToServer();


function App() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);


    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };


    window.addEventListener("storage", handleStorageChange);


    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <UserProvider>
      <div className="App">
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post-content" element={<FeaturesPage />} />
            <Route path="/analytics/:platform/:id" element={<DetailsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/my-profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
          <Footer />
        </Router>
      </div>
    </UserProvider>
  );
}


export default App;