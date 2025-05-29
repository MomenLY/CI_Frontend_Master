import { motion } from 'framer-motion';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Widget from './Widget';
import Typography from '@mui/material/Typography';
import DashboardContent from './DashboardContent';


const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		// backgroundColor: theme.palette.background.paper,
		// borderBottomWidth: 1,
		// borderStyle: 'solid',
		// borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Dashboard() {
	const { t } = useTranslation('dashboard');

	return (
		<Root
			header={
				<div className="grid grid-cols-1  gap-24 w-full min-w-0 p-24">
					<div className="w-full mt-16 sm:col-span-3">
						<Typography className="text-2xl font-semibold tracking-tight leading-6 mb-8" >
							{t('dashboard_expo_header')}
						</Typography>
						<Typography
							className="font-medium tracking-tight"
							color="text.secondary"
						>
							{t('dashboard_expo_discription')}
						</Typography>
					</div>
				</div>
			}
			content={
				<DashboardContent />
			}
		/>
	);
}

export default Dashboard;