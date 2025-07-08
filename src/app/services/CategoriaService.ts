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

// Obtener todas las categorías
const getCategorias = async () => {
    try {
        const response = await axios.get(`${API_URL}/Categorias`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        throw error;
    }
};

// Obtener categoría por nombre
const getCategoriaByName = async (name: string) => {
    try {
        const response = await axios.get(`${API_URL}/Categorias/name/${name}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo categoría con nombre ${name}:`, error);
        throw error;
    }
};

// Obtener categoría por ID
const getCategoriaById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/Categorias/${id}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Error obteniendo categoría con ID ${id}:`, error);
        throw error;
    }
};

export default { getCategorias, getCategoriaByName, getCategoriaById };
