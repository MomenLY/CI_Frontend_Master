import axios from 'app/store/axiosService';

export const AddAttendee = async (data, expoId) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    const response = await axios.request({
        url: `/add-attendee?expoId=${expoId}`,
        method: 'post',
        data: data
    });
    return response?.data
};

