import { amber, blue, green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { hideMessage, selectFuseMessageOptions, selectFuseMessageState } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import FuseSvgIcon from '../FuseSvgIcon';

export type FuseMessageVariantType = 'success' | 'error' | 'warning' | 'info';

type StyledSnackbarProps = {
	variant?: FuseMessageVariantType;
};

const StyledSnackbar = styled(Snackbar)<StyledSnackbarProps>(({ theme, variant }) => ({
	'& .FuseMessage-content': {
		...(variant === 'success' && {
			backgroundColor: green[600],
			color: '#FFFFFF',
		}),

		...(variant === 'error' && {
			backgroundColor: theme.palette.error.dark,
			color: theme.palette.getContrastText(theme.palette.error.dark),
		}),

		...(variant === 'info' && {
			backgroundColor: blue[600],
			color: '#FFFFFF',
		}),

		...(variant === 'warning' && {
			backgroundColor: amber[600],
			color: '#FFFFFF'
		})
	}
}));

const variantIcon = {
	success: 'check_circle',
	warning: 'warning',
	error: 'error_outline',
	info: 'info'
};

const variantAutoHide = {
	success: 5000,
	warning: 10000,
	error: 10000,
	info: 5000
}

const variantAutoAnchor = {
	success: {
		vertical: "bottom",
		horizontal: 'center'
	},
	warning: {
		vertical: 'top',
		horizontal: 'center'
	},
	error: {
		vertical: 'top',
		horizontal: 'center'
	},
	info: {
		vertical: 'bottom',
		horizontal: 'center'
	},
}

/**
 * FuseMessage
 * The FuseMessage component holds a snackbar that is capable of displaying message with 4 different variant. It uses the @mui/material React packages to create the components.
 */
function FuseMessage() {
	const dispatch = useAppDispatch();
	const state = useAppSelector(selectFuseMessageState);
	const options = useAppSelector(selectFuseMessageOptions);

	return (
		<StyledSnackbar
			{...options}
			open={state}
			onClose={() => dispatch(hideMessage())}
			autoHideDuration={variantAutoHide[options.variant]}
			sx={{ zIndex: 10000 }}
			anchorOrigin={variantAutoAnchor[options.variant]}
		>
			<SnackbarContent
				className="FuseMessage-content"
				message={
					<div className="flex items-center">
						{variantIcon[options.variant] && (
							<FuseSvgIcon color="inherit">{variantIcon[options.variant]}</FuseSvgIcon>
						)}
						<Typography className="mx-8" dangerouslySetInnerHTML={{ __html: options.message }} />
					</div>
				}
				action={[
					<IconButton
						key="close"
						aria-label="Close"
						color="inherit"
						onClick={() => dispatch(hideMessage())}
						size="large"
					>
						<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
					</IconButton>
				]}
			/>
		</StyledSnackbar>
	);
}

export default memo(FuseMessage);
