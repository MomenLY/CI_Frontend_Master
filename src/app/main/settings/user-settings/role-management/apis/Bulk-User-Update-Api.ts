import axios from 'app/store/axiosService';

export const BulkUpdateUserAPI = async (data: any) => {
	try{
		const res = await axios.request({
			url: `/users/bulk`,
			method: 'put',
			data: data,
		});
		return res;	
	}catch(e){
	}
  };
  