import axios from 'app/store/axiosService';


export const GetFavoriteContacts = async (id) => {

    const response = await axios.request({
		url:    `/users/favorite/${id}`,
		method: 'get'
	});    	
	return response?.data?.data;
}