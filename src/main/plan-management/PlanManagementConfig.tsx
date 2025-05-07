import { lazy } from "react";

const PlanManagement = lazy(() => import('./PlanManagement'));

const PlanManagementConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'admin/plan-management',
			element: <PlanManagement />
		}
	]
};

export default PlanManagementConfig;