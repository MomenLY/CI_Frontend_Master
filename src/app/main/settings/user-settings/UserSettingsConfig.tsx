
import { Navigate } from "react-router";
import UserSettings from "./UserSettings";
import ProfileFieldSettings from "./profile-field-settings/ProfileFieldSettings";
import AddFieldForm from "./profile-field-settings/profile-field/AddFieldForm";
import RoleManagement from "./role-management/RoleManagement";
import AddForm from "./role-management/role-management/AddForm";
import AdminManagement from "./admin-management/AdminManagement";
import AdminForm from "./admin-management/admin-management/AdminForm";
import UpdateAdminForm from "./admin-management/admin-management/UpdateAdminForm";
import EditForm from "./role-management/role-management/EditForm";

const UserSettingsConfig = [
	{
		path: 'user-settings',
		element: <Navigate to="profile-field-settings" />
	},
	{
		path: 'user-settings',
		element: <UserSettings />,
		children: [
			{
				path: 'profile-field-settings',
				element: <ProfileFieldSettings />,
				children: [
					{
						path: ':id',
						element: <AddFieldForm />
					}
				]
			},
			{
				path: 'role-management',
				element: <RoleManagement />,
				children: [{
					path: ':id',
					element: <AddForm />
				},
				{
					path: 'edit/:id/:roleType?',
					element: <EditForm />
				}]
			},
			{
				path:'admin-management',
				element: <AdminManagement/>,
				children:[{
					path:':id',
					element: <AdminForm/>
				},
				{
					path:'edit/:id',
					element: <UpdateAdminForm/>
				}]
			}
		]
	}
];

export default UserSettingsConfig;
