import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectFuseCurrentSettings, setDefaultSettings } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import _ from '@lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { navbarToggle, navbarToggleMobile } from './navbarSlice';

type NavbarToggleButtonProps = {
	className?: string;
	children?: React.ReactNode;
};

/**
 * The navbar toggle button.
 */
function NavbarToggleButton(props: NavbarToggleButtonProps) {
	const {
		className = '',
		children = (
			<FuseSvgIcon
				size={20}
				color="action"
			>
				material-outline:dehaze
			</FuseSvgIcon>
		)
	} = props;

	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const settings: FuseSettingsConfigType = useAppSelector(selectFuseCurrentSettings);
	const { config } = settings.layout;

	return (
		<IconButton
			className={className}
			color="inherit"
			size="small"
			onClick={() => {
				if (isMobile) {
					dispatch(navbarToggleMobile());
				} else if (config?.navbar?.style === 'style-2') {
					dispatch(
						setDefaultSettings(
							_.set({}, 'layout.config.navbar.folded', !settings?.layout?.config?.navbar?.folded)
						)
					);
				} else {
					dispatch(navbarToggle());
				}
			}}
		>
			{children}
		</IconButton>
	);
}

export default NavbarToggleButton;
