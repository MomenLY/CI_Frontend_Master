import axios from 'app/store/axiosService';


export const generateChatToken = async (data) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    const response = await axios.request({
        url: `/layout/chat-token`,
        method: 'post',
        data:data
    });
    return response?.data;
};