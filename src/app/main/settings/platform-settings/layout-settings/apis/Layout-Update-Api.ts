import { getSettings, updateSettings } from 'src/utils/settingsLibrary';

export const LayoutUpdateAPI = async ({ layout }) => {
	try {
		const settings = await getSettings('layout');
		const data = await settings?.settings;
		let assetUrl = "";
		let speakerRoleId = "";
		if (data) {
			assetUrl = (data.assetUrl !=="" && data.assetUrl !== undefined ) ? data.assetUrl : "";
			speakerRoleId = (data.speakerRoleId !=="" && data.speakerRoleId !== undefined ) ? data.speakerRoleId : "";
		}

		const response = await updateSettings({
			key: 'layout',
			name: 'layout setting',
			settings: {
				layout,
				"assetUrl": assetUrl,
        		"speakerRoleId": speakerRoleId
			}
		});
		return response;
	} catch (error) {
		throw error;
	}
};
