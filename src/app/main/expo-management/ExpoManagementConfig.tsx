import { Navigate } from "react-router";

import ManageSettingsConfig from "./manage/ManageSettingsConfig";
import Expo from "./Expo";
import ExpoAddForm from "./expo/ExpoAddForm";
import ExpoUpdateForm from "./expo/ExpoUpdateForm";
import ExpoManage from "./ExpoManage";
import Manage from "./manage/Manage";
import { authRoles } from "src/app/auth";
const ExpoManagementConfig = {
    auth: authRoles.admin,
    routes: [{
        path: 'admin/expo-management',
        element: <ExpoManage />,
        children: [
            {
                path: '',
                element: <Expo />,
                children: [
                    {
                        path: 'new',
                        element: <ExpoAddForm/>
                    },
                    {
                        path: 'edit/:id',
                        element: <ExpoUpdateForm/>
                    }
                ]
            },
            {
                path: 'expo/:id',
                element: <Manage />,
                children: [
                    {
                        path: '',
                        element: <Navigate to="manage" />
                    },
                    ...ManageSettingsConfig
                ]
            },
            
        ]
    }
    ]
}

export default ExpoManagementConfig;