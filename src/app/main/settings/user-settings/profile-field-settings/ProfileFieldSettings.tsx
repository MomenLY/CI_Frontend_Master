import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import ProfileFieldSettingsContent from './ProfileFieldSettingsContent';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ProfileFieldSidebarContent from './ProfileFieldSidebarContent';


const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));


function ProfileFieldSettings() {
	const navigate = useNavigate();
	const routeParams = useParams();

	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

	useEffect(() => {
		setRightSidebarOpen(Boolean(routeParams.id));
	}, [routeParams]);

	return <Root
		content={<ProfileFieldSettingsContent />}
		rightSidebarContent={<ProfileFieldSidebarContent />}
		rightSidebarOpen={rightSidebarOpen}
		rightSidebarOnClose={() => {
			setRightSidebarOpen(false);
			navigate('/admin/settings/user-settings/profile-field-settings');
		}
		}
		rightSidebarWidth={360}
		rightSidebarVariant="temporary"
	/>;
}

export default ProfileFieldSettings;
