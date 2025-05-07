import { useAppDispatch } from 'app/store/hooks';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import {
	Avatar,
	Button,
	Checkbox,
	CircularProgress,
	FormControl,
	FormControlLabel,
	InputAdornment,
	TextField,
	Typography
} from '@mui/material';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useTranslation } from 'react-i18next';
import { WebsiteSettingsUpdateAPI } from './apis/Website-Settings-Update';
import CountryCodeSelector from './phone-number-selector/CountryCodeSelector';
import Header from './Header';
import GeneralSettingsHeader from '../GeneralSettingsHeader';
import { useDebounce } from '@fuse/hooks';
import { SettingsApi } from '../../SettingsApi';
import { useEffect, useState } from 'react';
import OnionPageOverlay from 'app/shared-components/components/OnionPageOverlay';

const defaultValues = {
	contactAddress: '',
	youtubeLink: '',
	youtubeIsEnabled: false,
	facebookLink: '',
	facebookIsEnabled: false,
	linkedInLink: '',
	linkedInIsEnabled: false,
	instagramLink: '',
	instagramIsEnabled: false,
	contactEmail: '',
	contactNumber: '',
	countryCode: '+91',
	isEnquiryFormEnabled: false
};

type FormData = {
	contactAddress: string;
	youtubeLink: string;
	youtubeIsEnabled: boolean;
	facebookLink: string;
	facebookIsEnabled: boolean;
	linkedInLink: string;
	linkedInIsEnabled: boolean;
	instagramLink: string;
	instagramIsEnabled: boolean;
	contactEmail: string;
	contactNumber: string;
	countryCode: string;
	isEnquiryFormEnabled: boolean;
};

type PrevFormData = {
	contactAddress: string;
	socialMediaLink: {
		youtube: {
			link: string;
			isEnabled: boolean;
		},
		facebook: {
			link: string;
			isEnabled: boolean;
		},
		linkedIn: {
			link: string;
			isEnabled: boolean;
		},
		instagram: {
			link: string;
			isEnabled: boolean;
		}
	},
	websiteSettings: {
		email: string;
		contact: number;
		countryCode: string;
	},
	isEnquiryFormEnabled: boolean;
};

function WebsiteSettingsContent() {
	const dispatch = useAppDispatch();
	const { t } = useTranslation();
	const [prevData, setPrevData] = useState<PrevFormData>();
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const schema = z.object({
		contactEmail: z.string().email(`${t('youMustEnterAnEmail')}`),
		contactNumber: z
			.string()
			.regex(/^\d{7,14}$/)
			.nullable(),
		countryCode: z.string().optional(),
		facebookIsEnabled: z.boolean().optional(),
		facebookLink: z.string(),
		instagramIsEnabled: z.boolean().optional(),
		instagramLink: z.string().optional(),
		youtubeIsEnabled: z.boolean().optional(),
		youtubeLink: z.string().optional(),
		linkedInLink: z.string().optional(),
		linkedInIsEnabled: z.boolean().optional(),
		contactAddress: z.string().optional(),
		isEnquiryFormEnabled: z.boolean().optional()
	});

	const { control, formState, handleSubmit, getValues, watch, setValue } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	const getWebsiteData = async () => {
		const websiteData = await SettingsApi({ settingsKey: 'website' })
		if (websiteData) {
			setPrevData(websiteData);
		};
	};

	useEffect(() => {
		getWebsiteData();
	}, [])

	useEffect(() => {
		if (prevData) {
			setValue('contactEmail', `${prevData?.websiteSettings?.email}`);
			setValue('countryCode', `${prevData?.websiteSettings?.countryCode}`);
			setValue('contactNumber', `${prevData?.websiteSettings?.contact}`);
			setValue('facebookIsEnabled', prevData?.socialMediaLink?.facebook?.isEnabled);
			setValue('facebookLink', `${prevData?.socialMediaLink?.facebook?.link}`);
			setValue('instagramIsEnabled', prevData?.socialMediaLink?.instagram?.isEnabled);
			setValue('instagramLink', `${prevData?.socialMediaLink?.instagram?.link}`);
			setValue('youtubeIsEnabled', prevData?.socialMediaLink?.youtube?.isEnabled);
			setValue('youtubeLink', `${prevData?.socialMediaLink?.youtube?.link}`);
			setValue('linkedInIsEnabled', prevData?.socialMediaLink?.linkedIn?.isEnabled);
			setValue('linkedInLink', `${prevData?.socialMediaLink.linkedIn?.link}`);
			setValue('contactAddress', `${prevData?.contactAddress}`);
			setValue('isEnquiryFormEnabled', prevData?.isEnquiryFormEnabled);
		}
	}, [prevData])

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: `${t('websiteSettingsUpdated')}`, variant: 'success' }));
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {
		const data = formData;
		setIsLoading((prev) => !prev);
		try {
			const response = await WebsiteSettingsUpdateAPI({ data });
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

	const shouldEnableSaveButton = () => {
		const { contactEmail, contactNumber } = getValues();
		const {
			facebookIsEnabled,
			facebookLink,
			instagramIsEnabled,
			instagramLink,
			youtubeIsEnabled,
			youtubeLink,
			linkedInIsEnabled,
			linkedInLink
		} = watch();

		if (!contactEmail || !contactNumber) return false;

		if (
			(facebookIsEnabled && !facebookLink) ||
			(instagramIsEnabled && !instagramLink) ||
			(youtubeIsEnabled && !youtubeLink) ||
			(linkedInIsEnabled && !linkedInLink)
		)
			return false;

		return true;
	};

	return (
		<OnionPageOverlay>
			<GeneralSettingsHeader
				title={t('Website Settings')}
				subTitle={t('Website Settings')}
			/>
			<form
				spellCheck="false"
				name="websiteSettingsForm"
				noValidate
				className="mt-10 flex w-full md:w-full flex-col justify-center space-y-16"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Header
					label={t('Website Settings')}
					content={t('WebsiteSettingsHelperText')}
				/>
				<div className="flex flex-col md:w-1/3 space-y-10">
					<Controller
						name="contactEmail"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								className="mb-24"
								label={`${t('contact')} ${t('email')}`}
								autoFocus
								type="email"
								error={!!errors.contactEmail}
								helperText={errors?.contactEmail?.message}
								variant="outlined"
								fullWidth
							/>
						)}
					/>
					<Controller
						control={control}
						name="contactNumber"
						render={({ field }) => (
							<TextField
								{...field}
								label={`${t('contact')} ${t('phoneNumber')}`}
								placeholder={`${t('contact')} ${t('phoneNumber')}`}
								variant="outlined"
								fullWidth
								error={!!errors.contactNumber}
								// helperText={errors?.contact?.message}
								InputProps={{
									startAdornment: (
										<Controller
											control={control}
											name="countryCode"
											render={({ field: _field }) => (
												<InputAdornment position="start">
													<CountryCodeSelector {..._field} />
												</InputAdornment>
											)}
										/>
									)
								}}
							/>
						)}
					/>
					<Typography
						component="h4"
						className="flex-1 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate mb-5"
					>
						{t('socialMediaLink')}
					</Typography>
					<Controller
						name="facebookIsEnabled"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl>
								<label
									htmlFor="facebookCheckbox"
									className='flex flex-row items-center space-x-5'
									style={{ cursor: 'pointer' }}>
									<Checkbox
										id="facebookCheckbox"
										checked={value}
										onChange={onChange}
										style={{ paddingLeft: '0', background: 'transparent' }} />
									<Avatar
										alt="Image"
										src="assets/images/socialMedia/facebook.svg"
										sx={{ width: 22, height: 22 }}
									/>
									<Typography variant="body1">{t('facebook')}</Typography>
								</label>
							</FormControl>
						)}
					/>
					{getValues().facebookIsEnabled && (
						<Controller
							name="facebookLink"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-24"
									label={t('link')}
									autoFocus
									type="link"
									error={!!errors.facebookLink}
									helperText={errors?.facebookLink?.message}
									variant="outlined"
									fullWidth
								/>
							)}
						/>
					)}
					<Controller
						name="instagramIsEnabled"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl>
								<label
									htmlFor="instagramCheckbox"
									className='flex flex-row items-center space-x-5'
									style={{ cursor: 'pointer' }}>
									<Checkbox
										id="instagramCheckbox"
										checked={value}
										onChange={onChange}
										style={{ paddingLeft: '0', background: 'transparent' }} />
									<Avatar
										alt="Image"
										src="assets/images/socialMedia/instagram.svg"
										sx={{ width: 22, height: 22 }}
									/>
									<Typography variant="body1">{t('instagram')}</Typography>
								</label>
							</FormControl>
						)}
					/>
					{getValues().instagramIsEnabled && (
						<Controller
							name="instagramLink"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-24"
									label={t('link')}
									autoFocus
									type="link"
									error={!!errors.instagramLink}
									helperText={errors?.instagramLink?.message}
									variant="outlined"
									fullWidth
								/>
							)}
						/>
					)}
					<Controller
						name="youtubeIsEnabled"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl>
								<label
									htmlFor="youtubeCheckbox"
									className='flex flex-row items-center space-x-5'
									style={{ cursor: 'pointer' }}>
									<Checkbox
										id="youtubeCheckbox"
										checked={value}
										onChange={onChange}
										style={{ paddingLeft: '0', background: 'transparent' }} />
									<Avatar
										alt="Image"
										src="assets/images/socialMedia/youtube.svg"
										sx={{ width: 22, height: 22 }}
									/>
									<Typography variant="body1">{t('youtube')}</Typography>
								</label>
							</FormControl>
						)}
					/>
					{getValues().youtubeIsEnabled && (
						<Controller
							name="youtubeLink"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="mb-24"
									label={t('link')}
									autoFocus
									type="link"
									error={!!errors.youtubeLink}
									helperText={errors?.youtubeLink?.message}
									variant="outlined"
									fullWidth
								/>
							)}
						/>
					)}
					<Controller
						name="linkedInIsEnabled"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl>
								<label
									htmlFor="linkedinCheckbox"
									className='flex flex-row items-center space-x-5'
									style={{ cursor: 'pointer' }}>
									<Checkbox
										id="linkedinCheckbox"
										checked={value}
										onChange={onChange}
										style={{ paddingLeft: '0', background: 'transparent' }} />
									<Avatar
										alt="Image"
										src="assets/images/socialMedia/linkedin.svg"
										sx={{ width: 22, height: 22 }}
									/>
									<Typography variant="body1">{t('linkedIn')}</Typography>
								</label>
							</FormControl>
						)}
					/>
					{getValues().linkedInIsEnabled && (
						<Controller
							name="linkedInLink"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									className="!mb-20"
									label={t('link')}
									autoFocus
									type="link"
									error={!!errors.linkedInLink}
									helperText={errors?.linkedInLink?.message}
									variant="outlined"
									fullWidth
								/>
							)}
						/>
					)}
					<Controller
						name="contactAddress"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								id="outlined-multiline-static"
								label={`${t('company')} ${t('address')}`}
								error={!!errors.contactAddress}
								helperText={errors?.contactAddress?.message}
								className='!mt-16'
								multiline
								rows={6}
							/>
						)}
					/>
					<Controller
						name="isEnquiryFormEnabled"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl >
								<FormControlLabel
									control={<Checkbox checked={value} onChange={onChange} />}
									label={t('enableEnquiryForm')}
								/>
							</FormControl>
						)}
					/>
				</div>
				<div className="flex md:w-2/3 justify-end mt-16 ">
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						disabled={!shouldEnableSaveButton() || isLoading}
					>
						{isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("save")}
					</Button>
				</div>
			</form>
		</OnionPageOverlay>
	);
}

export default WebsiteSettingsContent;
