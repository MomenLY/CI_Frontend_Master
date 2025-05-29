import { Outlet } from 'react-router-dom';
import { GlobalStyles } from '@mui/system';

export default function AttendeesSidebarContent() {
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
