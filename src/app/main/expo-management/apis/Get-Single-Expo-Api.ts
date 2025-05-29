import axios from "app/store/axiosService";

export const getSingleExpo = async (expoId) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }

    try { 
        const response = await axios.request({
            url: `/expo/${expoId}`,
            method: "get",
        });
        return response?.data?.data;
    } catch (error) {
        throw error;
    }
};
