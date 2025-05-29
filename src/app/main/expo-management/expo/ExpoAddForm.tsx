import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Controller, Form, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AddExpoAPI } from '../apis/Add-Expo-Api';
import { setState, useExpoDispatch, useExpoSelector } from '../ExpoManagementSlice';
import _ from 'lodash';
import SliderCSV from 'app/shared-components/components/SliderCSV';
import moment from 'moment';

const defaultValues = {
	expoName: '',
	expType: '',
	startDate: null,
	endDate: null,
	expoDesc: '',
	expLayoutId: 'layout_1',
};

type FieldTypeArray = {
	name: string;
	value: string;
};

type FormData = {
	expoName: string;
	expType: string;
	startDate: Date | null;
	endDate: Date | null;
	expoDesc: string;
	expLayoutId: string;
};

function ExpoAddForm() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { t } = useTranslation('expoManagement');
	const dispatchRefresh = useExpoDispatch();
	const state = useExpoSelector((state) => state.state.value);
	const schema = z.object({
		expoName: z.string()
			.min(1, 'expo_expoNameRequiredMessage')
			.max(50, 'expo_expoNameMaxLengthMessage')
			.refine(value => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value), 'expo_expoNameEmailInvalidMessage')
			.refine(value => !/^(ftp|http|https):\/\/[^ "]+$/.test(value), 'expo_expoNameUrlInvalidMessage')
			.refine(value => !/^\s/.test(value), 'expo_expoNameLeadingSpaceMessage')
			.refine(value => value.trim().length > 0, 'expo_expoNameSpacesOnlyMessage'),
		expType: z.string().min(1, 'expo_expoTypeRequiredMessage'),
		startDate: z.date()
			.refine((date) => date !== null, 'expo_expoStartDateRequiredMessage')
			.refine((date) => {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				return date >= today;
			}, {
				message: 'expo_expoStartDateCannotBePastMessage'
			}),

		endDate: z.date()
			.refine((date) => date !== null, 'expo_expoEndDateRequiredMessage'),
		expoDesc: z.string().min(1, 'expo_expoDescriptionRequiredMessage'),
		expLayoutId: z.enum(["layout_1", "layout_2", "layout_3", "layout_4", "layout_5", "layout_6", "layout_7", "layout_8"]),
	}).superRefine((data, ctx) => {
		if (data.startDate > data.endDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'expo_expoEndValidation',
				path: ['endDate'],
			});
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'expo_expoStartValidation',
				path: ['startDate'],
			});
		}
	});


	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { control, formState, handleSubmit, getValues, setValue, watch, trigger, reset } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema),
	});

	const expoTyepWatch = watch('expType');
	const expoLayoutWatch = watch('expLayoutId')

	const adjustDateTimes = (startDate: Date | null, endDate: Date | null) => {
		if (startDate) {
			startDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
		}
		if (endDate) {
			endDate.setHours(23, 59, 59, 999); // Set time to 23:59:59
		}
		return { startDate, endDate };
	};
	const { isValid, dirtyFields, errors } = formState;
	const expoType: FieldTypeArray[] = [
		{ name: t('expo_addExpo_online'), value: 'Online' },
		{ name: t('expo_addExpo_offline'), value: 'Offline' },
		{ name: t('expo_addExpo_hybrid'), value: 'Hybrid' },
	];

	const onSubmit = async (formData: FormData) => {
		const { startDate, endDate } = adjustDateTimes(formData.startDate, formData.endDate);
		if (formData.endDate < formData.startDate) {
			dispatch(showMessage({ message: 'End date must be after start date', variant: 'error' })); return;
		}

		setIsLoading(true)
		try {
			const payload = {
				expName: formData?.expoName,
				expStartDate: formData.startDate,
				expEndDate: formData.endDate,
				expDescription: formData?.expoDesc,
				expType: formData?.expType,
				expLayoutId: formData?.expLayoutId,
				expRegistrationStartDate: new Date(),
				expRegistrationEndDate: formData.startDate
			};
			const response = await AddExpoAPI(payload);
			if (response?.statusCode === 201) {
				dispatchRefresh(setState(!state));
				setIsLoading(false);
				dispatch(showMessage({ message: `${t('expo_addExpo_successMessage')}`, variant: 'success' }));
				reset(defaultValues);
				navigate(-1);
				setTimeout(() => {
					navigate(`/admin/expo-management/expo/${response.data.data[0].id}/manage/agenda`);
				}, 100);
			} else {
				dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
				setIsLoading((prev) => !prev)
			}
		} catch (err) {
			setIsLoading(false);
			const errorMessage = err?.response?.data?.message;
			if (errorMessage) {
				dispatch(showMessage({ message: errorMessage || 'Server error', variant: 'error' }));
			}
		}
	};

	const shouldEnableSaveButton = () => {
		const { expoName, expType, startDate, endDate, expoDesc } = getValues();
		if (!expoDesc || !expoName || !expType || !startDate || !endDate) {
			return false;
		}
		return true;
	};

	const shouldDisableDate = (date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date < today;
	};

	const startDate = watch('startDate');

	return (
		<OnionSidebar
			title={t('expo_addExpo_title')}
			exitEndpoint={-1}
			sidebarWidth="small"
			footer={true}
			footerButtonClick={handleSubmit(onSubmit)}
			footerButtonLabel={t('common_submit')}
			footerButtonSize="full"
			footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
			isFooterButtonLoading={isLoading}
		>
			<OnionSubHeader title={t('expo_eventInfo_title')} subTitle={t('expo_eventInfo_subtitle')} />
			<form
				name="ExpoAddForm"
				noValidate
				spellCheck={false}
				className="mt-20 flex flex-col justify-center space-y-20"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Controller
					name="expoName"
					control={control}
					render={({ field }) => (
						<TextField
							sx={{
								'& .MuiOutlinedInput-notchedOutline': {
									borderWidth: '2px',
								},
							}}
							{...field}
							label={t('expo_expoName')}
							autoFocus
							required
							type="expoName"
							error={!!errors.expoName}
							helperText={t(errors?.expoName?.message)}
							variant="outlined"
							fullWidth
						/>
					)}
				/>
				<OnionSubHeader title={t("expo_type_title")}
					subTitle={t("expo_type_subTitle")} />
				<Controller
					name="expType"
					control={control}
					render={({ field }) => (
						<FormControl fullWidth error={!!errors.expType}>
							<InputLabel id="expType-label">{t('expo_expoType')}</InputLabel>
							<Select
								labelId="expType-label"
								id="expType"
								sx={{
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: '2px',
									},
								}}
								{...field}
								label={t('expo_expoType')}
							>
								<MenuItem value="">Select</MenuItem>
								{expoType.map((type) => (

									<MenuItem key={type.value} value={type.value}>
										{type.name}
									</MenuItem>
								))}
							</Select>
							{errors.expType && <FormHelperText>{t(errors.expType.message)}</FormHelperText>}
						</FormControl>
					)}
				/>
				<div className={expoTyepWatch === 'Offline' ? 'hidden' : ''}>
					<SliderCSV control={control}
						setValue={setValue} />
				</div>

				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<Controller
						name="startDate"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								sx={{
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: '2px',
									},
									'& .MuiSvgIcon-root': {
										color: '#6F43D6',
									},
								}}
								label={t('expo_startDate')}
								slotProps={{
									textField: {
										helperText: t(errors?.startDate?.message),
										error: !!errors.startDate,
										type: 'startDate',
										required: true,
										variant: 'outlined',
										fullWidth: true,
									},
								}}
								value={value || null}
								onChange={onChange}
								shouldDisableDate={shouldDisableDate}
							/>
						)}
					/>
				</LocalizationProvider>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<Controller
						name="endDate"
						control={control}
						render={({ field: { onChange, value } }) => (
							<DatePicker
								sx={{
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: '2px',
									},
									'& .MuiSvgIcon-root': {
										color: '#6F43D6',
									},
								}}
								label={t('expo_endDate')}
								slotProps={{
									textField: {
										helperText: t(errors?.endDate?.message),
										error: !!errors.endDate,
										type: 'endDate',
										required: true,
										variant: 'outlined',
										fullWidth: true,
									},
								}}
								value={value || null}
								minDate={startDate || new Date()}
								defaultCalendarMonth={getValues('startDate')}
								onChange={onChange}
								shouldDisableDate={shouldDisableDate}
							/>
						)}
					/>
				</LocalizationProvider>
				<Controller
					name="expoDesc"
					control={control}
					render={({ field }) => (
						<FormControl>
							<TextField
								sx={{
									'& .MuiOutlinedInput-notchedOutline': {
										borderWidth: '2px',
									},
								}}
								{...field}
								id="outlined-basic"
								multiline
								label={t('expo_expoDesc')}
								rows={6}
								required
								error={!!errors.expoDesc}
								helperText={t(errors?.expoDesc?.message)}
								variant="outlined"
								placeholder={t('expo_placeHolder')}
							/>
						</FormControl>
					)}
				/>
			</form>
		</OnionSidebar>
	);
}

export default ExpoAddForm;
