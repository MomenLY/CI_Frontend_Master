import ResetPassword from "../../reset-password/ResetPassword";
import BasicSettings from "./basic-settings/BasicSettings";
import GeneralSettings from "./GeneralSettings";
import ProfileSettings from "./profile-settings/ProfileSettings";
import Reset_Password from "./reset-password/ResetPassword";
import StorageCDNSettings from "./storage-CDN-settings/StorageCDNSettings";
import TimezoneSettings from "./timezone-settings/TimezoneSettings";
import WebsiteSettings from "./website-settings/WebsiteSettings";
import { Navigate } from "react-router";

const GeneralSettingsConfig = [
    {
        path: 'general-settings',
        element: <Navigate to="basic-settings" />
    },
    {
        path: 'general-settings',
        element: <GeneralSettings />,
        children: [
            {
                path: 'basic-settings',
                element: <BasicSettings />
            },
            {
                path: 'profile-settings',
                element: <ProfileSettings />
            },
            {
                path: 'reset-password',
                element: <Reset_Password />
            }
            // {
            //     path: 'timezone-settings',
            //     element: <TimezoneSettings />
            // },
            // {
            //     path: 'storage-CDN-settings',
            //     element: <StorageCDNSettings />
            // },
            // {
            //     path: 'website-settings',
            //     element: <WebsiteSettings />
            // }
        ]
    }
]

export default GeneralSettingsConfig;