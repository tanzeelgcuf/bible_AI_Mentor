// frontend/src/services/workshopService.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

class WorkshopService {
  async getWorkshops() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/workshops`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener talleres");
    }

    return response.json();
  }

  async getWorkshop(id) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/workshops/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener taller");
    }

    return response.json();
  }

  async markWorkshopCompleted(workshopId) {
    // This would typically be a backend call
    // For now, we'll handle it in localStorage
    const completed = JSON.parse(
      localStorage.getItem("completedWorkshops") || "[]"
    );
    if (!completed.includes(workshopId)) {
      completed.push(workshopId);
      localStorage.setItem("completedWorkshops", JSON.stringify(completed));
    }
    return { success: true };
  }

  async getProgress() {
    const completed = JSON.parse(
      localStorage.getItem("completedWorkshops") || "[]"
    );
    return {
      completed: completed.length,
      total: 21, // Total number of workshops
    };
  }
}

export const workshopService = new WorkshopService();
