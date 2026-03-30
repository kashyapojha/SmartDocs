import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import { useCollaboration } from "../hooks/useCollaboration";
import RemoteCollaborators from "../components/RemoteCollaborators";
import ExportMenu from "../components/ExportMenu";
import VersionHistory from "../components/VersionHistory";
import ShareMenu from "../components/ShareMenu";
import TextAnalysis from "../components/TextAnalysis";
import "./Editor.css";

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [userId] = useState(() => {
    // Get or create userId from token/localStorage
    let stored = localStorage.getItem("userId");
    if (!stored) {
      stored = "user-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("userId", stored);
    }
    return stored;
  });
  const [userName] = useState(() => {
    // Get username from localStorage
    return localStorage.getItem("userName") || "Anonymous";
  });
  const [activeStyle, setActiveStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    superscript: false,
    subscript: false,
  });

  // Real-time collaboration
  const { activeUsers, cursors, sendContentUpdate, sendCursorPosition } = 
    useCollaboration(id || "new", userId, userName);

  const updateActiveStyle = () => {
    if (!editorRef.current) return;

    setActiveStyle({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      superscript: document.queryCommandState("superscript"),
      subscript: document.queryCommandState("subscript"),
    });
  };

  useEffect(() => {
    if (!id || id === "new") {
      setTitle("");
      setContent("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      return;
    }

    fetch(API_CONFIG.DOCUMENTS.GET(id), {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setTitle(data.title || "");
          const contentHtml = data.content || "";
          setContent(contentHtml);
          if (editorRef.current) {
            editorRef.current.innerHTML = contentHtml;
          }
        } else {
          alert("Document not found");
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load document");
      });
  }, [id, navigate]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateActiveStyle);
    
    // Listen for remote content changes
    const handleRemoteChange = (event) => {
      const { content: remoteContent } = event.detail;
      if (editorRef.current && remoteContent !== editorRef.current.innerHTML) {
        // Preserve cursor position while updating content
        const selection = window.getSelection();
        const cursorPos = selection.rangeCount > 0 ? selection.getRangeAt(0).startOffset : 0;
        
        editorRef.current.innerHTML = remoteContent;
        setContent(remoteContent);
        
        // Restore cursor position if possible
        try {
          const range = document.createRange();
          const sel = window.getSelection();
          if (editorRef.current.firstChild) {
            range.setStart(editorRef.current.firstChild, Math.min(cursorPos, editorRef.current.innerText.length));
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch (e) {
          console.log("Could not restore cursor position");
        }
      }
    };

    document.addEventListener("remote-content-change", handleRemoteChange);
    
    return () => {
      document.removeEventListener("selectionchange", updateActiveStyle);
      document.removeEventListener("remote-content-change", handleRemoteChange);
    };
  }, []);

  const command = (action, value = null) => {
    document.execCommand(action, false, value);
    editorRef.current?.focus();
    setTimeout(updateActiveStyle, 10);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) command("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) command("insertImage", url);
  };

  const handleFindReplace = () => {
    if (!findText) return;
    const html = editorRef.current.innerHTML;
    const replaced = html.split(findText).join(replaceText);
    editorRef.current.innerHTML = replaced;
    setContent(replaced);
    alert("Find & Replace completed");
  };

  const saveDocument = async () => {
    const currentHtml = editorRef.current?.innerHTML || "";

    if (!title.trim() && !currentHtml.trim()) {
      alert("Please add a title or content before saving.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please login.");
        navigate("/login");
        return;
      }

      if (id && id !== "new") {
        await fetch(API_CONFIG.DOCUMENTS.UPDATE(id), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ title, content: currentHtml }),
        });
        alert("Updated successfully!");
      } else {
        await fetch(API_CONFIG.DOCUMENTS.CREATE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ title, content: currentHtml }),
        });
        alert("Created successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Save failed");
    }
  };

  return (
    <div className="editor-container">
      {/* Remote Collaborators Widget */}
      {activeUsers.length > 0 && (
        <RemoteCollaborators activeUsers={activeUsers} cursors={cursors} />
      )}
      
      <div className="editor-header">
        <h2>Editor</h2>
        <div className="editor-controls">
          <span>Zoom </span>
          <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>+</button>
        </div>
      </div>

      <div className="content-wrapper">
        <input
          className="title-input"
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="toolbar">
          <button className={activeStyle.bold ? "active" : ""} onClick={() => command("bold")}>B</button>
          <button className={activeStyle.italic ? "active" : ""} onClick={() => command("italic")}>I</button>
          <button className={activeStyle.underline ? "active" : ""} onClick={() => command("underline")}>U</button>
          <button className={activeStyle.strikeThrough ? "active" : ""} onClick={() => command("strikeThrough")}>S</button>
          <button className={activeStyle.superscript ? "active" : ""} onClick={() => command("superscript")}>x²</button>
          <button className={activeStyle.subscript ? "active" : ""} onClick={() => command("subscript")}>x₂</button>

          <select onChange={(e) => command("formatBlock", e.target.value)} defaultValue="">
            <option value="">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="p">Normal</option>
          </select>

          <select onChange={(e) => command("fontName", e.target.value)} defaultValue="Arial">
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
          </select>

          <select onChange={(e) => command("fontSize", e.target.value)} defaultValue="3">
            <option value="1">10px</option>
            <option value="2">12px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>

          <input type="color" title="Text color" onChange={(e) => command("foreColor", e.target.value)} />
          <input type="color" title="Highlight color" onChange={(e) => command("hiliteColor", e.target.value)} />

          <button onClick={() => command("justifyLeft")}>Left</button>
          <button onClick={() => command("justifyCenter")}>Center</button>
          <button onClick={() => command("justifyRight")}>Right</button>
          <button onClick={() => command("justifyFull")}>Justify</button>

          <button onClick={() => command("insertUnorderedList")}>• List</button>
          <button onClick={() => command("insertOrderedList")}>1. List</button>
          <button onClick={insertLink}>Link</button>
          <button onClick={insertImage}>Image</button>

          <button onClick={() => command("undo")}>Undo</button>
          <button onClick={() => command("redo")}>Redo</button>
        </div>

        <div className="find-replace">
          <input
            value={findText}
            placeholder="Find"
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            value={replaceText}
            placeholder="Replace"
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button onClick={handleFindReplace}>Find & Replace</button>
        </div>

        <div
          ref={editorRef}
          className="content-editor"
          contentEditable
          suppressContentEditableWarning
          spellCheck
          dir="ltr"
          style={{ zoom }}
          onInput={(e) => {
            const html = e.currentTarget.innerHTML;
            setContent(html);
            updateActiveStyle();

            // Send content update to collaborators
            sendContentUpdate(html);

            // Track cursor position for remote collaborators
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              const editorRect = editorRef.current.getBoundingClientRect();

              // Send cursor position
              const position = range.startOffset;
              sendCursorPosition(position);

              if (rect.top < editorRect.top + 10) {
                editorRef.current.scrollTop += rect.top - editorRect.top - 10;
              } else if (rect.bottom > editorRect.bottom - 20) {
                editorRef.current.scrollTop += rect.bottom - editorRect.bottom + 20;
              }
            }
          }}
        />

        <TextAnalysis content={content} />
      </div>

      <div className="save-actions">
        <button onClick={saveDocument}>Save Document</button>
        <ExportMenu title={title} content={content} />
        {id && id !== "new" && (
          <>
            <ShareMenu documentId={id} token={localStorage.getItem("token")} />
            <VersionHistory
              documentId={id}
              token={localStorage.getItem("token")}
            />
          </>
        )}
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}

export default Editor;