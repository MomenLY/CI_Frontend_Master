import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import ProfileSettingsContent from './ProfileSettingsContent';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function ProfileSettings() {
	return <Root content={<ProfileSettingsContent />} />;
}

export default ProfileSettings;
