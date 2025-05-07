import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import IconButton from '@mui/material/IconButton';
import { Outlet } from 'react-router-dom';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { GlobalStyles } from '@mui/system';

export default function UsersSidebarContent() {
	return (
		<>
			<GlobalStyles
				styles={() => ({
					'#root': {
						maxHeight: '100vh'
					}
				})}
			/>

			<div className="flex flex-col max-w-full">
				<Outlet />
			</div>
			</>
	)
}
