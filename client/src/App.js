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
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import DetailsPage from "./pages/DetailsPage";
import { AuthProvider } from "./auth/useAuth";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import AnalyticsDetailedPage from "./pages/AnalyticsDetailedPage";

function App() {
  return (
    <UserProvider>
      <div className="App">
        <Router>
          <AuthProvider>
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/post-content"
                element={
                  <ProtectedRoute>
                    <FeaturesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/details/:platform/:id"
                element={
                  <ProtectedRoute>
                    <DetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics/details"
                element={
                  <ProtectedRoute>
                    <AnalyticsDetailedPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </AuthProvider>
          <Footer />
        </Router>
      </div>
    </UserProvider>
  );
}

export default App;
