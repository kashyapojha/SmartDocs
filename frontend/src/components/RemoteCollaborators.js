// frontend/src/components/RemoteCollaborators.js
import React, { useState, useEffect } from "react";
import "../styles/RemoteCollaborators.css";

const RemoteCollaborators = ({ activeUsers, cursors }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show the collaborators indicator for 5 seconds, then hide
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeUsers]);

  if (!isVisible) {
    return null;
  }

  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ec4899", // Pink
  ];

  return (
    <div className="remote-collaborators">
      <div className="collaborators-header">
        <span className="collaborators-count">
          👥 {activeUsers.length} {activeUsers.length === 1 ? "user" : "users"}
        </span>
      </div>

      <div className="active-users">
        {activeUsers.map((userId, idx) => (
          <div
            key={userId}
            className="user-indicator"
            style={{
              backgroundColor: colors[idx % colors.length],
            }}
            title={`User ${idx + 1}`}
          >
            {String(idx + 1)}
          </div>
        ))}
      </div>

      {Object.keys(cursors).length > 0 && (
        <div className="remote-cursors-info">
          <p className="text-sm text-gray-600">
            {Object.keys(cursors).length} cursor{Object.keys(cursors).length !== 1 ? "s" : ""} visible
          </p>
        </div>
      )}
    </div>
  );
};

export default RemoteCollaborators;
