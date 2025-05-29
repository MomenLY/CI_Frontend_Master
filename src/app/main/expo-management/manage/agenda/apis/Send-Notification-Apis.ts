import axios from "app/store/axiosService";

export const sendNotification = async (expoId, expoLink) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    
    try {
        const response = await axios.request({
            url: `/notify/expo?schExpoCode=${expoId}`,
            method: "post",
            data:{
                url: expoLink
            }
        });
        return response;
    } catch (error) {
        throw error;
    }
};
