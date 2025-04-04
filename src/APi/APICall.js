import { getAPI } from "./APIConfig";

export async function getConsults() {
    try {
        const response = await getAPI.get('/propiedades');
        return response.data; // Devuelve solo los datos relevantes
    } catch (error) {
        console.error('Error al obtener las propiedades:', error.message);
        throw new Error(`Error al obtener las propiedades: ${error.response?.status || 'Desconocido'}`);
    }
}