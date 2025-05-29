import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import axios from 'app/store/axiosService';
import LocalCache from 'src/utils/localCache';

export const getBoothManagersList = async () => {
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
	const boothManagerId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID
	const response = await axios.request({
		url: `/users/?roleId=${boothManagerId}&getAll=true`,
		method: 'get'
	});
	return response?.data?.data?.items;
}
