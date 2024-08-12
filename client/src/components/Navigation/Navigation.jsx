import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineMenu } from "react-icons/ai";


function Navigation() {
  const [showNavbar, setShowNavbar] = useState(false);


  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };


  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }


    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };


    window.addEventListener("storage", handleStorageChange);


    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("encodedData");
    localStorage.removeItem("socialTokens");
    setUser(null);
    navigate("/login");
  };


  return (
    <nav className="navbar">
      <div className="container">
        <div className="menu-icon" onClick={handleShowNavbar}>
          <AiOutlineMenu/>
        </div>
        <div className={`nav-elements  ${showNavbar && "active"}`}>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            { localStorage.getItem("user") && 
            <li>
              <Link to="/post-content">Post Content</Link>
            </li>
            }
            { localStorage.getItem("user") && 
            <li>
              <Link to="/analytics">Analytics</Link>
            </li>
            }
            <li>
              <Link to="/pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/my-profile">My Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}


export default Navigation;
