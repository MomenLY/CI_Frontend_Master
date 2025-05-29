
import axios from 'app/store/axiosService';


export const deleteUser= async (userId) => {

    try {
        const response = await axios.delete(`/users/${userId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response?.data;
    } catch (error) {
        console.error('Error in bulk update:', error);
        throw error;
    }
};