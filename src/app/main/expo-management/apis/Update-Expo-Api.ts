import axios from 'app/store/axiosService';

export const UpdateExpoAPI = (data) => {
	return axios.request({
		url: `/expo/bulk-update`,
		method: 'patch',
		data:{
            expos:[data]
        }
	});
};
