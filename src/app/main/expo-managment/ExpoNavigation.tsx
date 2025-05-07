import { FuseNavItemType } from "@fuse/core/FuseNavigation/types/FuseNavItemType";


const ExpoNavigation: FuseNavItemType[] = [
    {
    id: 'manage',
    title: 'Manage',
    type: 'group',
    children: [
        {
            id: 'agenda',
            title: 'Agenda',
            translate: 'Agenda',
            type: 'item',
            icon: 'material-outline:view_agenda',
            url: 'general-settings/basic-settings',
            disabled: false,
        },
        {
            id: 'hall',
            title: 'Hall',
            type: 'item',
            icon: 'material-outline:person',
            url: 'manage/hall',
            disabled: false
        },
        {
            id: 'billboard',
            title: 'Billboard',
            type: 'item',
            icon: 'material-outline:access_time',
            url: 'general-settings/timezone-settings',
            disabled: false,
        },
        {
            id: 'booth',
            title: 'Booth',
            type: 'item',
            icon: 'material-outline:memory',
            url: 'general-settings/storage-CDN-settings',
            disabled: false
        },
        {
            id: 'schedule',
            title: 'Schedule',
            type: 'item',
            icon: 'material-outline:web',
            url: 'general-settings/website-settings',
            disabled: false,
        },
        {
            id: 'general',
            title: 'General',
            type: 'item',
            icon: 'material-outline:memory',
            url: 'manage/general',
            disabled: false
        },
        {
            id: 'registration',
            title: 'Registration',
            type: 'item',
            icon: 'material-outline:web',
            url: 'manage/registration',
            disabled: false,
        },
        {
            id: 'attendees',
            title: 'Attendees',
            type: 'item',
            icon: 'material-outline:web',
            url: 'general-settings/website-settings',
            disabled: false,
        }
    ]
}
]
export default ExpoNavigation