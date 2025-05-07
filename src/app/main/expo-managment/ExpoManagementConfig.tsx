import { Navigate } from "react-router";
import ExpoPageLayout from "./ExpoPageLayout";
import ManageSettings from "./manage/ManageSettings";
import ManageSettingsConfig from "./manage/ManageSettingsConfig";


const ExpoManagementConfig = {
    routes: [
        // {
        //  path: 'admin/settings',
        //  element: <Navigate to="/admin/settings/general-settings/basic-settings"/>
        // },
        {
         path: 'expo-management',
         element: <ExpoPageLayout />,
         children: [
            ...ManageSettingsConfig
         ]
        }
    ]
}

export default ExpoManagementConfig;