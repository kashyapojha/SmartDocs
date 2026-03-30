import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <div className="home-emoji">🚀</div>

        <h1 className="home-title">SmartDocs</h1>

        <p className="home-desc">
          The intelligent document editor that adapts to your workflow.
          Create, collaborate, and manage documents with powerful features designed for modern teams.
        </p>

        <div className="home-buttons">
          <button className="primary-btn" onClick={() => navigate('/login')}>
            🔐 Get Started
          </button>

          <button className="secondary-btn" onClick={() => navigate('/signup')}>
            📝 Create Free Account
          </button>
        </div>

        <div className="features-section">
          <h2 className="features-title">✨ Why Choose SmartDocs?</h2>

          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3 className="feature-title">Real-Time Collaboration</h3>
              <p className="feature-desc">Work together seamlessly with live editing and instant updates.</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3 className="feature-title">Smart Analytics</h3>
              <p className="feature-desc">Track your writing progress with detailed statistics and insights.</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <h3 className="feature-title">Secure Sharing</h3>
              <p className="feature-desc">Share documents with granular permissions and access control.</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <h3 className="feature-title">Cross-Platform</h3>
              <p className="feature-desc">Access your documents anywhere, on any device, anytime.</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <h3 className="feature-title">Version History</h3>
              <p className="feature-desc">Never lose work with automatic versioning and easy restoration.</p>
            </div>

            <div className="feature-item">
              <span className="feature-icon">📤</span>
              <h3 className="feature-title">Export Anywhere</h3>
              <p className="feature-desc">Export to PDF, Word, or HTML with perfect formatting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;