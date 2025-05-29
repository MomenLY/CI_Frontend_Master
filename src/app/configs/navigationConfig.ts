import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";
import { useTranslation } from "react-i18next";

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    translate: "Dashboard",
    type: "item",
    icon: "material-outline:dashboard",
    url: "admin/dashboard",
  },
  {
    id: "expo-management",
    title: "Expo Management",
    translate: "ExpoManagement",
    type: "item",
    icon: 'material-outline:festival',
    url: "admin/expo-management",
  },
  {
    id: "settings",
    title: "Settings",
    translate: "Settings",
    type: "item",
    icon: 'material-outline:settings',
    url: "admin/settings",
  },
];

export default navigationConfig;