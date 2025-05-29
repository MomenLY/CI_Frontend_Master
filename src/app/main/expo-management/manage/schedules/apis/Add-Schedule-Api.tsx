import axios from 'app/store/axiosService';

export const AddScheduleAPI = async (data) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    const response = await axios.request({
        url: `/schedule`,
        method: 'post',
        data:data
    });
    return response?.data;
};

