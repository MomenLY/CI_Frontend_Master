
import { updateSettings } from 'src/utils/settingsLibrary';

export const TimezoneUpdateAPI = async ({ timezone, dateFormat, isUserEnabledToChoose }) => {
	try {
		const response = await updateSettings({
			key: 'timezone',
			name: 'timezone setting',
			settings: {
				timezone,
				dateFormat,
				isUserEnabledToChoose
			}
		});
		return response;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
