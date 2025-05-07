import axios from 'app/store/axiosService';

export const GetFieldsAPI = async ({ data, type }) => {
	try {
		const response = await axios.request({
			url: `/${data}`,
			method: 'get',
			data: {
				pFFormType: type
			}
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
