import axios from 'app/store/axiosService';

export const getCountriesListAPI = async () => {
	try {
		const response = await axios.request({
			url: `http://localhost:3000/assets/countries.json`,
			method: 'get'
		});
		return response?.data?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
