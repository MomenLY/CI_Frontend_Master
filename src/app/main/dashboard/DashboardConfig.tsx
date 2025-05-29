import { useAppSelector } from "app/store/hooks";
import { lazy } from "react";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Dashboard = lazy(() => import('./Dashboard'));

const DashboardConfig = {
	settings: {
		layout: {}
	},
	auth: ['admin'],
	routes: [
		{
			path: 'admin/dashboard',
			element: <Dashboard />
		}
	]
};

export default DashboardConfig;