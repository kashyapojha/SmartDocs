// frontend/src/services/authService.js
import { API_CONFIG } from '../config/api';

class AuthService {
  // Store tokens in localStorage
  setTokens(token, refreshToken) {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  }

  // Get stored tokens
  getTokens() {
    return {
      token: localStorage.getItem("token"),
      refreshToken: localStorage.getItem("refreshToken"),
    };
  }

  // Clear tokens
  clearTokens() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
  }

  // Check if token is expired (rough estimate)
  isTokenExpired() {
    const token = localStorage.getItem("token");
    if (!token) return true;

    try {
      // Decode JWT without verification (client-side only for UX)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime - 60000; // Refresh 1 min before expiry
    } catch {
      return true;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const { refreshToken } = this.getTokens();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(API_CONFIG.AUTH.REFRESH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      return data.token;
    } catch (error) {
      console.error("Refresh token failed:", error);
      this.clearTokens();
      return null;
    }
  }

  // Signup
  async signup(email, password, name) {
    try {
      const response = await fetch(API_CONFIG.AUTH.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      this.setTokens(data.token, data.refreshToken);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Login
  async login(email, password) {
    try {
      const response = await fetch(API_CONFIG.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      this.setTokens(data.token, data.refreshToken);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const { token } = this.getTokens();

      if (token) {
        await fetch(`${API_CONFIG.BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: token,
          },
        });
      }

      this.clearTokens();
    } catch (error) {
      console.error("Logout error:", error);
      this.clearTokens();
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { token } = this.getTokens();

      if (!token) return null;

      // Check if token is expired
      if (this.isTokenExpired()) {
        const newToken = await this.refreshToken();
        if (!newToken) return null;
      }

      const response = await fetch(API_CONFIG.AUTH.ME, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  // Make API request with automatic token refresh
  async authenticatedFetch(url, options = {}) {
    try {
      // Check and refresh token if needed
      if (this.isTokenExpired()) {
        const newToken = await this.refreshToken();
        if (!newToken) {
          throw new Error("Session expired");
        }
      }

      // Add token to headers
      const headers = {
        ...options.headers,
        Authorization: localStorage.getItem("token"),
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If unauthorized, try refreshing token once
      if (response.status === 401) {
        const newToken = await this.refreshToken();
        if (newToken) {
          headers.Authorization = newToken;
          return fetch(url, {
            ...options,
            headers,
          });
        }
      }

      return response;
    } catch (error) {
      console.error("Authenticated fetch error:", error);
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
