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

const getPartidos = async () => {
  try {
    const response = await axios.get(`${API_URL}/Partidos`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener los partidos:', error);
    throw error;
  }
};

const getPartidoById = async (id: any) => {
  try {
    const response = await axios.get(`${API_URL}/Partidos/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el partido con ID ${id}:`, error);
    throw error;
  }
};

const getPartidosByUserId = async (userId: any) => {
  try {
    const response = await axios.get(`${API_URL}/Partidos/Usuario/${userId}`, getAuthHeaders());
    return response.data; 
  } catch (error) {
    console.error(`Error al obtener los partidos del usuario con ID ${userId}:`, error);
    throw error;
  }
};

const crearPartido = async (partido: any) => {
  try {
    const response = await axios.post(`${API_URL}/Partidos/crearPartido`, partido, getAuthHeaders());
    console.log('Partido creado correctamente:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear el partido:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear el partido');
  }
};

const actualizarPartido = async (partido: any) => {
  try {
    const response = await axios.put(`${API_URL}/Partidos/${partido.id}`, partido, getAuthHeaders());
    return response.data;
  } catch (error: any) {
    console.error('Error al actualizar partido:', error);
    throw new Error(error.response?.data?.message || 'No se pudo actualizar el partido.');
  }
};

const eliminarPartido = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/Partidos/${id}`, getAuthHeaders());
  } catch (error) {
    console.error(`Error al eliminar el partido con ID ${id}:`, error);
    throw error;
  }
};

export default { getPartidos, getPartidoById, crearPartido, actualizarPartido, eliminarPartido, getPartidosByUserId };
