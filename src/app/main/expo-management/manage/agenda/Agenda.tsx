import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import AgendaSidebarContent from './AgendaSidebarContent';
import AgendaHeader from './AgendaHeader';
import AgendaContent from './AgendaContent';
import { useTranslation } from 'react-i18next';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import { Button } from '@mui/material';
import { UpdateExpoAPI } from '../../apis/Update-Expo-Api';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import { useDispatch } from 'react-redux';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { setState, useAgendaDispatch, useAgendaSelector } from './AgendaSlice';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 0,
		// borderStyle: 'solid',
		// borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

type ExpoDetails = {
	expStatus: boolean;
	expCode: string;
}

function Agenda() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const routeParams = useParams();
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const [userRules, setUserRules] = useState({});
	const { t } = useTranslation('agenda');
	const dispatch = useDispatch()
	const dispatchRefresh = useAgendaDispatch();
	const state = useAgendaSelector((state) => state.state.value);
	const [expoPublish, setExpoPublish] = useState<boolean | null>(true);

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

	const [isMismatch, setMismatch] = useState(false);
	const [expoDetails, setExpoDetails] = useState<ExpoDetails | null>(null);
	const [priority, setPriority] = useState('');
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
			const schedules = expoDetails.data.schedules;
			const expStartDate = expos.expStartDate;
			const expEndDate = expos.expEndDate;
			setExpoPublish(expos.expStatus);
			let mismatch = false;
			if (schedules.length > 0) {
				schedules.forEach((schedule) => {
					if (new Date(expStartDate) > new Date(schedule.schStartDateTime) || new Date(expEndDate) < new Date(schedule.schEndDateTime)) {
						mismatch = true;
					}
				});
			}

			setMismatch(mismatch);
			setExpoDetails(expos);
		}
	};

	const handlePublish = () => {
		dispatch(openDialog({
			children: (
				<OnionConfirmBox
					confirmButtonLabel={expoDetails.expStatus === false ? t('agenda_publishExpo_confirmButton') : t('agenda_unpublishExpo_confirmButton')}
					cancelButtonLabel={t('common_cancel')}
					title={expoDetails.expStatus === false ? t('agenda_publishExpo_confirmTitle') : t('agenda_unpublishExpo_confirmTitle')}
					subTitle={expoDetails.expStatus === false ? t('agenda_publishExpo_confirmMessage') : t('agenda_unpublishExpo_confirmMessage')}
					onCancel={() => dispatch(closeDialog())}
					onConfirm={() => {
						confirmExpoStatusChange(routeParams.id, expoDetails.expCode, expoDetails.expStatus);
						dispatch(closeDialog());
					}}
					{...(expoDetails.expStatus === false) && { variant: 'warning' }}
				/>
			),
		}))
	}

	const confirmExpoStatusChange = async (id: string, expoCode: string, expoStatus: boolean) => {
		try {
			const payload = {
				id: id,
				expCode: expoCode,
				expStatus: true,
			}
			const response = await UpdateExpoAPI(payload);
			if (response.status === 200) {
				setExpoPublish(true);
				dispatchRefresh(setState(!state));
				dispatch(showMessage({ message: `${t('agenda_updateExpo_successMessage')}`, variant: 'success' }));
				await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + routeParams.id);
			}
		} catch (e) {
			const errorMessage = e?.response?.data?.message;
			if (errorMessage) {
				dispatch(showMessage({ message: errorMessage || 'Server error', variant: 'error' }));
			}
		}

	}

	return (
		<Root

			content={
				<div className="flex flex-col w-full">


					{isMismatch && (
						<div className='misMatchArea'>
							<h5 className='m-0 ms-16'>{t('agenda_dateMismatch')}</h5>
						</div>
					)}
					{!isMismatch && !expoPublish && (
						<div className='unpublish'>
							<h5 className='mt-8 ms-16'>{t('agenda_unpublish_alert')}</h5>
							<Button className="buttonClass text-center" onClick={handlePublish}>{t('agenda_Publish')}</Button>
						</div>
					)}
					<div className="p-[26px] pb-[15px]">
						<AgendaHeader heading='Expo Agenda' rules={userRules} />
					</div>

					<div className="w-full h-full container flex flex-col pt-[10px] p-[26px]">
						<AgendaContent isMismatch={isMismatch} />
					</div>
				</div>
			}
			rightSidebarContent={<AgendaSidebarContent />}
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

export default Agenda;
