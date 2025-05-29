import axios from 'app/store/axiosService';

export const ExpoDeleteAPI = async (expCodes: string[]) => {
	const response = await axios.request({
		url: '/expo/bulk-delete',
		method: 'delete',
		data: { expCodes }
	});
	return response?.data;
};
