import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import AttendeesForm from './AttendeesForm';
import Attendees from './Attendee';
import { authRoles } from 'src/app/auth';

const AttendeeConfig: FuseRouteConfigType = {
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
    auth: authRoles?.admin,
    routes: [
        {
            path: 'admin/expo/attendee/:id',
            element: <Attendees />,
        }
    ]
};

export default AttendeeConfig;
