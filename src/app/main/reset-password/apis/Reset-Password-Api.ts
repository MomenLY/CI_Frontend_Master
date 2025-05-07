import axios from 'app/store/axiosService';

export const resetPasswordAPI = async ({ data }) => {
	const { token } = data;


	try {
		if (token === undefined || token === null || token === ' ') {
			const response = await axios.request({
				url: `/users/reset/password`,
				method: 'post',
				data: { password: data.password }
			});
			return response?.data;
		}

		const response = await axios.request({
			url: `/users/reset/password/${token}`,
			method: 'post',
			data: { password: data.password }
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
