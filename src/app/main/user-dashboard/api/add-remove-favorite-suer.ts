import axios from 'app/store/axiosService';


export const AddRemoveFavoriteUser = async (data) => {

	const response = await axios.request({
		url: `/users/favorite`,
		method: 'post',
		data: data
	});
	return response?.data;
}