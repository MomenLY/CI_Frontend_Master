import axios from 'app/store/axiosService';

export const AddUserAPI = ({ data }) => {
	const token = localStorage.getItem("jwt_access_token");
	const { firstName, lastName, email, password, role, shouldSendEmail } = data;
	return axios.request({
		url: `/users`,
		method: 'post',
		data: {
			firstName,
			lastName,
			email,
			password,
			roleIds: role,
			shouldSendEmail
		}
	});
};

