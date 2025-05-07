
import { updateSettings } from 'src/utils/settingsLibrary';

export const BasicSettingsUpdateAPI = async ({ logo, favicon, company_name, company_address }) => {
	try {
		const response = await updateSettings({
			key: 'basic',
			name: 'basic setting',
			settings: {
				logo: `${logo}`,
				address: `${company_address}`,
				favicon: `${favicon}`,
				companyName: `${company_name}`
			}
		});
		return response;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
