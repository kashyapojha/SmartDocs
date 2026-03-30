// frontend/src/components/VersionHistory.js
import React, { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";
import "../styles/VersionHistory.css";

const VersionHistory = ({ documentId, token }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        API_CONFIG.VERSIONS.LIST(documentId),
        {
          headers: { Authorization: token },
        }
      );
      const data = await response.json();
      setVersions(data || []);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId, token]);

  useEffect(() => {
    if (showModal) {
      fetchVersions();
    }
  }, [showModal, fetchVersions]);

  const handleRestore = async (versionId) => {
    if (!window.confirm("Are you sure you want to restore this version?")) {
      return;
    }

    try {
      const response = await fetch(
        API_CONFIG.VERSIONS.RESTORE(documentId, versionId),
        {
          method: "POST",
          headers: { Authorization: token },
        }
      );

      if (response.ok) {
        alert("Version restored successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
      alert("Failed to restore version");
    }
  };

  return (
    <>
      <button
        className="version-history-button"
        onClick={() => setShowModal(true)}
      >
        🕐 Version History
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📜 Version History</h2>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="loading">Loading versions...</div>
            ) : versions.length === 0 ? (
              <div className="empty-state">No versions saved yet</div>
            ) : (
              <div className="versions-list">
                {versions.map((version, idx) => (
                  <div
                    key={version._id}
                    className={`version-item ${
                      selectedVersion?._id === version._id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="version-info">
                      <span className="version-number">
                        Version {version.versionNumber || idx + 1}
                      </span>
                      <span className="version-author">
                        by {version.authorName || "Unknown"}
                      </span>
                      <span className="version-date">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                      <span className="version-changes">
                        {version.changesSummary}
                      </span>
                      <span className="version-stats">
                        📝 {version.wordCount || 0} words • 🔤 {version.characterCount || 0} chars
                      </span>
                    </div>
                    <div className="version-actions">
                      {!version.isCurrentVersion && (
                        <button
                          className="restore-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestore(version._id);
                          }}
                        >
                          ↩️ Restore
                        </button>
                      )}
                      {version.isCurrentVersion && (
                        <span className="current-badge">Current</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedVersion && (
              <div className="version-details">
                <h3>Preview</h3>
                <div className="version-preview">
                  {selectedVersion.content.substring(0, 500)}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VersionHistory;
