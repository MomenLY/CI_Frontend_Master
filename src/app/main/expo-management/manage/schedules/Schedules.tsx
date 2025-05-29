import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import SchedulesHeader from './SchedulesHeader';
import SchedulesSidebarContent from './SchedulesSidebarContent';
import SchedulesTable from './SchedulesTable';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 0,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Schedules() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const routeParams = useParams();
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const [userRules, setUserRules] = useState({});
	const [expoId, setExpoId] = useState('');

	useEffect(() => {
		const init = async () => {
			const userRules = await getModuleAccessRules('users');
			setUserRules(userRules.access);
		}
		init();
	}, []);

	useEffect(() => {
		setRightSidebarOpen(location.pathname.includes('/edit') || location.pathname.includes('/new'));
	}, [routeParams]);


	return (
		<Root
			header={
				<div className="p-[26px] pb-[15px]">
					<SchedulesHeader keyword={keyword} setKeyword={setKeyword} rules={userRules} />
				</div>
			}

			content={
				<div className="w-full h-full container flex flex-col pt-[10px] p-[26px]">
					<SchedulesTable keyword={keyword} setKeyword={setKeyword} />
				</div>
			}
			rightSidebarContent={
				<SchedulesSidebarContent />}
			rightSidebarOpen={rightSidebarOpen}
			rightSidebarOnClose={() => {
				setRightSidebarOpen(false);
				navigate(-1)
			}
			}
			rightSidebarWidth={1536}
			rightSidebarVariant="persistent"
		/>
	);
}

export default Schedules;
