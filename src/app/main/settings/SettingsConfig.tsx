import { Navigate } from "react-router";
import SettingsPageLayout from "./SettingsPageLayout";
import PlatformSettingsConfig from "./platform-settings/PlatformSettingsConfig";
import GeneralSettingsConfig from "./general-settings/GeneralSettingsConfig";
import UserSettingsConfig from "./user-settings/UserSettingsConfig";

const SettingsConfig = {
    routes: [
        {
         path: 'admin/settings',
         element: <Navigate to="/admin/settings/general-settings/basic-settings"/>
        },
        {
         path: 'admin/settings',
         element: <SettingsPageLayout />,
         children: [
            ...GeneralSettingsConfig,
            // ...PlatformSettingsConfig,
            ...UserSettingsConfig
            // ...ManageSett
         ]
        }
    ]
}

export default SettingsConfig;