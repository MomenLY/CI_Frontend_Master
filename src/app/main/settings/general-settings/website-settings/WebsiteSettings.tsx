import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import WebsiteSettingsContent from './WebsiteSettingsContent';


const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function WebsiteSettings() {
	return <Root content={<WebsiteSettingsContent />} />;
}

export default WebsiteSettings;
