import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import axios from 'app/store/axiosService';
import LocalCache from 'src/utils/localCache';

export const addBooth = async (data) => {
	try {
        const response = await axios.request({
            url: `/booth`,
            method: 'post',
            data: data
        });
        return response?.data?.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return error;
    }
}
