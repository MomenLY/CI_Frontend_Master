import axios from 'app/store/axiosService';

export const getRoleDetailsById = async (id: string) => {
    const response = await axios.request({
		url: `/role/${id}`,
		method: 'get'
	});
	return response?.data;
}