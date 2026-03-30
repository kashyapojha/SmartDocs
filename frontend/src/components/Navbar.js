import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";
import authService from "../services/authService";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = async () => {
    await authService.logout();
    navigate("/");
  };

  return (
    <div className="navbar">
      <h3 className="navbar-title">✨ SmartDocs</h3>

      <div className="navbar-actions">
        {token && (
          <NotificationCenter token={token} userId={localStorage.getItem("userId")} />
        )}
        <button className="nav-btn" onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
        <button className="nav-btn logout-btn" onClick={logout}>🚪 Logout</button>
      </div>
    </div>
  );
}

export default Navbar;