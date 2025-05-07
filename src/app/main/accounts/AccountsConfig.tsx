import { lazy } from "react";

const Accounts = lazy(() => import('./Accounts'));

const AccountsConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'admin/accounts',
			element: <Accounts />
		}
	]
};

export default AccountsConfig;