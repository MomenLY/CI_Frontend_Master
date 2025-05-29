import axios from 'app/store/axiosService';


export const GetSingleExpo = async (id) => {
    const response = await axios.request({
		url:    `/expo/${id}`,
		method: 'get'
	});    	
	return response?.data?.data;
}