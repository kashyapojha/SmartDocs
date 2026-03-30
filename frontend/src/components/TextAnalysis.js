// frontend/src/components/TextAnalysis.js
import React, { useState, useEffect } from "react";
import {
  summarizeText,
  extractKeywords,
  calculateReadability,
} from "../services/textAnalysisService.js";
import "../styles/TextAnalysis.css";

const TextAnalysis = ({ content }) => {
  const [activeTab, setActiveTab] = useState("readability");
  const [analysis, setAnalysis] = useState({
    summary: "",
    keywords: [],
    readability: null,
  });
  const [loading, setLoading] = useState(false);

  // Analyze text whenever content changes
  useEffect(() => {
    if (!content || content.trim().length === 0) {
      return;
    }

    setLoading(true);
    // Small delay to avoid excessive recalculation
    const timer = setTimeout(() => {
      try {
        const summary = summarizeText(content, 3);
        const keywords = extractKeywords(content, 10);
        const readability = calculateReadability(content);

        setAnalysis({
          summary,
          keywords,
          readability,
        });
      } catch (error) {
        console.error("Text analysis error:", error);
      } finally {
        setLoading(false);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timer);
  }, [content]);

  if (!content || content.trim().length === 0) {
    return (
      <div className="text-analysis-container">
        <div className="empty-state">
          <p>📝 Start writing to see analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-analysis-container">
      <div className="analysis-tabs">
        <button
          className={`tab-btn ${activeTab === "readability" ? "active" : ""}`}
          onClick={() => setActiveTab("readability")}
        >
          📊 Readability
        </button>
        <button
          className={`tab-btn ${activeTab === "keywords" ? "active" : ""}`}
          onClick={() => setActiveTab("keywords")}
        >
          🔑 Keywords
        </button>
        <button
          className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          📄 Summary
        </button>
      </div>

      <div className="analysis-content">
        {loading && <div className="loading-state">Analyzing...</div>}

        {/* Readability Tab */}
        {activeTab === "readability" && analysis.readability && !loading && (
          <div className="readability-panel">
            <div className="readability-score-section">
              <div className="score-circle">
                <div className="score-value">
                  {analysis.readability.grade}
                </div>
                <div className="score-label">Grade Level</div>
              </div>
              <div className="readability-details">
                <p className="readability-level">
                  📚 {analysis.readability.readabilityLevel}
                </p>
                <p className="reading-time">
                  ⏱️ Reading Time: ~{analysis.readability.readingTimeMinutes} min
                </p>
                <p className="complexity">
                  🔍 Complexity: {analysis.readability.complexityScore}%
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Words</span>
                <span className="stat-value">
                  {analysis.readability.wordCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Characters</span>
                <span className="stat-value">
                  {analysis.readability.charCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sentences</span>
                <span className="stat-value">
                  {analysis.readability.sentenceCount}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Words/Sent</span>
                <span className="stat-value">
                  {analysis.readability.averageWordsPerSentence}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Chars/Word</span>
                <span className="stat-value">
                  {analysis.readability.averageCharsPerWord}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Syllables/Word</span>
                <span className="stat-value">
                  {analysis.readability.averageSyllablesPerWord}
                </span>
              </div>
            </div>

            <div className="readability-guide">
              <h4>📖 Readability Guide</h4>
              <ul>
                <li>
                  <strong>Grade 0-6:</strong> Very Easy - Suitable for children
                </li>
                <li>
                  <strong>Grade 6-9:</strong> Easy - Middle School level
                </li>
                <li>
                  <strong>Grade 9-13:</strong> Standard - High School level
                </li>
                <li>
                  <strong>Grade 13-16:</strong> Hard - College level
                </li>
                <li>
                  <strong>Grade 16+:</strong> Very Hard - Professional level
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === "keywords" && analysis.keywords && !loading && (
          <div className="keywords-panel">
            {analysis.keywords.length === 0 ? (
              <p className="no-keywords">No keywords found</p>
            ) : (
              <div className="keywords-grid">
                {analysis.keywords.map((keyword, idx) => (
                  <div key={idx} className="keyword-card">
                    <div className="keyword-word">{keyword.word}</div>
                    <div className="keyword-stats">
                      <span className="keyword-freq">
                        Freq: {keyword.frequency}
                      </span>
                      <span className="keyword-relevance">
                        {keyword.relevance}%
                      </span>
                    </div>
                    <div className="keyword-bar">
                      <div
                        className="keyword-bar-fill"
                        style={{
                          width: `${keyword.relevance}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && analysis.summary && !loading && (
          <div className="summary-panel">
            <div className="summary-header">
              <h4>📄 Document Summary</h4>
            </div>
            <div className="summary-content">
              <p>{analysis.summary}</p>
            </div>
            <div className="summary-info">
              <p>
                💡 This is an AI-assisted summary of your document using
                sentence scoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextAnalysis;
