// frontend/src/config/api.js
// Centralized API configuration for all environments

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // Document endpoints
  DOCUMENTS: {
    LIST: `${API_BASE_URL}/documents`,
    GET: (id) => `${API_BASE_URL}/document/${id}`,
    CREATE: `${API_BASE_URL}/save-document`,
    UPDATE: (id) => `${API_BASE_URL}/update-document/${id}`,
    DELETE: (id) => `${API_BASE_URL}/delete-document/${id}`,
  },
  
  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: `${API_BASE_URL}/api/notifications`,
    MARK_READ: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/api/notifications/read-all`,
    DELETE: (id) => `${API_BASE_URL}/api/notifications/${id}`,
  },
  
  // Sharing endpoints
  SHARING: {
    GET_LINKS: (documentId) => `${API_BASE_URL}/api/share/${documentId}/links`,
    CREATE_LINK: (documentId) => `${API_BASE_URL}/api/share/${documentId}/create-link`,
    DELETE_LINK: (shareLinkId) => `${API_BASE_URL}/api/share/link/${shareLinkId}`,
  },
  
  // Version history endpoints
  VERSIONS: {
    LIST: (documentId) => `${API_BASE_URL}/api/documents/${documentId}/versions`,
    RESTORE: (documentId, versionId) => `${API_BASE_URL}/api/documents/${documentId}/restore/${versionId}`,
  },
};

// Socket.IO URL for real-time collaboration
export const SOCKET_IO_URL = API_BASE_URL;

// Dev logging (remove in production or use proper logging)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration loaded:', {
    baseUrl: API_BASE_URL,
    environment: process.env.NODE_ENV,
  });
}
