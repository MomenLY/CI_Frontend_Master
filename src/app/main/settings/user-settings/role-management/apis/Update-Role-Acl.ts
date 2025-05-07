import axios from 'app/store/axiosService';

export const updateRoleAcl = async (roleAcl: any) => {
    const response = await axios.request({
		url:    `/role`,
		method: 'patch',
        data: [roleAcl]
	});
	return response?.data;
}