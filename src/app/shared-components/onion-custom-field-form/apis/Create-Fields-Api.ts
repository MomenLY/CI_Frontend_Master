import axios from 'app/store/axiosService';

export const CreateFieldsAPI = async ({ data, endPoint }) => {

	try {
		const response = await axios.request({
			url: `/${endPoint}`,
			method: 'post',
			data: [data]
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
