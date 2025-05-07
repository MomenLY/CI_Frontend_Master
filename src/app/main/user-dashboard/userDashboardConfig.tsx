import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import UserDashboard from './userDashbord';



const UserDashboardConfig: FuseRouteConfigType = {
    settings: {
        layout: {
            config: {
                navbar: {
                    display: false
                },
                toolbar: {
                    display: true
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
    routes: [
        {
            path: 'dashboard',
            element: <UserDashboard />
        },
    ]
};

export default UserDashboardConfig;