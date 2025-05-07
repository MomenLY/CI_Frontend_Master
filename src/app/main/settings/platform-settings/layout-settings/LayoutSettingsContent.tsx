import { Button, CircularProgress } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { Controller, useForm } from 'react-hook-form';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useDebounce } from '@fuse/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LayoutCard from './LayoutCard';
import PlatformHeader from '../PlatformHeader';
import Header from './Header';
import { LayoutUpdateAPI } from './apis/Layout-Update-Api';
import { SettingsApi } from '../../SettingsApi';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';

const defaultValues = {
	layout: 'layout1'
};

type FormData = {
	layout: string;
};

function LayoutSettingsContent() {
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [prevData, setPrevData] = useState<FormData>();
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { control, handleSubmit, setValue } = useForm({
		mode: 'onChange',
		defaultValues
	});

	const getLayoutData = async () => {
		const layoutData = await SettingsApi({ settingsKey: 'layout' });

		if (layoutData) {
			setPrevData(layoutData);
		}
	};

	useEffect(() => {
		getLayoutData();
	}, []);

	useEffect(() => {
		if (prevData) {
			setValue('layout', `${prevData.layout}`);
		}
	}, [prevData]);

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: `${t('layoutSettingsUpdated')}`, variant: 'success' }));
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formdata: FormData) => {
		const { layout } = formdata;
		setIsLoading((prev) => !prev);
		try {
			const response = await LayoutUpdateAPI({ layout });
			const result = response?.data;

			if (result) {
				handleUpdate();
			}
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;

			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || `${t('settingsNotFound')}`, variant: 'error' }));
			}
			setIsLoading((prev) => !prev);
		}
	};

	return (
		<OnionPageOverlay>
			<PlatformHeader
				title={t('layoutSettings')}
				subTitle={t('layoutSettings')}
			/>
			<form
				name="platformSettingsForm"
				noValidate
				className="mt-10 flex w-full flex-col justify-center"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Header
					label={""}
					content={t('menuLayoutSettingsHelperText')}
				/>
				<Controller
					name="layout"
					control={control}
					render={({ field }) => (
						<FormControl className="mt-20 mb-10 w-full ">
							<RadioGroup
								className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
								aria-labelledby="demo-row-radio-buttons-group-label"
								name="row-radio-buttons-group"
								{...field}
							>
								<LayoutCard
									imgUrl="assets/images/layouts/layout1.svg"
									label={t('layout1HelperText')}
								>
									<FormControlLabel
										value="layout1"
										control={<Radio />}
										label={`${t('layout')} 1`}
									/>
								</LayoutCard>
								<LayoutCard
									imgUrl="assets/images/layouts/layout2.svg"
									label={t('layout2HelperText')}
								>
									<FormControlLabel
										value="layout2"
										control={<Radio />}
										label={`${t('layout')} 2`}
									/>
								</LayoutCard>
								<LayoutCard
									imgUrl="assets/images/layouts/layout3.svg"
									label={t('layout3HelperText')}
								>
									<FormControlLabel
										value="layout3"
										control={<Radio />}
										label={`${t('layout')} 3`}
									/>
								</LayoutCard>
							</RadioGroup>
						</FormControl>
					)}
				/>
				<div className="flex md:w-1/2 justify-end mt-16 ">
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						disabled={isLoading}
					>
						{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("save")}
					</Button>
				</div>
			</form>
		</OnionPageOverlay>
	);
}

export default LayoutSettingsContent;
