import axios from "app/store/axiosService";

export const getAll = async () => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }

    try { 
        const response = await axios.request({
            url: `/expo/dashboard`,
            method: "get",
        });
        return response?.data?.data;
    } catch (error) {
        throw error;
    }
};

export const getSingle = async (expoId) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }

    try { 
        const response = await axios.request({
            url: `/expo/dashboard/${expoId}`,
            method: "get",
        });
        return response?.data?.data;
    } catch (error) {
        throw error;
    }
};
