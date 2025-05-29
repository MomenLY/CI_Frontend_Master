import axios from 'app/store/axiosService';

export const boothDetails = async ( booth_id: string ) => {
    try {
        const response = await (await axios.get(`booth/${booth_id}`))?.data?.data
        return response
    } catch (error) {
        console.log(error)
        throw error
    }
}