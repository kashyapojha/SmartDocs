import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import "./Login.css";

function Login() {
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

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      await authService.login(email, password);

      // ✅ go to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon">🔐</div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your SmartDocs account</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? "🔄 Signing In..." : "🚀 Sign In"}
        </button>

        <div className="signup-link">
          Don't have an account? <Link to="/signup">Create one here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;