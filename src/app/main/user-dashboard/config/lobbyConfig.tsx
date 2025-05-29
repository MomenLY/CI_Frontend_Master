import { lazy } from "react";
import Booth from "../event/Booth/Booth";

const Lobby = lazy(() => import('../event/Lobby'));

const LobbyConfig = {
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
    auth: ['user', 'admin'],
	routes: [
		{
			path: '/:tenant_id/events/join/:id',
			element: <Lobby />
		},
        {
            path: '/:tenant_id/events/join/:id/booth/:booth_id',
            element: <Booth />
        }
	]
};

export default LobbyConfig;