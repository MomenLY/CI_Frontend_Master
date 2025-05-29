import axios from 'app/store/axiosService';

export const getHallDetailsAPI = async (id: string) => {
    const response = await axios.request({
		url: `/hall?expoId=${id}`,
		method: 'get'
	});
	return response?.data?.data?.allHall;
}