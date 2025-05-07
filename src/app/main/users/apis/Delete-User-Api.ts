import axios from 'app/store/axiosService';

export const BulkDeleteUserAPI = async (ids: string[]) => {
	const response = await axios.request({
		url: '/users',
		method: 'delete',
		data: { ids }
	});
	return response?.data;
};
