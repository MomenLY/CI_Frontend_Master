import axios from 'app/store/axiosService';

export const boothManagersList = async ( expo_id: string ) => {
    try {
        const response = await (await axios.get(`booth/booth-managers-list/${expo_id}`))
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}