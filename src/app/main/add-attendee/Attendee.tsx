import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import { useTranslation } from 'react-i18next';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import { Button, Typography } from '@mui/material';
import AttendeesForm from './AttendeesForm';
import AttendeeHeader from './AttendeesHeader';
import { getAttendeeCountAPI } from '../expo-management/manage/attendees/apis/Get-AttendeeCount-Api';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 0,
		// borderStyle: 'solid',
		// borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper,
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

type ExpoDetails = {
	expStatus: boolean
}

function Attendees() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const [userRules, setUserRules] = useState({});
	const { t } = useTranslation('attendees');
	const routeParams = useParams();
	const [expos, setExpos] = useState();
	const [attendeeCount, setAttendeeCount] = useState<number | 0>(0);
	const [expoMaxSeat, setExpoMaxSeat] = useState();
	const [expoDetails, setExpoDetails] = useState<ExpoDetails | null>(null);

	useEffect(() => {
		const init = async () => {
			const userRules = await getModuleAccessRules('users');
			setUserRules(userRules.access);
		}
		init();
	}, []);

	useEffect(() => {
	}, [])

	useEffect(() => {
		setRightSidebarOpen(location.pathname.includes('/edit') || location.pathname.includes('/new'));
	}, [routeParams]);

	useEffect(() => {
		getImportantDetails();
	}, []);

	const getImportantDetails = async () => {
		let expoDetails = await LocalCache.getItem(
			cacheIndex.expoDetails + "_" + routeParams.id,
			getSingleExpoAPI.bind(this, routeParams.id)
		);
		if (expoDetails.data) {
			const expos = expoDetails.data.expo;
			setExpoDetails(expos);
		}
	}

	return (
		<>
			<Root
				content={
					<div className="w-full flex flex-col py-[20px] px-[30px] lg:py-[32px] lg:px-[100px]">
						<div className="max-w-[767px]">
							<div className="mb-[28px]">
								<Typography
									color="text.primary"
									className="font-700 text-[22px] leading-[30px] md:text-[26px] md:leading-[36px] lg:text-[32px] lg:leading-[48px] block mb-0"
								>
									{t('addAttendees_heading')}
								</Typography>
							</div>
							<AttendeesForm />
						</div>
					</div>
				}
			/>
		</>
	);
}

export default Attendees;
