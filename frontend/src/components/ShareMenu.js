// frontend/src/components/ShareMenu.js
import React, { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";
import "../styles/ShareMenu.css";

const ShareMenu = ({ documentId, token }) => {
  const [showModal, setShowModal] = useState(false);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchShareLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        API_CONFIG.SHARING.GET_LINKS(documentId),
        {
          headers: { Authorization: token },
        }
      );
      const data = await response.json();
      setShareLinks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch share links:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId, token]);

  useEffect(() => {
    if (showModal) {
      fetchShareLinks();
    }
  }, [showModal, fetchShareLinks]);

  const createShareLink = async (permission = "view") => {
    try {
      setLoading(true);
      const response = await fetch(
        API_CONFIG.SHARING.CREATE_LINK(documentId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ permission }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert(`Share link created!\nURL: ${data.shareUrl}`);
        fetchShareLinks();
      }
    } catch (error) {
      console.error("Failed to create share link:", error);
      alert("Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const revokeLink = async (shareLinkId) => {
    if (!window.confirm("Are you sure you want to revoke this link?")) {
      return;
    }

    try {
      const response = await fetch(
        API_CONFIG.SHARING.DELETE_LINK(shareLinkId),
        {
          method: "DELETE",
          headers: { Authorization: token },
        }
      );

      if (response.ok) {
        fetchShareLinks();
      }
    } catch (error) {
      console.error("Failed to revoke link:", error);
    }
  };

  const shareOnPlatform = (platform) => {
    const currentUrl = window.location.href;
    const documentTitle = document.title || "SmartDocs Document";
    const shareText = `Check out this document: ${documentTitle}`;

    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(shareText);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(documentTitle)}&body=${encodedTitle}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      alert("Failed to copy to clipboard");
    });
  };

  return (
    <>
      <button className="share-button" onClick={() => setShowModal(true)}>
        📤 Share
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 Share Document</h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="share-content">
              <div className="create-link-section">
                <h3>Create new share link</h3>
                <div className="button-group">
                  <button
                    className="create-button view"
                    onClick={() => createShareLink("view")}
                    disabled={loading}
                  >
                    👁️ View Only
                  </button>
                  <button
                    className="create-button edit"
                    onClick={() => createShareLink("edit")}
                    disabled={loading}
                  >
                    ✏️ Can Edit
                  </button>
                </div>
              </div>

              <div className="social-share-section">
                <h3>Share on social media</h3>
                <div className="social-buttons">
                  <button
                    className="social-button twitter"
                    onClick={() => shareOnPlatform("twitter")}
                    title="Share on Twitter"
                  >
                    🐦 Twitter
                  </button>
                  <button
                    className="social-button facebook"
                    onClick={() => shareOnPlatform("facebook")}
                    title="Share on Facebook"
                  >
                    📘 Facebook
                  </button>
                  <button
                    className="social-button linkedin"
                    onClick={() => shareOnPlatform("linkedin")}
                    title="Share on LinkedIn"
                  >
                    💼 LinkedIn
                  </button>
                  <button
                    className="social-button whatsapp"
                    onClick={() => shareOnPlatform("whatsapp")}
                    title="Share on WhatsApp"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    className="social-button telegram"
                    onClick={() => shareOnPlatform("telegram")}
                    title="Share on Telegram"
                  >
                    ✈️ Telegram
                  </button>
                  <button
                    className="social-button email"
                    onClick={() => shareOnPlatform("email")}
                    title="Share via Email"
                  >
                    ✉️ Email
                  </button>
                </div>
              </div>

              <div className="divider">Or manage existing links</div>

              {loading && !shareLinks.length ? (
                <div className="loading">Loading share links...</div>
              ) : shareLinks.length === 0 ? (
                <div className="empty-state">
                  No active share links. Create one above!
                </div>
              ) : (
                <div className="links-list">
                  {shareLinks.map((link) => (
                    <div key={link._id} className="link-item">
                      <div className="link-info">
                        <span className={`permission-badge ${link.permission}`}>
                          {link.permission === "view" ? "👁️ View Only" : "✏️ Can Edit"}
                        </span>
                        <span className="link-date">
                          Created {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                        {link.expiresAt && (
                          <span className="expiry">
                            Expires {new Date(link.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        <span className="access-count">
                          👤 {link.accessCount || 0} access{link.accessCount !== 1 ? "es" : ""}
                        </span>
                      </div>
                      <div className="link-actions">
                        <button
                          className="copy-button"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/share/${link.token}`,
                              link._id
                            )
                          }
                        >
                          {copiedId === link._id ? "✓ Copied!" : "📋 Copy Link"}
                        </button>
                        <button
                          className="revoke-button"
                          onClick={() => revokeLink(link._id)}
                        >
                          🔒 Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareMenu;
