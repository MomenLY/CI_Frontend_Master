import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, TextField, Button, CircularProgress } from '@mui/material';
import { useAppDispatch } from 'app/store/hooks';
import { useDebounce } from '@fuse/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT } from './store/dateFormats';
import { TIMEZONE } from './store/timezones';
import Header from './Header';
import GeneralSettingsHeader from '../GeneralSettingsHeader';
import { TimezoneUpdateAPI } from './apis/Timezone-Update-Api';
import { SettingsApi } from '../../SettingsApi';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';

const defaultValues = {
	isUserEnabledToChoose: true,
	timezone: '',
	dateFormat: ''
};

type TimezoneType = {
	timezone: string;
	dateFormat: string;
	isUserEnabledToChoose: boolean;
};

function TimezoneSettingsContent() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [prevData, setPrevData] = useState<TimezoneType>();
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { control, handleSubmit, setValue } = useForm({
		mode: 'onChange',
		defaultValues
	});

	const getTimezoneData = async () => {
		const timezoneData = await SettingsApi({ settingsKey: 'timezone' })
		if (timezoneData) {
			setPrevData(timezoneData);
		};
	};

	useEffect(() => {
		getTimezoneData();
	}, [])

	useEffect(() => {
		if (prevData) {
			setValue('timezone', `${prevData?.timezone}` || 'Asia/Kolkata');
			setValue('dateFormat', `${prevData?.dateFormat}` || 'dd/mm/yyyy');
			setValue('isUserEnabledToChoose', prevData?.isUserEnabledToChoose || false)
		}
	}, [prevData])

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: `${t('timezoneSettingsUpdated')}`, variant: 'success' }));
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: TimezoneType) => {
		const { isUserEnabledToChoose, timezone, dateFormat } = formData;
		setIsLoading((prev) => !prev);
		const data = {
			isUserEnabledToChoose,
			timezone,
			dateFormat
		};
		try {
			const response = await TimezoneUpdateAPI(data);
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
			<GeneralSettingsHeader
				title={t('Timezone Settings')}
				subTitle={t('Timezone Settings')}
			/>
			<form
				name="basicSettingsForm"
				noValidate
				className="mt-10 flex w-full flex-col justify-center space-y-10"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Header
					label={""}
					content={t('TimezoneHelperText')}
				/>
				<Controller
					name="isUserEnabledToChoose"
					control={control}
					render={({ field: { onChange, value } }) => (
						<FormControl>
							<FormControlLabel
								control={<Checkbox checked={value} onChange={onChange} />}
								label={t('enableUserToChooseTheirTimezone')}
							/>
						</FormControl>
					)}
				/>
				<Controller
					name="timezone"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormGroup>
								<TextField
									id="outlined-select-currency"
									select
									className="md:w-1/3 sm:w-1/2 w-full mt-10"
									{...field}
								>
									{TIMEZONE.map((option) => (
										<MenuItem
											key={option.zone}
											value={option.zone}
										>
											{option.zone} {option.gmt}
										</MenuItem>
									))}
								</TextField>
							</FormGroup>
						</FormControl>
					)}
				/>
				<Controller
					name="dateFormat"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormGroup>
								<TextField
									id="outlined-select-currency"
									select
									className="md:w-1/3 sm:w-1/2 w-full mt-10"
									{...field}
								>
									{DATE_FORMAT.map((option) => (
										<MenuItem
											key={option.id}
											value={option.value}
										>
											{option.value}
										</MenuItem>
									))}
								</TextField>
							</FormGroup>
						</FormControl>
					)}
				/>
				<div className="flex md:w-2/3 justify-end mt-16 ">
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

export default TimezoneSettingsContent;
