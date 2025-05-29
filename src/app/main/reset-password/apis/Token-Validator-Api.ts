import axios from 'app/store/axiosService';

export const TokenValidatorApi = async ({ data }) => {
	try {
    
		const response = await axios.request({
			url: `/users/validate-reset-password-token/${data}`,
			method: 'post'
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
