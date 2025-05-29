import axios from 'app/store/axiosService';


export const GetBoothManagers = async (expoCode) => {
    const response = await axios.request({
		url:    `/booth/booth-managers-list/${expoCode}`,
		method: 'get'
	});    	
	return response?.data?.data;
}