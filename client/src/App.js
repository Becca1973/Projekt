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
import PostDetailPage from "./pages/PostDetailPage";
// import PricingPage from "./pages/PricingPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

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
            <Route path="/analytics" element={<AnalyticsPage />} />
            {/* <Route path="/pricing" element={<PricingPage />} /> */}
            <Route
              path="/analytics/:platform/:id"
              element={<PostDetailPage />}
            />
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
