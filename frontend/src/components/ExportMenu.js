// frontend/src/components/ExportMenu.js
import React, { useState } from "react";
import { exportService } from "../services/exportService";
import "../styles/ExportMenu.css";

const ExportMenu = ({ title, content }) => {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format) => {
    try {
      setLoading(true);

      console.log("Exporting with format:", format);
      console.log("Title:", title);
      console.log("Content length:", content?.length);

      if (!content || content.trim() === "") {
        alert("No content to export. Please write something first.");
        setLoading(false);
        return;
      }

      const fileName = title.trim() || "document";
      const timestamp = new Date().toISOString().slice(0, 10);
      const finalFileName = `${fileName}-${timestamp}`;

      switch (format) {
        case "pdf":
          exportService.exportPDF(title, content, `${finalFileName}.pdf`);
          break;

        case "html":
          exportService.exportHTML(title, content, `${finalFileName}.html`);
          break;

        case "docx":
          await exportService.exportDOCX(title, content, `${finalFileName}.docx`);
          break;

        default:
          console.error("Unknown export format");
      }

      setShowMenu(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-menu-wrapper">
      <button
        className="export-button"
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
      >
        📥 {loading ? "Exporting..." : "Export"}
      </button>

      {showMenu && !loading && (
        <div className="export-dropdown">
          <button
            className="export-option"
            onClick={() => handleExport("pdf")}
          >
            <span className="icon">📄</span>
            <span className="text">Export as PDF</span>
            <span className="hint">Best for printing</span>
          </button>

          <button
            className="export-option"
            onClick={() => handleExport("docx")}
          >
            <span className="icon">📝</span>
            <span className="text">Export as DOCX</span>
            <span className="hint">Microsoft Word</span>
          </button>

          <button
            className="export-option"
            onClick={() => handleExport("html")}
          >
            <span className="icon">🌐</span>
            <span className="text">Export as HTML</span>
            <span className="hint">Web format</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
