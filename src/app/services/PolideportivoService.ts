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

// Obtener todos los polideportivos
const getPolideportivos = async () => {
    try {
        const response = await axios.get(`${API_URL}/Polideportivos`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error obteniendo polideportivos:', error);
        throw error;
    }
};

// Obtener polideportivo por nombre
const getPolideportivoByName = async (name: any) => {
    try {
        const response = await axios.get(`${API_URL}/Polideportivos/name/${name}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo polideportivo con nombre ${name}:`, error);
        throw error;
    }
};

export default { getPolideportivos, getPolideportivoByName };
