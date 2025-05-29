import axios from 'app/store/axiosService';


export const checkUserExpoRegStatus = async (expoId) => {
	try {
		const expoRegistrationStatus = (await axios.request({
			url: `/participant/check-registration/` + expoId,
			method: 'get'
		}))?.data?.data;
		return expoRegistrationStatus;
	} catch (error) {
		console.log('Error fetching data:', error);
	}
}