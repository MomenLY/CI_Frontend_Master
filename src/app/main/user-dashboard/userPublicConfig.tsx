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



const userPublicConfig: FuseRouteConfigType = {
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
            path: '/',
            element: <UserDashboard />,
            children: [
                {
                    path: '/',
                    element: <Home />
                },
                {
                    path: 'home',
                    element: <Home />
                },
                {
                    path: 'events',
                    element: <Events />
                },
                {
                    path: '/:tenant_id/events/:id',
                    element: <EventDetails />
                },
            ]
        },
        {
            path: '/:tenant_id/events/:id/register',
            element: <EventRegister />
        },
        {
            path: '/:tenant_id/events/:id/proceed-to-pay',
            element: <Payment />,
            auth:["user"]
        },
        {
            path: '/:tenant_id/events/:id/payment-success',
            element: <PaymentSuccess />
        },
        {
            path: '/:tenant_id/events/:id/payment-cancel',
            element: <PaymentCancel />
        }
    ]
};

export default userPublicConfig;