import axios from 'axios';
import API_URL from '@/config';

// Obtener los encabezados de autorización
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

// Obtener todos los equipos
const getEquipos = async () => {
    try {
        const response = await axios.get(`${API_URL}/Equipos`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error obteniendo equipos:', error);
        throw error;
    }
};

// Obtener equipos por categoría
const getEquiposPorCategoria = async (categoriaId: string) => {
    try {
        const response = await axios.get(`${API_URL}/Equipos/categoria/${categoriaId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo equipos para la categoría ${categoriaId}:`, error);
        throw error;
    }
};


// Obtener equipo por nombre y categoria
const getEquipoByNameAndCategory = async (name: string, categoria: string) => {
    try {
        const response = await axios.get(`${API_URL}/Equipos/name/${name}/categoria/${categoria}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo equipo con nombre ${name} y categoría ${categoria}:`, error);
        throw error;
    }
};


// Obtener equipo por ID
const getEquipoById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/Equipos/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo equipo con ID ${id}:`, error);
        throw error;
    }
};

export default { getEquipos, getEquiposPorCategoria, getEquipoById, getEquipoByNameAndCategory };
