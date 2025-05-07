import axios from 'app/store/axiosService';

export const DeleteFieldAPI = async ({ data, endPoint }) => {
	try {
		const response = await axios.request({
			url: `/${endPoint}`,
			method: 'delete',
			data: {
				ids: [data]
			}
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
