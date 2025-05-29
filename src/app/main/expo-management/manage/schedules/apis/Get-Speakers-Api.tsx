import { getSettings } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import axios from 'app/store/axiosService';
import LocalCache from 'src/utils/localCache';

export const getSpeakerList = async () => {
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
	const speakerId = settings?.speakerRoleId;
	const response = await axios.request({
		url: `/users/?roleId=${speakerId}&getAll=true`,
		method: 'get'
	});
	return response?.data?.data?.items;
}
