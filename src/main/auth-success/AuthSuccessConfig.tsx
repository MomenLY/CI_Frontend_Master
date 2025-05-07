import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import AuthSuccess from './AuthSuccess';



const AuthSuccessConfig: FuseRouteConfigType = {
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
            path: 'sign-in-success',
            element: <AuthSuccess />
        },
    ]
};

export default AuthSuccessConfig;