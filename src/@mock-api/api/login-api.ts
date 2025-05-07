import axios from 'app/store/axiosService';

export const getLoginUserAPI = ({ data }) => {
	return axios.request({
		url: `auth/login`,
		method: 'post',
		data
	});
};
