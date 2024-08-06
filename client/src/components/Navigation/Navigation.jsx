import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navigation() {
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
    localStorage.removeItem("socialTokens");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/post-content">Post Content</Link>
        </li>
        <li>
          <Link to="/analytics">Analytics</Link>
        </li>
        {/* <li>
          <Link to="/pricing">Pricing</Link>
        </li> */}
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
      <ul>
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
    </nav>
  );
}

export default Navigation;
