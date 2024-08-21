import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineMenu } from "react-icons/ai";
import { useAuth } from "../../auth/useAuth";

function Navigation() {
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("encodedData");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-container">
          <h3 style={{ textTransform: "uppercase" }}>BrandBoost</h3>
          <div className="menu-icon" onClick={handleShowNavbar}>
            <AiOutlineMenu />
          </div>

          <div className={`nav-elements  ${showNavbar && "active"}`}>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              {user && (
                <li>
                  <Link to="/post-content">Post Content</Link>
                </li>
              )}

              {user && (
                <li>
                  <Link to="/analytics">Analytics</Link>
                </li>
              )}

              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>

              {user ? (
                <ul>
                  <li>
                    <Link to="/my-profile">My Profile</Link>
                  </li>
                  <li>
                    <a href="#" onClick={handleLogout}>
                      Logout
                    </a>
                  </li>
                </ul>
              ) : (
                <ul>
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                  <li>
                    <Link to="/register">Register</Link>
                  </li>
                </ul>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;