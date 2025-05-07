import FuseNavigation from '@fuse/core/FuseNavigation';
import FuseSuspense from '@fuse/core/FuseSuspense';
import { styled } from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useThemeMediaQuery } from '@fuse/hooks';
import { Outlet, useLocation } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import ExpoNavigation from './ExpoNavigation';
import ExpoHeader from './ExpoHeader';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function ExpoPageLayout() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
	const location = useLocation();

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) {
			setLeftSidebarOpen(false);
		}
	}, [location, isMobile]);

	return (
		<Root
			header={
			     isMobile ? <ExpoHeader
					leftSidebarToggle={() => {
						setLeftSidebarOpen(!leftSidebarOpen);
					}}
				/>: <></>
			}
			content={
				<div className=" max-w-full min-h-full flex flex-auto flex-col">
					<div className="flex flex-col flex-1 relative">
						<FuseSuspense>
							<Outlet />
						</FuseSuspense>
					</div>
				</div>
			}
			leftSidebarContent={
				<div className="px-16">
					<FuseNavigation
						className={clsx('navigation')}
						navigation={ExpoNavigation}
					/>
				</div>
			}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarWidth={288}
			leftSidebarOnClose={() => {
				setLeftSidebarOpen(false);
			}}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default ExpoPageLayout;
