import settingsConfig from 'app/configs/settingsConfig';
import axios, { TENANTS_IDS } from 'app/store/axiosService';
import LocalCache from './localCache';

export const getSettings = async (key: string, tenant_id: string = null) => {
	let tenantId = tenant_id ? tenant_id : (localStorage.getItem("tenant_id") || TENANTS_IDS[location.hostname]);
	if (!tenantId) {
		throw new Error('No tenant id available');
	}
	let setting = await LocalCache.getItem(`${tenantId}_${key}`, null, 'settings');
	if (!setting || (setting && (setting?.version !== settingsConfig.version))) {
		const dbSetting = await axios.request({
			url: `/settings/single?key=${key}`
		}).then(response => response?.data?.data)
		if (dbSetting) {
			await LocalCache.setItem(`${tenantId}_${key}`, { ...dbSetting, version: settingsConfig.version }, 'settings');
		}
		setting = dbSetting;
	}
	return setting;
};

export const updateSettings = async (AsSetting: any) => {
	const response = await axios.request({
		url: `/settings/update?key=${AsSetting.key}`,
		method: 'patch',
		data: {
			//AsKey: AsSetting.key,
			AsSetting
		}
	});
	if (response?.data?.data?.version) {
		settingsConfig.version = response.data.data.version
	}
	return response?.data;
};

export const getRoleType = async (roleName: string, roleType: string, acl: any) => {
	const response = await axios.request({
		url: 'role',
		method: 'post',
		data: {
			roleName, roleType, acl
		}
	})
}