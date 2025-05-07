
import { updateSettings } from 'src/utils/settingsLibrary';

export const WebsiteSettingsUpdateAPI = async ({ data }) => {
	try {
		const response = await updateSettings({
			key: 'website',
			name: 'website settings',
			settings: {
				contactAddress: data.contactAddress,
				socialMediaLink: {
					youtube: {
						link: data?.youtubeLink,
						isEnabled: data?.youtubeIsEnabled
					},
					facebook: {
						link: data?.facebookLink,
						isEnabled: data?.facebookIsEnabled
					},
					linkedIn: {
						link: data?.linkedInLink,
						isEnabled: data?.linkedInIsEnabled
					},
					instagram: {
						link: data?.instagramLink,
						isEnabled: data?.instagramIsEnabled
					}
				},
				websiteSettings: {
					email: data.contactEmail,
					contact: data?.contactNumber,
					countryCode: data?.countryCode
				},
				isEnquiryFormEnabled: data?.isEnquiryFormEnabled
			}
		});
		return response;
	} catch (error) {
		console.error('Error fetching data:', error);
		throw error;
	}
};
