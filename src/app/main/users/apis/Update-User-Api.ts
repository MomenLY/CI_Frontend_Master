import axios from 'app/store/axiosService';
import { Onion } from 'src/utils/consoleLog';

export const UpdateUserAPI = async (data) => {
	const response = await axios.request({
		url: `/users/bulk`,
		method: 'put',
		data: [data]
	});
	return response;
};
