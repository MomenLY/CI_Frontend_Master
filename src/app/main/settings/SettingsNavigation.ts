import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";


const SettingsNavigation: FuseNavItemType[] = [
    {
    id: 'general-settings',
    title: 'General Settings',
    type: 'group',
    children: [
        {
            id: 'basic-settings',
            title: 'Basic Settings',
            translate: 'Basic Settings',
            type: 'item',
            icon: 'material-outline:add_circle_outline',
            url: 'general-settings/basic-settings',
            disabled: false,
        },
        {
            id: 'profile-settings',
            title: 'Profile Settings',
            type: 'item',
            icon: 'material-outline:person',
            url: 'general-settings/profile-settings',
            disabled: false
        },
        {
            id: 'timezone-settings',
            title: 'Timezone Settings',
            type: 'item',
            icon: 'material-outline:access_time',
            url: 'general-settings/timezone-settings',
            disabled: false,
        },
        {
            id: 'storage-cdn',
            title: 'Storage CDN',
            type: 'item',
            icon: 'material-outline:memory',
            url: 'general-settings/storage-CDN-settings',
            disabled: true
        },
        {
            id: 'website-settings',
            title: 'Website Settings',
            type: 'item',
            icon: 'material-outline:web',
            url: 'general-settings/website-settings',
            disabled: false,
        }
    ]
},
{
    id: 'user-settings',
    title: 'User Settings',
    type: 'group',
    children: [
        {
            id: 'profile-field-settings',
            title: 'Profile Field Settings',
            type: 'item',
            icon: 'material-outline:ballot',
            url: 'user-settings/profile-field-settings',
            disabled: false
        },
        {
            id: 'role-management',
            title: 'Role Management',
            type: 'item',
            icon: 'heroicons-outline:clipboard-copy',
            url: 'user-settings/role-management',
            disabled: false
        },
        {
            id: 'add-admin',
            title: 'Add Admin',
            type: 'item',
            icon: 'material-outline:person_add_alt',
            url: 'user-settings/admin-management',
            disabled: false
        },
    ]
},
{
    id: 'platform-settings',
    title: 'Platform Settings',
    type: 'group',
    children: [
        {
            id: 'layout-settings',
            title: 'Layout Settings',
            type: 'item',
            icon: 'material-outline:view_quilt',
            url: 'platform-settings/layout-settings'
        },
        {
            id: 'login/signup-settings',
            title: 'Login/Sign up Settings',
            type: 'item',
            icon: 'material-outline:login',
            url: 'platform-settings/login-signup-settings',
            disabled: false
        },
        {
            id: 'category',
            title: 'Category',
            type: 'item',
            icon: 'material-outline:category',
            url: 'demo',
            disabled: true
        },
        {
            id: 'payment-settings',
            title: 'Payment Settings',
            type: 'item',
            icon: 'material-outline:payments',
            url: 'demo',
            disabled: true
        },
        {
            id: 'email-template',
            title: 'Email Template',
            type: 'item',
            icon: 'material-outline:email',
            url: 'demo',
            disabled: true
        },
        {
            id: 'password-settings',
            title: 'Password Settings',
            type: 'item',
            icon: 'material-outline:lock',
            url: 'platform-settings/password-settings'
        },
        {
            id: 'label-settings',
            title: 'Label Settings',
            type: 'item',
            icon: 'material-outline:beenhere',
            url: 'platform-settings/label-settings'
        },
        {
            id: 'masterdata-settings',
            title: 'Masterdata Settings',
            type: 'item',
            icon: 'material-outline:tune',
            url: 'demo',
            disabled: true
        },
    ]
},
{
    id: 'enquiry-settings',
    title: 'Enquiry Settings',
    type: 'group',
    children: [
        {
            id: 'enquiry-form-settings',
            title: 'Enquiry Form Settings',
            type: 'item',
            icon: 'heroicons-outline:document-search',
            url: 'demo',
            disabled: true
        },
    ]
},
{
    id: 'other-settings',
    title: 'Other Settings',
    type: 'group',
    children: [
        {
            id: 'support-settings',
            title: 'Support Settings',
            type: 'item',
            icon: 'material-outline:support',
            url: 'demo',
            disabled: true
        },
    ]
},
]
export default SettingsNavigation;