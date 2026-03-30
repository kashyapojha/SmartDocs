// frontend/src/components/AnalyticsDashboard.js
import React, { useState, useEffect } from "react";
import "../styles/AnalyticsDashboard.css";

const AnalyticsDashboard = ({ documents, token }) => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalWords: 0,
    totalCharacters: 0,
    averageWordsPerDoc: 0,
    lastEditedDate: null,
    mostEditedDoc: null,
    longestDoc: null,
  });

  useEffect(() => {
    if (!documents || documents.length === 0) {
      setStats({
        totalDocuments: 0,
        totalWords: 0,
        totalCharacters: 0,
        averageWordsPerDoc: 0,
        lastEditedDate: null,
        mostEditedDoc: null,
        longestDoc: null,
      });
      return;
    }

    let totalWords = 0;
    let totalCharacters = 0;
    let lastEdited = null;
    let longestDoc = null;
    let maxWords = 0;

    documents.forEach((doc) => {
      // Count words
      const words = (doc.content || "").trim().split(/\s+/).filter(w => w).length;
      totalWords += words;
      totalCharacters += (doc.content || "").length;

      // Track longest doc
      if (words > maxWords) {
        maxWords = words;
        longestDoc = {
          title: doc.title || "Untitled",
          words,
        };
      }

      // Track last edited
      const editDate = new Date(doc.updatedAt || doc.createdAt);
      if (!lastEdited || editDate > lastEdited) {
        lastEdited = editDate;
      }
    });

    setStats({
      totalDocuments: documents.length,
      totalWords,
      totalCharacters,
      averageWordsPerDoc: Math.round(totalWords / documents.length),
      lastEditedDate: lastEdited,
      longestDoc,
    });
  }, [documents]);

  return (
    <div className="analytics-dashboard">
      <h2 className="analytics-title">📊 Your Writing Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <p className="stat-label">Total Documents</p>
            <p className="stat-value">{stats.totalDocuments}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <p className="stat-label">Total Words</p>
            <p className="stat-value">{stats.totalWords.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔤</div>
          <div className="stat-info">
            <p className="stat-label">Total Characters</p>
            <p className="stat-value">{stats.totalCharacters.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <p className="stat-label">Avg. Words/Doc</p>
            <p className="stat-value">{stats.averageWordsPerDoc}</p>
          </div>
        </div>
      </div>

      <div className="highlights-section">
        <div className="highlight-card">
          <h3>⏱️ Last Edited</h3>
          <p className="highlight-value">
            {stats.lastEditedDate
              ? new Date(stats.lastEditedDate).toLocaleString()
              : "No documents yet"}
          </p>
        </div>

        {stats.longestDoc && (
          <div className="highlight-card">
            <h3>📚 Longest Document</h3>
            <p className="highlight-value">{stats.longestDoc.title}</p>
            <p className="highlight-subtext">{stats.longestDoc.words} words</p>
          </div>
        )}

        <div className="highlight-card">
          <h3>🎯 Your Productivity</h3>
          <div className="productivity-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  (stats.totalWords / (stats.totalDocuments * 1000)) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="highlight-subtext">
            {stats.averageWordsPerDoc > 5000
              ? "Excellent writer! 🌟"
              : stats.averageWordsPerDoc > 2000
              ? "Good productivity! 👍"
              : "Keep writing! 💪"}
          </p>
        </div>
      </div>

      <div className="stats-summary">
        <h3>📈 Summary</h3>
        <ul className="summary-list">
          <li>
            You have created <strong>{stats.totalDocuments}</strong> document
            {stats.totalDocuments !== 1 ? "s" : ""}
          </li>
          <li>
            You've written <strong>{stats.totalWords.toLocaleString()}</strong> words in total
          </li>
          {stats.longestDoc && (
            <li>
              Your longest document is <strong>{stats.longestDoc.title}</strong> with{" "}
              <strong>{stats.longestDoc.words.toLocaleString()}</strong> words
            </li>
          )}
          <li>
            Average document length: <strong>{stats.averageWordsPerDoc}</strong> words
          </li>
          {stats.lastEditedDate && (
            <li>
              Last edited: <strong>{new Date(stats.lastEditedDate).toLocaleDateString()}</strong>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
