import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import IconButton from '@mui/material/IconButton';
import { Outlet } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export default function ProfileFieldSidebarContent() {
	return (
		<div className="flex flex-col flex-auto">
			<Outlet />
		</div>
	)
}
