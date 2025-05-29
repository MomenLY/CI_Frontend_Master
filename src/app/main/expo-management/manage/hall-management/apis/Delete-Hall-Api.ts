import axios from 'app/store/axiosService';

export const BulkDeleteHallAPI = async (ids: string[]) => {
	
	
	const response = await axios.request({
		url: '/hall/bulk-delete',
		method: 'delete',
		data: { ids: ids }
	});
	return response?.data;
};
