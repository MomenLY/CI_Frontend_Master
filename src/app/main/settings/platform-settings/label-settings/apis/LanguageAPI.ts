import axios from 'app/store/axiosService';

export const getLanguagesAPI = async (search) => {
	// Construct the base URL
	try {
		let url = '/languages/en';

		// Append search parameter only if 'search' is defined
		if (search.length !== undefined) {
			url += `?search=${search}`;
		}

		const response = await axios.request({
			url,
			method: 'get'
		});
		return response?.data?.data;
	} catch (error) {
		throw error;
	}
};
export const updateLanguagesAPI = async (languageDefinitions) => {


	try {
		const response = await axios.request({
			url: `/languages`,
			method: 'patch',
			data: {
				data: languageDefinitions,
				language: 'en'
			}
		});
		return response?.data?.data;
	} catch (error) {
		throw error;
	}
};
