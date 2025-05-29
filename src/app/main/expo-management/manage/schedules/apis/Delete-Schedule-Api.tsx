import axios from 'app/store/axiosService';

export const ScheduleDeleteAPI = async (ids: string, expoId: string) => {
	const response = await axios.request({
		url: `/schedule/${ids}`,
		method: 'delete',
        data:{
            schExpoId: expoId
        }
	});
	return response?.data;
};
