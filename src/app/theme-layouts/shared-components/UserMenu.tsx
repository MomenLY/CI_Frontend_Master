import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser, setUser } from 'src/app/auth/user/store/userSlice';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { darken } from '@mui/material/styles';
import { useAppSelector } from 'app/store/hooks';
import { useTranslation } from 'react-i18next';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { defaultUserImageUrl, userImageUrl } from 'src/utils/urlHelper';
import { userUpdateSelector } from 'src/app/main/settings/general-settings/profile-settings/ProfileSettingsSlice';
import { getUserSession } from 'app/shared-components/cache/cacheCallbacks';

/**
 * The user menu.
 */
function UserMenu() {
	// const user = useAppSelector(selectUser);
	const { t } = useTranslation();
	const { signOut } = useAuth();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
	const state = userUpdateSelector((state) => state.state.value)
	const [user, setUser] = useState<any>();

	const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	useEffect(() => {
		getUserDetails();
	}, [state]);

	const getUserDetails = async () => {
		const user = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
		if (user) {
			setUser(user);
		}
	}

	if (!user) {
		return null;
	}

	return (
		<>
			<Button
				className="min-h-40 min-w-40 p-0 md:px-16 md:py-6"
				onClick={userMenuClick}
				color="inherit"
			>
				<div className="mx-4 hidden flex-col items-end md:flex">
					<Typography
						component="span"
						className="flex font-semibold"
					>
						{user.data.displayName.length > 25 ? user.data.displayName.slice(0, 25) : user.data.displayName}
					</Typography>
					<Typography
						className="text-11 font-medium capitalize"
						color="text.secondary"
					>
						{user?.role?.toString()}
						{(!user.role || (Array.isArray(user?.role) && user?.role?.length === 0)) && 'Guest'}
					</Typography>
				</div>

				{(user && (user?.data.userImage === 'default.webp' || user?.data?.userImage === '' || user?.data?.userImage === null)) ? (
					<Avatar
						sx={{
							background: (theme) => darken(theme.palette.background.default, 0.05),
							color: (theme) => theme.palette.text.secondary
						}}
						className="md:mx-4"
					>
						{user?.data?.displayName ? user?.data?.displayName?.[0].toUpperCase() : 'U'}
					</Avatar>
				) : (
					<Avatar
						sx={{
							background: (theme) => darken(theme.palette.background.default, 0.05),
							color: (theme) => theme.palette.text.secondary
						}}
						className="md:mx-4"
						src={userImageUrl(user.data.userImage)}
					/>
				)}
			</Button>

			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-8'
				}}
			>
				{!user.role || user.role.length === 0 ? (
					<>
						<MenuItem
							component={Link}
							to="/sign-in"
							role="button"
						>
							<ListItemIcon className="min-w-40">
								<FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary={t('signIn')} />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/sign-up"
							role="button"
						>
							<ListItemIcon className="min-w-40">
								<FuseSvgIcon>heroicons-outline:user-add </FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary={t('signUp')} />
						</MenuItem>
					</>
				) : (
					<MenuItem
						onClick={() => {
							signOut();
						}}
					>
						<ListItemIcon className="min-w-40">
							<FuseSvgIcon>heroicons-outline:logout</FuseSvgIcon>
						</ListItemIcon>
						<ListItemText primary={t('signOut')} />
					</MenuItem>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;
