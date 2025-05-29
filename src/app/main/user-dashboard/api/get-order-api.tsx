import axios from 'app/store/axiosService';


export const getOrders = async () => {

	const response = await axios.request({
		url: `/order`,
		method: 'get'
	});

	return response?.data?.data;
}