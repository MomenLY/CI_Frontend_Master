import axios from 'app/store/axiosService';

export const UpdateScheduleAPI = (data, id) => {
    return axios.request({
        url: `/schedule/${id}`,
        method: 'patch',
        data:data

    });
};
