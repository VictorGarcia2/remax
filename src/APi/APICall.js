import { getAPI } from "./APIConfig";

export async function getConsults() {
    try {
        const response = await getAPI.get('/api/propiedades');
        console.log('response propiedades')
        console.log(response)
        return response;
    } catch (error) {
        console.error('Error:', error)
        throw error
    }
}