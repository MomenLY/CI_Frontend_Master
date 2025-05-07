import {
	TextField,
	Typography,
	MenuItem,
	FormControlLabel,
	Checkbox,
	Select,
	ListItemText,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useEffect, useRef, useState } from 'react';
import { FormControl } from '@mui/base';
import { CreateFieldsAPI } from './apis/Create-Fields-Api';
import { OnionSwitch } from '../components/OnionSwitch';
import OnionSidebar from '../components/OnionSidebar';
import { DATATYPES } from './store/dataTypes';
import OnionDropdown from '../components/OnionDropdown';
import OnionSubHeader from '../components/OnionSubHeader';

const defaultValues = {
	pFLabel: '',
	pFPlaceholder: '',
	pFType: '',
	pFHelperText: '',
	pFValidation_type: '',
	pFValidation_regexPattern: '',
	pFValidation_errorMessage: '',
	pFRequired: false,
	pFData: '',
	pFStatus: true,
	pFUploadFileTypeParams: [],
	pFUploadmaxFileSizeParams: '500',
	pFMultiFileParams: true
};

type FeildTypeArray = {
	name: string;
	value: string;
};

type ValidationTypeArray = {
	name: string;
	value: string;
};

type FormData = {
	pFLabel: string;
	pFType: string;
	pFPlaceholder: string;
	pFHelperText: string;
	pFValidation_type: string;
	pFValidation_regexPattern: string;
	pFValidation_errorMessage: string;
	pFRequired: boolean;
	pFData: string;
	pFStatus: boolean;
	pFUploadmaxFileSizeParams: string;
	pFUploadFileTypeParams: any;
	pFMultiFileParams: boolean;
};

type FieldFormProps = {
	endPoint: string;
	exitEndpoint: string;
	type: string;
	onSubmitComplete?: (response: boolean) => void;
};

function OnionCustomFieldForm({ endPoint, exitEndpoint, type, onSubmitComplete }: FieldFormProps) {
	const { t } = useTranslation('dynamic-field-form');
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const formRef = useRef<HTMLFormElement>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const schema = z.object({
		pFLabel: z.string().nonempty(t('dynamicFieldForm_fieldLabel_errorMessage')).max(20, (t('dynamicFieldForm_placeholder_warning'))),
		pFType: z.string().nonempty(t('dynamicFieldForm_fieldLabel_errorMessage')),
		pFPlaceholder: z.string().max(20, (t('dynamicFieldForm_placeholder_warning'))).optional(),
		pFHelperText: z.string().optional(),
		pFValidation_type: z.string().optional(),
		pFData: z.string().optional(),
		pFValidation_errorMessage: z.string().optional(),
		pFRequired: z.boolean(),
		pFStatus: z.boolean(),
		pFMultiFileParams: z.boolean(),
		pFUploadFileTypeParams: z.array(z.string()),
		pFUploadmaxFileSizeParams: z.string().refine((value) => parseFloat(value) > 0, {
			message: t('dynamicFieldForm_fileSize_errorMessage')
		}),
		pFValidation_regexPattern: z.string().refine(
			(val) => {
				if (!val) {
					return true;
				}

				try {
					new RegExp(val);
					return true;
				} catch (e) {
					return false;
				}
			},
			{
				message: t('dynamicFieldForm_regex/Pattern_errorMessage')
			}
		)
	});

	const { control, formState, handleSubmit, watch, getValues, setValue } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const fieldTypeArray: FeildTypeArray[] = [
		{ name: t('textField'), value: 'input' },
		{ name: t('dropdown'), value: 'select' },
		{ name: t('fileUploader'), value: 'file' },
		{ name: t('dateField'), value: 'date' },
		{ name: t('dateTime'), value: 'datetime' },
		{ name: t('phoneNumber'), value: 'phoneNumber' }
	];
	const validationTypeArray: ValidationTypeArray[] = [
		{ name: t('email'), value: 'email' },
		{ name: t('text'), value: 'text' },
		{ name: t('url'), value: 'url' },
		{ name: t('number'), value: 'number' },
		{ name: t('custom'), value: 'custom' }
	];

	const validationTypeArrayForDateTime: ValidationTypeArray[] = [
		{ name: t('any'), value: 'any' },
		{ name: t('futureDate'), value: 'futureDate' },
		{ name: t('pastDate'), value: 'pastDate' }
	];

	const { isValid, dirtyFields, errors } = formState;

	const watchFieldType = watch('pFType');
	const watchValidationType = watch('pFValidation_type');

	useEffect(() => {
		if (watch().pFType === 'date' || watch().pFType === 'time' || watch().pFType === 'datetime') {
			setValue('pFValidation_type', 'any');
		} else if (watch().pFType === 'phoneNumber') {
			setValue('pFValidation_type', 'number');
		} else {
			setValue('pFValidation_type', 'text');
		}

		setValue('pFValidation_regexPattern', '');
		setValue('pFValidation_regexPattern', '');

		if (watch().pFType === 'file') {
			setValue('pFUploadFileTypeParams', ['any']);
		}

		if (watch().pFType === 'date' || watch().pFType === 'datetime') {
			setValue('pFData', 'any');
		}
	}, [watch().pFType]);


	const onSubmit = async (formData: FormData) => {
		const data = formData;
		setIsLoading(true);

		// combining filetype and file size for upload params
		let pFUploadParams = {};
		pFUploadParams['fileType'] = data.pFUploadFileTypeParams
		pFUploadParams["maxFileSize"] = data.pFUploadmaxFileSizeParams;
		pFUploadParams['multiFile'] = data.pFMultiFileParams

		// split and convert to object for dropdown data-pFData
		const pFDataArray = data.pFData.split(',').filter((value) => value !== '');
		const pFData = {};
		pFDataArray.forEach((element) => {
			pFData[element] = element;
		});

		const pFDateTimeData = {
			dateTimeSettings: data.pFData
		}

		// final data for API
		let dataForAPI = {};
		dataForAPI = {
			pFLabel: data.pFLabel,
			pFType: data.pFType,
			pFFormType: type,
			pFPlaceholder: data.pFPlaceholder,
			pFHelperText: data.pFHelperText,
			pFRequired: data.pFRequired === true ? 1 : 0,
			pFStatus: data.pFStatus === true ? 1 : 0,
			pFValidation: {
				type: data.pFValidation_type,
				regexPattern: data.pFValidation_regexPattern,
				errorMessage: data.pFValidation_errorMessage
			}
		};

		if (data.pFType === 'select') {
			dataForAPI["pFData"] = pFData;
		}

		if (data.pFType === 'date' || data.pFType === 'datetime'){
			dataForAPI["pFData"] = pFDateTimeData;
		}

		if (data.pFType === 'file') {
			dataForAPI["pFUploadParams"] = pFUploadParams;
		}

		try {
			const fieldData = await CreateFieldsAPI({ data: dataForAPI, endPoint });

			if (fieldData?.statusCode === 201) {
				dispatch(showMessage({ message: t('dynamicFieldForm_fieldAdded_confirmMessage'), variant: 'success' }));
				navigate('/admin/settings/user-settings/profile-field-settings');
				setIsLoading(false);
				onSubmitComplete(true)
			} else {
				dispatch(showMessage({ message: `${t('somethingWentWrong')}`, variant: 'error' }));
				setIsLoading((prev) => !prev);
			}
		} catch (e) {
			setIsLoading(false);
		}
	};

	const shouldEnableSaveButton = () => {
		const {
			pFLabel,
			pFType,
			pFValidation_type,
			pFValidation_regexPattern,
			pFData,
			pFUploadFileTypeParams
		} = getValues();

		if (!pFLabel || !pFType) {
			return false;
		}

		if(pFLabel.length > 20){
			return false;
		}

		if (
			(pFType === 'input' && !pFValidation_type) ||
			(pFType === 'date' && !pFData) ||
			(pFType === 'time' && !pFData) ||
			(pFType === 'select' && !pFData) ||
			(pFType === 'file' && !pFUploadFileTypeParams) ||
			(pFType === 'datetime' && !pFData)
		) {
			return false;
		}

		if (pFType === 'file') {
			if (!pFUploadFileTypeParams[0]) {
				return false;
			}
		}

		if (pFValidation_type === 'custom' && !pFValidation_regexPattern) {
			return false;
		}

		return true;
	};

	return (
		<OnionSidebar
			title={t('dynamicFieldForm_title')}
			subTitle={t('dynamicFieldForm_title_message')}
			footer={true}
			footerButtonLabel={t('save')}
			footerButtonClick={handleSubmit(onSubmit)}
			footerButtonDisabled={!shouldEnableSaveButton() || isLoading}
			isFooterButtonLoading={isLoading}
			exitEndpoint={exitEndpoint}
			footerButtonSize='medium'
			sidebarWidth='small'
		>
			<form
				name="AddFieldForm"
				noValidate
				ref={formRef}
				spellCheck={false}
				className="mt-10 flex flex-col justify-center !space-y-24"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Controller
					name="pFLabel"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={t('dynamicFieldForm_fieldLabel')}
							autoFocus
							type="text"
							error={!!errors.pFLabel}
							helperText={errors?.pFLabel?.message}
							variant="outlined"
							fullWidth
							placeholder={t('dynamicFieldForm_fieldLabel_example')}
							InputLabelProps={{
								shrink: true
							}}
						/>
					)}
				/>
				<Controller
					name="pFType"
					control={control}
					render={({ field }) => (
						<OnionDropdown
							{...field}
							data={fieldTypeArray}
							label={t('dynamicFieldForm_fieldType')}
						/>
					)}
				/>
				{watchFieldType === 'select' && (
					<Controller
						control={control}
						name="pFData"
						render={({ field }) => (
							<TextField
								{...field}
								label={t('dynamicFieldForm_dropdownOptions')}
								multiline
								autoFocus
								type="text"
								error={!!errors.pFData}
								helperText={errors?.pFData?.message || t('dynamicFieldForm_dropdownValue_helperText')}
								variant="outlined"
								fullWidth
								InputLabelProps={{
									shrink: true
								}}
								placeholder={t('dynamicFieldForm_value_example')}
							/>
						)}
					/>
				)}
				{(watchFieldType === 'date' || watchFieldType === 'datetime') && (
					<>
						<OnionSubHeader title={t('dynamicFieldForm_dateType')} />
						<Controller
							name="pFData"
							control={control}
							render={({ field }) => (
								<OnionDropdown
									{...field}
									data={validationTypeArrayForDateTime}
									label={t('dynamicFieldForm_dateType')}
								/>
							)}
						/>
					</>
				)}
				{watchFieldType === 'file' && (
					<>
						<OnionSubHeader title={t('dynamicFieldForm_fileType')} />
						<Controller
							name="pFUploadFileTypeParams"
							control={control}
							render={({ field }) => (
								<>
									<Select
										multiple
										{...field}
										renderValue={(selected) => selected.includes('any') ? 'any' : selected.join(', ')}
										MenuProps={{ PaperProps: { sx: { maxHeight: "50%" } } }}
									>
										<MenuItem
											key={0}
											value={'any'}
											className='py-0'
										>
											<Checkbox checked={field.value.indexOf('any') > -1} />
											<ListItemText primary={'ANY'} />
										</MenuItem>
										{DATATYPES.map((data) => (
											<MenuItem
												key={data.id}
												value={data.fileValue}
												className='py-0'
												disabled={!(field.value.indexOf('any') < 0)}
											>
												<Checkbox checked={field.value.indexOf(data.fileValue) > -1} />
												<ListItemText primary={data.fileValue} />
											</MenuItem>
										))}
									</Select>
								</>
							)}
						/>
						<div>
							<div className="flex flex-row items-center justify-between mb-10">
								<div className='w-4/5'>
									<Typography color="text" className="font-semibold text-[13px] block mb-6">
										{t('dynamicFieldForm_multipleFileUpload')}
									</Typography>
									<Typography variant="caption" className="font-normal text-[11px] block">
										{t('dynamicFieldForm_multipleFile_message')}</Typography>
								</div>
								<div>
									<Controller
										name="pFMultiFileParams"
										control={control}
										render={({ field: { onChange, value } }) => (
											<FormControl>
												<OnionSwitch
													checked={value}
													onChange={onChange}
												/>
											</FormControl>
										)}
									/>
								</div>
							</div>
						</div>
						<Controller
							name="pFUploadmaxFileSizeParams"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={t('dynamicFieldForm_enterFileSizeinMB')}
									autoFocus
									type="number"
									error={!!errors.pFUploadmaxFileSizeParams}
									helperText={errors?.pFUploadmaxFileSizeParams?.message}
									variant="outlined"
									fullWidth
								/>
							)}
						/>
					</>
				)}
				<Controller
					name="pFPlaceholder"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={t('dynamicFieldForm_placeholder')}
							autoFocus
							type="text"
							error={!!errors.pFPlaceholder}
							helperText={errors?.pFPlaceholder?.message}
							variant="outlined"
							fullWidth
							InputLabelProps={{
								shrink: true
							}}
							placeholder={t('dynamicFieldForm_placeholder_example')}
						/>
					)}
				/>
				<Controller
					name="pFHelperText"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							id="outlined-basic"
							label={t('dynamicFieldForm_helperText')}
							variant="outlined"
							multiline
							rows={6}
							error={!!errors.pFHelperText}
							helperText={errors?.pFHelperText?.message}
							InputLabelProps={{
								shrink: true
							}}
							placeholder={t('dynamicFieldForm_helperText_example')}
						/>
					)}
				/>
				<div>
					<div className="flex flex-row items-center justify-between">
						<div className='w-4/5 py-16'>
							<Typography className="font-semibold text-[13px] block mb-6">
								{t('dynamicFieldForm_visibility')}
							</Typography>
							<Typography variant="caption" className="font-normal text-[11px] block">
								{t('dynamicFieldForm_visibility_message')}</Typography>
						</div>
						<div>
							<Controller
								name="pFStatus"
								control={control}
								render={({ field: { onChange, value } }) => (
									<FormControl>
										<OnionSwitch
											checked={value}
											onChange={onChange}
										/>
									</FormControl>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="mt-5 mb-10">
					<OnionSubHeader
						title={t('dynamicFieldForm_fieldValidation')}
						subTitle={t('dynamicFieldForm_fieldValidation_message')}
					/>
				</div>
				<Controller
					name="pFRequired"
					control={control}
					render={({ field: { onChange, value } }) => (
						<FormControl>
							<FormControlLabel
								control={
									<Checkbox
										checked={value}
										onChange={onChange}
									/>
								}
								label={t('dynamicFieldForm_validation_confirmMessage')}
							/>
						</FormControl>
					)}
				/>
				{watchFieldType === 'input' && (
					<Controller
						name="pFValidation_type"
						control={control}
						render={({ field }) => (
							<OnionDropdown
								{...field}
								label={t('dynamicFieldForm_validationType')}
								data={validationTypeArray}
							/>
						)}
					/>
				)}

				{watchValidationType === 'custom' && (
					<Controller
						name="pFValidation_regexPattern"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label={t('dynamicFieldForm_regex/Pattern')}
								autoFocus
								type="text"
								error={!!errors.pFValidation_regexPattern}
								helperText={errors?.pFValidation_regexPattern?.message}
								variant="outlined"
								fullWidth
								InputLabelProps={{
									shrink: true
								}}
								placeholder={t('dynamicFieldForm_regex/Pattern')}
							/>
						)}
					/>
				)}

				<Controller
					name="pFValidation_errorMessage"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							id="outlined-basic"
							label={t('dynamicFieldForm_errorMessage')}
							variant="outlined"
							multiline
							rows={6}
							error={!!errors.pFValidation_errorMessage}
							helperText={errors?.pFValidation_errorMessage?.message}
							InputLabelProps={{
								shrink: true
							}}
							placeholder={t('dynamicFieldForm_errorMessage_example')}
						/>
					)}
				/>
			</form>
		</OnionSidebar>
	);
}

export default OnionCustomFieldForm;
