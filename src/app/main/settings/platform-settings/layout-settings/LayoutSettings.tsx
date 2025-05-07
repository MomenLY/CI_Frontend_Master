import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import LayoutSettingsContent from './LayoutSettingsContent';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function LayoutSettings() {
	return <Root content={<LayoutSettingsContent />} />;
}

export default LayoutSettings;
