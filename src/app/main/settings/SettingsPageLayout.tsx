import FuseNavigation from '@fuse/core/FuseNavigation';
import FuseSuspense from '@fuse/core/FuseSuspense';
import { styled } from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useThemeMediaQuery } from '@fuse/hooks';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import SettingsHeader from './SettingsHeader';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import { useTranslation } from 'react-i18next';
import LocalCache from 'src/utils/localCache';
import { getSettings, getUserSession } from 'app/shared-components/cache/cacheCallbacks';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function SettingsPageLayout() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
	const location = useLocation();
	const { t } = useTranslation();
	const navigate = useNavigate();

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) {
			setLeftSidebarOpen(false);
		}
	}, [location, isMobile]);

	useEffect(() => {
		checkRole()
	}, [])

	const checkRole = async () => {
		const userDetails = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
		const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
		// const boothManagerRoleId = settings?.boothManagerRoleId;
		const boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
		const speakerRoleId = settings?.speakerRoleId;
		if (userDetails.roleId === boothManagerRoleId || userDetails.roleId === speakerRoleId) {
			navigate('/dashboard');
		}
	}

	const SettingsNavigation: FuseNavItemType[] = [
		{
			id: 'general-settings',
			title: t('general_Settings'),
			type: 'group',
			children: [
				{
					id: 'basic-settings',
					title: t('basic_Settings'),
					translate: 'Basic Settings',
					type: 'item',
					icon: 'material-outline:add_circle_outline',
					url: 'general-settings/basic-settings',
					disabled: false,
				},
				{
					id: 'profile-settings',
					title: t('profile_Settings'),
					type: 'item',
					icon: 'material-outline:person',
					url: 'general-settings/profile-settings',
					disabled: false
				},
				// {
				// 	id: 'reset password',
				// 	title: t('reset_Password'),
				// 	type: 'item',
				// 	icon: 'material-outline:lock',
				// 	url: 'general-settings/reset-password',
				// 	disabled: false
				// }
				// {
				//     id: 'timezone-settings',
				//     title: 'Timezone Settings',
				//     type: 'item',
				//     icon: 'material-outline:access_time',
				//     url: 'general-settings/timezone-settings',
				//     disabled: false,
				// },
				// {
				//     id: 'storage-cdn',
				//     title: 'Storage CDN',
				//     type: 'item',
				//     icon: 'material-outline:memory',
				//     url: 'general-settings/storage-CDN-settings',
				//     disabled: true
				// },
				// {
				//     id: 'website-settings',
				//     title: 'Website Settings',
				//     type: 'item',
				//     icon: 'material-outline:web',
				//     url: 'general-settings/website-settings',
				//     disabled: false,
				// }
			]
		},
		{
			id: 'user-settings',
			title: t('user_Settings'),
			type: 'group',
			children: [
				// {
				//     id: 'profile-field-settings',
				//     title: 'Profile Field Settings',
				//     type: 'item',
				//     icon: 'material-outline:ballot',
				//     url: 'user-settings/profile-field-settings',
				//     disabled: false
				// },
				{
					id: 'role-management',
					title: t('role_Management'),
					type: 'item',
					icon: 'heroicons-outline:clipboard-copy',
					url: 'user-settings/role-management',
					disabled: false
				},
				{
					id: 'add-admin',
					title: t('add_Admin'),
					type: 'item',
					icon: 'material-outline:person_add_alt',
					url: 'user-settings/admin-management',
					disabled: false
				},
			]
		},
		// {
		//     id: 'platform-settings',
		//     title: 'Platform Settings',
		//     type: 'group',
		//     children: [
		//         // {
		//         //     id: 'layout-settings',
		//         //     title: 'Layout Settings',
		//         //     type: 'item',
		//         //     icon: 'material-outline:view_quilt',
		//         //     url: 'platform-settings/layout-settings'
		//         // },
		//         {
		//             id: 'login/signup-settings',
		//             title: 'Login/Sign up Settings',
		//             type: 'item',
		//             icon: 'material-outline:login',
		//             url: 'platform-settings/login-signup-settings',
		//             disabled: false
		//         },
		//         // {
		//         //     id: 'category',
		//         //     title: 'Category',
		//         //     type: 'item',
		//         //     icon: 'material-outline:category',
		//         //     url: 'demo',
		//         //     disabled: true
		//         // },
		//         // {
		//         //     id: 'payment-settings',
		//         //     title: 'Payment Settings',
		//         //     type: 'item',
		//         //     icon: 'material-outline:payments',
		//         //     url: 'demo',
		//         //     disabled: true
		//         // },
		//         // {
		//         //     id: 'email-template',
		//         //     title: 'Email Template',
		//         //     type: 'item',
		//         //     icon: 'material-outline:email',
		//         //     url: 'demo',
		//         //     disabled: true
		//         // },
		//         // {
		//         //     id: 'password-settings',
		//         //     title: 'Password Settings',
		//         //     type: 'item',
		//         //     icon: 'material-outline:lock',
		//         //     url: 'platform-settings/password-settings'
		//         // },
		//         {
		//             id: 'label-settings',
		//             title: 'Label Settings',
		//             type: 'item',
		//             icon: 'material-outline:beenhere',
		//             url: 'platform-settings/label-settings'
		//         },
		//         // {
		//         //     id: 'masterdata-settings',
		//         //     title: 'Masterdata Settings',
		//         //     type: 'item',
		//         //     icon: 'material-outline:tune',
		//         //     url: 'demo',
		//         //     disabled: true
		//         // },
		//     ]
		// },
		// {
		//     id: 'enquiry-settings',
		//     title: 'Enquiry Settings',
		//     type: 'group',
		//     children: [
		//         {
		//             id: 'enquiry-form-settings',
		//             title: 'Enquiry Form Settings',
		//             type: 'item',
		//             icon: 'heroicons-outline:document-search',
		//             url: 'demo',
		//             disabled: true
		//         },
		//     ]
		// },
		// {
		//     id: 'other-settings',
		//     title: 'Other Settings',
		//     type: 'group',
		//     children: [
		//         {
		//             id: 'support-settings',
		//             title: 'Support Settings',
		//             type: 'item',
		//             icon: 'material-outline:support',
		//             url: 'demo',
		//             disabled: true
		//         },
		//     ]
		// },
	]

	return (
		<Root
			header={
				isMobile ? <SettingsHeader
					leftSidebarToggle={() => {
						setLeftSidebarOpen(!leftSidebarOpen);
					}}
				/> : <></>
			}
			content={
				<div className=" max-w-full min-h-full flex flex-auto flex-col">
					<div className="flex flex-col flex-1 relative">
						<FuseSuspense>
							<Outlet />
						</FuseSuspense>
					</div>
				</div>
			}
			leftSidebarContent={
				<div className="px-[16px] py-[28px] min-h-sm">
					<FuseNavigation
						className={clsx('navigation')}
						navigation={SettingsNavigation}
					/>
				</div>
			}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarWidth={288}
			leftSidebarOnClose={() => {
				setLeftSidebarOpen(false);
			}}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default SettingsPageLayout;
