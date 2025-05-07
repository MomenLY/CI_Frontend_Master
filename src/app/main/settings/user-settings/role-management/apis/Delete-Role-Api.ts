import axios from 'app/store/axiosService';

export const BulkDeleteRoleAPI = async (ids: string[]) => {
	const response = await axios.request({
		url: '/role',
		method: 'delete',
		data: { roleIds: ids }
	});
	return response?.data;
};
