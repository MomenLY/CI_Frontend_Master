import { lazy } from "react";
import UserForm from "./user/UserForm";
import UpdateUserForm from "./user/UpdateUserForm";

const Users = lazy(() => import('./Users'));

const UsersConfig = {
	settings: {
		layout: {}
	},
	routes: [
		{
			path: 'admin/users',
			element: <Users />,
			children: [
				{
					path: ':id',
					element: <UserForm />
				},
				{
					path: 'edit/:id',
					element: <UpdateUserForm />
				}
			]
		}
	]
};

export default UsersConfig;