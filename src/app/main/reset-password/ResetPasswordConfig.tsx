import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';

import authRoles from '../../auth/authRoles';
import ResetPassword from './ResetPassword';
import ResetPasswordWithID from './ResetPasswordWithID';

const ResetPasswordConfig: FuseRouteConfigType = {
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
	auth: null,
	routes: [
		{
			path: 'reset-password/:id',
			element: <ResetPasswordWithID />
		}
	]
};

export default ResetPasswordConfig;
