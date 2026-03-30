import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔥 If already logged in → go to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError("");

      if (!name || !email || !password) {
        setError("All fields are required");
        return;
      }

      await authService.signup(email, password, name);

      // ✅ go to dashboard directly
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <div className="signup-icon">📝</div>

        <h1 className="signup-title">Join SmartDocs</h1>
        <p className="signup-subtitle">Create your account and start creating amazing documents</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={loading || !name || !email || !password}
        >
          {loading ? "🔄 Creating Account..." : "🚀 Create Account"}
        </button>

        <div className="login-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;