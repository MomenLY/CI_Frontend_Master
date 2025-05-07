import { updateSettings } from 'src/utils/settingsLibrary';

export const LayoutUpdateAPI = async ({ layout }) => {
	try {
		const response = await updateSettings({
			key: 'layout',
			name: 'layout setting',
			settings: {
				layout
			}
		});
		return response;
	} catch (error) {
		throw error;
	}
};
