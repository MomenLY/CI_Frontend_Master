import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';

import authRoles from '../../auth/authRoles';
import Confirmation from './Confirmation';


const ConfirmationConfig: FuseRouteConfigType = {
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
			path: 'confirmation',
			element: <Confirmation />
		}
	]
};

export default ConfirmationConfig;
