// frontend/src/components/NotificationCenter.js
import React, { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";
import "../styles/NotificationCenter.css";

const NotificationCenter = ({ token, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        API_CONFIG.NOTIFICATIONS.LIST,
        {
          headers: { Authorization: token },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Unable to load notifications");
      setNotifications([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        API_CONFIG.NOTIFICATIONS.MARK_READ(notificationId),
        {
          method: "PUT",
          headers: { Authorization: token },
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        API_CONFIG.NOTIFICATIONS.MARK_ALL_READ,
        {
          method: "PUT",
          headers: { Authorization: token },
        }
      );

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(
        API_CONFIG.NOTIFICATIONS.DELETE(notificationId),
        {
          method: "DELETE",
          headers: { Authorization: token },
        }
      );

      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setShowPanel(!showPanel)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>📬 Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-btn"
                onClick={markAllAsRead}
                disabled={loading}
              >
                {loading ? "Loading..." : "Mark all as read"}
              </button>
            )}
          </div>

          {error && (
            <div className="notification-error">
              <p>{error}</p>
              <button onClick={fetchNotifications} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!error && notifications.length === 0 ? (
            <div className="empty-notifications">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${
                    notification.isRead ? "read" : "unread"
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="notification-icon">
                    {getIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return date.toLocaleDateString();
}

function getIcon(type) {
  switch (type) {
    case "document_shared":
      return "📤";
    case "document_edited":
      return "✏️";
    case "comment_received":
      return "💬";
    case "permission_changed":
      return "🔐";
    case "document_deleted":
      return "🗑️";
    case "collaboration_invite":
      return "👥";
    case "version_restored":
      return "↩️";
    default:
      return "📢";
  }
}

export default NotificationCenter;
