import axios from 'app/store/axiosService';

export const UpdateStatusAPI = async ({ data }) => {
	try {
		const response = await axios.request({
			url: `/${data.endPoint}`,
			method: 'patch',
			data: [
				{
					_id: data.id,
					pFStatus: data.status
				}
			]
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
