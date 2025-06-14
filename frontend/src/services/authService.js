// frontend/src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en el inicio de sesión");
    }

    return response.json();
  }

  async register(email, password, fullName) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en el registro");
    }

    return response.json();
  }

  async getCurrentUser() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem("access_token");
  }
}

export const authService = new AuthService();
