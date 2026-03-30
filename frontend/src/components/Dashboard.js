import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../config/api";
import AnalyticsDashboard from "./AnalyticsDashboard";
import "./Dashboard.css";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, alphabetical
  const [filterDate, setFilterDate] = useState("all"); // all, today, week, month
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([refreshDocuments(), fetchUser()]);
    };
    fetchData();
  }, [navigate]);

  

  // 🔥 Fetch user information
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(API_CONFIG.AUTH.ME, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  // 🔥 Generate avatar URL or default
  const getAvatarUrl = (user) => {
    if (user?.avatar) {
      return user.avatar;
    }
    // Generate a default avatar based on user name
    const name = user?.name || user?.email || "User";
    const colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
      "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
    ];
    const colorIndex = name.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colors[colorIndex].replace('#', '')}&color=fff&size=40`;
  };

  // Apply search and filter whenever documents, searchQuery, sortBy, or filterDate changes
  useEffect(() => {
    let filtered = [...documents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        const titleMatch = doc.title?.toLowerCase().includes(query);
        const contentMatch = doc.content?.toLowerCase().includes(query);
        return titleMatch || contentMatch;
      });
    }

    // Date filter
    if (filterDate !== "all") {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc.updatedAt || doc.createdAt);
        
        switch (filterDate) {
          case "today":
            return docDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return docDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return docDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case "oldest":
          return new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt);
        case "alphabetical":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, sortBy, filterDate]);

  // 🔥 Refresh documents
  const refreshDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const res = await fetch(API_CONFIG.DOCUMENTS.LIST, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      console.log("API Response:", data); // 🔥 Debug

      // ✅ Important fix
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        // Token issue or backend error
        setDocuments([]);
        console.error("Unexpected response:", data);

        if (data.message === "No token" || data.message === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Delete document
  const deleteDocument = async (id) => {
    try {
      await fetch(API_CONFIG.DOCUMENTS.DELETE(id), {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      refreshDocuments(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* User Header */}
      {user && (
        <div className="user-header">
          <div className="user-avatar">
            <img src={getAvatarUrl(user)} alt={user.name || "User"} />
          </div>
          <div className="user-info">
            <h3>Welcome back, {user.name || "User"}!</h3>
            <p>{user.email}</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              navigate("/login");
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}

      <div className="smartdocs-card">
        <h2>SmartDocs</h2>
        <p>This is your workspace. Use the buttons below to create and edit your documents.</p>
        <button className="create-btn" onClick={() => navigate("/editor/new")}>➕ Create New Document</button>
      </div>

      <h2>My Documents</h2>

      <button className="create-btn" onClick={() => navigate("/editor/new")}>➕ Create New Document</button>

      {/* Analytics Dashboard */}
      {documents.length > 0 && (
        <AnalyticsDashboard documents={documents} token={localStorage.getItem("token")} />
      )}

      {/* Search and Filter Controls */}
      <div className="search-filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">📅 Most Recent</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="alphabetical">🔤 Alphabetical</option>
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-select"
          >
            <option value="all">📆 All Time</option>
            <option value="today">📆 Today</option>
            <option value="week">📆 This Week</option>
            <option value="month">📆 This Month</option>
          </select>
        </div>
      </div>

      <div className="search-results-info">
        {searchQuery && `Found ${filteredDocuments.length} result${filteredDocuments.length !== 1 ? "s" : ""}`}
      </div>

      {/* 🔥 Loading state */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredDocuments.length === 0 ? (
        <p>{searchQuery ? "No documents match your search" : "No documents found"}</p>
      ) : (
        <div className="grid">
          {filteredDocuments.map((doc) => (
            <div key={doc._id} className="card">
              <h3>{doc.title || "Untitled Document"}</h3>
              <div className="card-meta">
                <span className="doc-date">
                  🕐 {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="card-preview">
                {doc.content ? doc.content.substring(0, 100) + "..." : "No content"}
              </div>

              <div className="actions">
                <button onClick={() => navigate(`/editor/${doc._id}`)}>
                  ✏️ Edit
                </button>

                <button
                  className="delete"
                  onClick={() => deleteDocument(doc._id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;