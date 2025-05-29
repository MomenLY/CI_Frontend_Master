
import { updateSettings } from 'src/utils/settingsLibrary';

export const BasicSettingsUpdateAPI = async ({ logo, favicon, companyName, address }) => {
	try {
		const response = await updateSettings({
			key: 'basic',
			name: 'basic setting',
			settings: {
				logo,
				address,
				favicon,
				companyName
			}
		});
		return response;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
