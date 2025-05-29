import axios from 'app/store/axiosService';

export const getSingleScheduleByID = async (scheduleId: string, expoId: any) => {
    const response = await axios.request({
		url: `/schedule/${scheduleId}`,
		method: 'post',
		data: {
			schExpoId: expoId
		}
		
	});
	return response?.data;
}