import axios from 'axios';
import API_URL from '@/config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No se encontró el token');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getDisponibilidades = async () => {
  try {
    const response = await axios.get(`${API_URL}/Disponibilidad`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener las disponibilidades:', error);
    throw error;
  }
};

const getDisponibilidadById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/Disponibilidad/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la disponibilidad con ID ${id}:`, error);
    throw error;
  }
};

const getDisponibilidadByUserAndDate = async (usuarioId: string, fecha: string) => {
    try {
      const response = await axios.get(`${API_URL}/Disponibilidad/${usuarioId}/${fecha}`, getAuthHeaders());
      return response.data;
    } catch (error: any) {
      console.error(`Error al obtener la disponibilidad del usuario ${usuarioId} para la fecha ${fecha}:`, error);
      throw new Error(error.response?.data?.message || 'No se pudo obtener la disponibilidad.');
    }
  };
  

const crearDisponibilidad = async (disponibilidad: any) => {
  try {
    const response = await axios.post(`${API_URL}/Disponibilidad`, disponibilidad, getAuthHeaders());
    console.log('Disponibilidad creada correctamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear la disponibilidad:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear la disponibilidad');
  }
};

const actualizarDisponibilidad = async (disponibilidad: any) => {
  try {
    const response = await axios.put(`${API_URL}/Disponibilidad/${disponibilidad.id}`, disponibilidad, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar la disponibilidad:', error);
    throw new Error(error.response?.data?.message || 'No se pudo actualizar la disponibilidad.');
  }
};

const eliminarDisponibilidad = async (id: string) => {
  try {
    await axios.delete(`${API_URL}/Disponibilidad/${id}`, getAuthHeaders());
  } catch (error) {
    console.error(`Error al eliminar la disponibilidad con ID ${id}:`, error);
    throw error;
  }
};

export default { 
  getDisponibilidades, 
  getDisponibilidadById, 
  crearDisponibilidad, 
  actualizarDisponibilidad, 
  eliminarDisponibilidad, 
  getDisponibilidadByUserAndDate 
};
