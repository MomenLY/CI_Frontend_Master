import axios from 'app/store/axiosService';

export const GetScheduleAPI = async ({ expId, hallid }) => {
	try {
		const response = await axios.request({
			url: `/schedule?schExpoId=${expId}&schHallId=${hallid}`,
			method: 'get'
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
