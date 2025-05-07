import axios from 'app/store/axiosService';

export const getUserAPI = async () => {
	try {
		const response = await axios.get('/users/profile', {});
		return response.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
