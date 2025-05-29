import axios from 'app/store/axiosService';


export const getEvent = async (id) => {
	try {
		return (await axios.get(`/expo/${id}`))?.data?.data;
	} catch (error) {
		console.error('Error fetching event details:', error);
	}
};
