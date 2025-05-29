import { FuseRouteConfigType } from '@fuse/utils/FuseUtils';
import UserDashboard from './userDashbord';
import Home from './home/Home';
import { Navigate } from 'react-router';
import Events from './event/Events';
import EventDetails from './event/EventDetails';
import EventRegister from './event/EventRegister';
import Payment from './event/Payment';
import PaymentSuccess from './event/PaymentSuccess';
import PaymentCancel from './event/PaymentCancel';
import Lobby from './event/Lobby';
import ResetPassword from './home/ResetPassword';
import RegisteredEvents from './event/RegisteredEvents';



const UserDashboardConfig: FuseRouteConfigType = {
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
    auth: ['user'],
    routes: [
        {
            path: 'dashboard',
            element: <UserDashboard />,
            children: [
                {
                    path: '',
                    element: <Navigate to="home"/>
                },
                {
                    path: 'home',
                    element: <Home />,
                },
                {
                    path: 'events',
                    element: <Events/>
                },
                // {
                //     path: 'events/:id',
                //     element: <EventDetails/>
                // },
                {
                    path: 'events/:id/register',
                    element: <EventRegister/>
                },
                {
                    path: 'events/:id/proceed-to-pay',
                    element: <Payment />
                },
                {
                    path: 'events/:id/payment-success',
                    element: <PaymentSuccess />
                },
                {
                    path: 'events/:id/payment-cancel',
                    element: <PaymentCancel />
                },
                {
                    path: 'events/join/:id',
                    element: <Lobby />
                },
                {
                    path: 'registered-events',
                    element: <RegisteredEvents />,
                },
            ]
        },
    ]
};

export default UserDashboardConfig;
