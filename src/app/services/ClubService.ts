import axios from "axios";
import API_URL from "@/config";

// Obtener los encabezados de autorización
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No se encontró el token");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener todos los clubes
const getClubs = async () => {
  try {
    const response = await axios.get(`${API_URL}/Clubs`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error obteniendo clubes:", error);
    throw error;
  }
};

// Obtener club por ID
const getClubById = async (id: any) => {
  try {
    const response = await axios.get(`${API_URL}/Clubs/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo club con ID ${id}:`, error);
    throw error;
  }
};

export default { getClubs, getClubById };
