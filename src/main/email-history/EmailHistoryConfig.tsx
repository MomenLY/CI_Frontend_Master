import { lazy } from "react";

const EmailHistory = lazy(() => import('./EmailHistory'));

const EmailHistoryConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'admin/email-history',
			element: <EmailHistory />
		}
	]
};

export default EmailHistoryConfig;