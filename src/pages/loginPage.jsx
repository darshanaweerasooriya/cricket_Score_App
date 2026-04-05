import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginPage.css";

// Images
import bg from "../assets/ppl.jpg";
import profile from "../assets/user1.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "1234";

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("auth", "true");
      localStorage.setItem("role", "admin");
      navigate("/teams");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      {/* Background Image */}
      <img src={bg} alt="background" className="bg-image" />

      {/* Overlay */}
      <div className="overlay"></div>

      {/* Login Card */}
      <div className="login-card">
        
        {/* Profile Image */}
        <div className="hero-image">
          <img src={profile} alt="Profile" />
        </div>

        <h2>Sign In</h2>
        <p className="subtitle">Welcome back</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;