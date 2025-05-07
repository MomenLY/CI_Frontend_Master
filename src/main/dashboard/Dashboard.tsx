import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import OnionFileUpload from '../../shared-components/onion-file-upload/OnionFileUpload';
import { useState } from 'react';
import OnionProgress from 'app/shared-components/onion-file-upload/utils/onion-progress/OnionProgress';
import { useAppDispatch } from 'app/store/hooks';
import { showProgress } from 'app/shared-components/onion-file-upload/utils/onion-progress/OnionProgressSlice';

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
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [progress, setProgress] = useState<any>(null)
	const [beginUpload, setBeginUpload] = useState<any>(false)

	const handleProgress = (progress: {}) => {


		setProgress(progress)
	};

	const handleUploadComplete = (result: { status: string; message: string; data: any }) => {

	};

	const handleFileSelect = (files: any) => {

		// dispatch(showProgress({files}))
	};

	const handleAllUploadComplete = () => {
		setBeginUpload(false);
	}

	const handleDefectiveFiles = (files) => {

	}

	return (
		<Root
			header={
				<div className="p-24">
					<h4>{t('Dashboard')}</h4>
				</div>
			}
			// content={
			// 	<>
			// 		<OnionFileUpload
			// 			id="first"
			// 			loader={true}
			// 			accept={""}
			// 			maxFileSize={2}
			// 			multiple={true}
			// 			autoUpload={false}
			// 			// reUpload={[]}
			// 			beginUpload={beginUpload}
			// 			buttonLabel={"Choose Image"}
			// 			buttonColor={"primary"}
			// 			targetUrl="http://192.168.1.99:3001/todos/upload"
			// 			onProgress={handleProgress}
			// 			onFileUploadComplete={handleUploadComplete}
			// 			onAllUploadComplete={handleAllUploadComplete}
			// 			onSelect={handleFileSelect}
			// 			onSelectingDefectiveFiles={handleDefectiveFiles}
			// 		/>
			// 		<br />-----------------------------------------------<br />
			// 		<OnionFileUpload
			// 			id="seconds"
			// 			loader={true}
			// 			accept={""}
			// 			maxFileSize={2}
			// 			multiple={true}
			// 			autoUpload={false}
			// 			// reUpload={[]}
			// 			beginUpload={beginUpload}
			// 			buttonLabel={"Choose Image"}
			// 			buttonColor={"primary"}
			// 			targetUrl="http://192.168.1.99:3001/todos/upload"
			// 			onProgress={handleProgress}
			// 			onFileUploadComplete={handleUploadComplete}
			// 			onAllUploadComplete={handleAllUploadComplete}
			// 			onSelect={handleFileSelect}
			// 			onSelectingDefectiveFiles={handleDefectiveFiles}
			// 		/>
			// 		<div className="p-24">
			// 			<button onClick={() => { setBeginUpload(true) }} style={{ marginTop: 40 }}>Upload Now</button>
			// 		</div>
			// 		<OnionProgress />
			// 	</>
			// }
		/>
	);
}

export default Dashboard;
