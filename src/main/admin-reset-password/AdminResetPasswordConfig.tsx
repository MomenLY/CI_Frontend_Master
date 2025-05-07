import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import ResetPassword from '../reset-password/ResetPassword';


const AdminResetPasswordConfig: FuseRouteConfigType = {
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
			path: 'reset-password',
			element: <ResetPassword />
		}
	]
};

export default AdminResetPasswordConfig;
