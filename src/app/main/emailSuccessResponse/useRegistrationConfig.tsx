import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';

import authRoles from '../../auth/authRoles';
import UserRegSuccess from './UserRegSuccess';


const useRegistrationConfig: FuseRouteConfigType = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest,
	routes: [
		{
			path: 'verify-user/:token',
			element: <UserRegSuccess />
		}
	]
};

export default useRegistrationConfig;
