import LabelSettings from './label-settings/LabelSettings';
import LayoutSettings from './layout-settings/LayoutSettings';
import LoginSignupSettings from './login-signup-settings/LoginSignupSettings';
import PasswordSettings from './password-settings/PasswordSettings';
import PlatformSettings from './PlatformSettings';
import { Navigate } from "react-router";

const PlatformSettingsConfig = [
	{
		path: 'platform-settings',
		element: <Navigate to="layout-settings"/>
	},
	{
		path: 'platform-settings',
		element: <PlatformSettings />,
		children: [
			{
				path: 'layout-settings',
				element: <LayoutSettings />
			},
			{
				path: 'login-signup-settings',
				element: <LoginSignupSettings />
			},
			{
				path: 'password-settings',
				element: <PasswordSettings />
			},
			{
				path: 'label-settings',
				element: <LabelSettings />
			}
		]
	}
];

export default PlatformSettingsConfig;
