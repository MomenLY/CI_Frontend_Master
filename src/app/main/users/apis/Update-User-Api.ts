import axios from 'app/store/axiosService';
import { Onion } from 'src/utils/consoleLog';

export const UpdateUserAPI = ({ data }) => {
	const { firstName, lastName, email, userId, roleIds } = data;
	return axios.request({
		url: `/users/bulk`,
		method: 'put',
		data:[{
			_id: userId,
			firstName: firstName,
			lastName: lastName,
			email: email,
			roleIds: roleIds
		}]
	});
};
