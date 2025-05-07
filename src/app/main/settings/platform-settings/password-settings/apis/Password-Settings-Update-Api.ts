import { updateSettings } from 'src/utils/settingsLibrary';

export const PasswordSettingsUpdateAPI = async ({ data }) => {
	try {
		const response = await updateSettings({
			key: 'password',
			name: 'password setting',
			settings: data
		});
		return response;
	} catch (error) {
		throw error;
	}
};
