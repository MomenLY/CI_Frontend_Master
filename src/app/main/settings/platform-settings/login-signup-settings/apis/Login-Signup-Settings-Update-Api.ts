import { updateSettings } from 'src/utils/settingsLibrary';

export const LoginSignupSettingsUpdateAPI = async ({ signup, signin, layout, isGoogle, isFacebook, isApple }) => {
	try {
		const response = await updateSettings({
			key: 'signin_signup',
			name: 'signin_signup setting',
			settings: {
				layout: `${layout}`,
				isLoginEnabled: signin,
				isSignUpEnabled: signup,
				socialMediaLogin: {
					apple: isApple,
					google: isGoogle,
					facebook: isFacebook
				}
			}
		});
		return response;
	} catch (error) {
		throw error;
	}
};
