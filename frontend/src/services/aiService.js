// frontend/src/services/aiService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

class AIService {
  async sendMessage(assistantType, content) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assistant_type: assistantType,
        content: content,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error al enviar el mensaje");
    }

    return response.json();
  }

  async getConversations() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener conversaciones");
    }

    return response.json();
  }

  async exportConversation(conversationId) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(
      `${API_URL}/export/conversation/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al exportar conversación");
    }

    return response.json();
  }
}

export const aiService = new AIService();
