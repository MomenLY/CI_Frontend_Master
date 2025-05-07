import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";

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
    title: "Expo Managment",
    translate: "Expo Managment",
    type: "item",
    icon: "material-outline:email",
    url: "expo-management",
  },
  {
    id: "users",
    title: "Users",
    translate: "Users",
    type: "item",
    icon: "material-outline:contacts",
    url: "admin/users",
  },
  {
    id: "speaker",
    title: "Speaker",
    translate: "Speaker",
    type: "item",
    icon: "material-outline:contacts",
    url: "admin/accounts",
  },
  {
    id: "settings",
    title: "Settings",
    translate: "Settings",
    type: "item",
    icon: "material-outline:settings",
    url: "admin/settings",
  },
];

export default navigationConfig;
