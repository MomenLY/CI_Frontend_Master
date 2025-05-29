import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import SuperAdminAccess from './SuperAdminAccess';
import { authRoles } from 'src/app/auth';


const SuperAdminAccessConfig: FuseRouteConfigType = {
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
            path: 'super-admin-access',
            element: <SuperAdminAccess />
        },
    ]
};

export default SuperAdminAccessConfig;