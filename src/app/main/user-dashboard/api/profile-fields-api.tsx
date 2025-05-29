import axios from 'app/store/axiosService';


export const getProfileFields = async (type) => {

    const response = await axios.request({
		url: `/profile-fields/?pFFormType=`+type,
		method: 'get',
        headers: {
			'x-role-id': localStorage.getItem("userRoleId"),
        },
	});    
	return response?.data?.data;
}