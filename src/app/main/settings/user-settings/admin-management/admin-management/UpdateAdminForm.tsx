import {
	Button,
	FormGroup,
	TextField,
	Typography,
	MenuItem,
	CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { ZodIssueCode, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "@lodash";
import { useDebounce } from "@fuse/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
// import { RoleSelectorAPI } from '../apis/Role-Selector-Api';
// import { AddUserAPI } from '../apis/Add-User-Api';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { UpdateUserAPI } from 'src/app/main/users/apis/Update-User-Api';
import { GetUserAPI } from 'src/app/main/users/apis/Get-User-Api';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { setShouldUpdate } from 'src/app/auth/user/store/adminSlice';
import LocalCache from "src/utils/localCache";
import { Onion } from "src/utils/consoleLog";
import { updateLocalCache } from "src/utils/updateLocalCache";
import { RoleSelectorAPI } from "src/app/main/users/apis/Role-Selector-Api";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";

const defaultValues = {
	firstName: "",
	lastName: "",
	email: "",
	roleIds: [''],
	designation: '',
	organisation: '',
};

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	roleIds?: string[];
	designation?: string;
	organisation?: string;
};

function UpdateAdminForm() {
	const { t } = useTranslation('adminManagement');
	const routeParams = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [userData, setUserData] = useState<FormData>();
	const [roleData, setRoleData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [selectedRole, setSelectedRole] = useState('');

	const getUserData = async () => {
		const User = await GetUserAPI({ id: routeParams.id });
		setUserData(User?.data);
	};

	const schema = z.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		email: z.string().email('adminManagement_valid_email').optional(),
		designation: z.string().optional(),
		organisation: z.string().optional(),
		roleIds: z.string().nullable(),
	}).superRefine((data, ctx) => {
		const speakerRoleId = import.meta.env.VITE_SPEAKER_ID;

		if (data.roleIds?.includes(speakerRoleId)) {
			if (!data.designation || data.designation.trim() === '') {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					path: ['designation'],
					message: 'adminForm_designation_required',
				});
			}

			if (!data.organisation || data.organisation.trim() === '') {
				ctx.addIssue({
					code: ZodIssueCode.custom,
					path: ['organisation'],
					message: 'adminForm_organisation_required',
				});
			}
		}
	});

	const GetAllAdmins = useCallback(
		debounce(async () => {
			try {
				const roles = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
				setRoleData(roles ? roles : {});
			} catch (error) {
				console.error("Error fetching admin roles:", error);
			}
		}, 300),
		[]
	);

	const { control, formState, handleSubmit, watch, setValue } = useForm({
		mode: "onChange",
		defaultValues,
		resolver: zodResolver(schema),
	});
	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		// GetAllAdmins();
		getUserData();
		GetAllAdmins();
	}, []);

	useEffect(() => {
		if (userData) {
			setValue("firstName", userData.firstName || "");
			setValue("lastName", userData.lastName || "");
			setValue("email", userData.email || "");
			setValue("roleIds", userData.roleIds[0] || []);
			setValue("designation", userData.designation || "");
			setValue("organisation", userData.organisation || "");
		}
	}, [userData, setValue]);

	const userRole = watch('roleIds');
	const speakerRoleId = import.meta.env.VITE_SPEAKER_ID;

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: t('userUpdatedSuccess'), variant: 'success' }));
		navigate('/admin/settings/user-settings/admin-management');
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {

		const { firstName, lastName, email, roleIds } = formData;
		Onion.log(roleIds, "in update form")
		setIsLoading((prev) => !prev);
		const data: {
			_id: string;
			firstName: string;
			lastName: string;
			email: string;
			roleIds: string[];
			organisation?: string;
			designation?: string;
		} = {
			_id: routeParams.id,
			firstName,
			lastName,
			email,
			roleIds: roleIds !== null ? [roleIds] : [],
		};

		if (formData.roleIds.includes(speakerRoleId)) {
			data.organisation = formData.organisation;
			data.designation = formData.designation;
		}
		try {
			const response = await UpdateUserAPI(data);
			const result = response?.data;
			if (result) {
				// updateLocalCache(result);
				handleUpdate();
				dispatch(setShouldUpdate(true))

			};
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;
			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || t('userAlready_exists'), variant: 'error' }));
				// navigate('/users');
				setIsLoading((prev) => !prev);
			}
		}
	};

	return (
		<OnionSidebar
			title={t('updateAdmin')}
			exitEndpoint="/admin/settings/user-settings/admin-management"
			sidebarWidth='small'
			footer={true}
			footerButtonLabel={t('common_save')}
			footerButtonClick={handleSubmit(onSubmit)}
			footerButtonDisabled={isLoading}
			isFooterButtonLoading={isLoading}
			footerButtonSize='medium'
		>
			<OnionSubHeader
				title={t('personalInfo')}
				subTitle={t('userBasicInfoHelpText')}
			/>
			<form
				name="UserAddForm"
				noValidate
				spellCheck={false}
				className="mt-20 flex flex-col justify-center space-y-20"
				onSubmit={handleSubmit(onSubmit)}
				autoComplete="off"
			>
				<Controller
					name="firstName"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={t("firstName")}
							autoFocus
							type="firstName"
							error={!!errors.firstName}
							helperText={t(errors?.firstName?.message)}
							variant="outlined"
							fullWidth
						/>
					)}
				/>
				<Controller
					name="lastName"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={t("lastName")}
							type="lastName"
							error={!!errors.lastName}
							helperText={t(errors?.lastName?.message)}
							variant="outlined"
							fullWidth
						/>
					)}
				/>
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={t("email")}
							type="email"
							disabled
							error={!!errors.email}
							helperText={t(errors?.email?.message)}
							variant="outlined"
							fullWidth
						/>
					)}
				/>
				<Controller
					name="roleIds"
					control={control}
					render={({ field }) => (
						<FormGroup>
							<TextField
								id="outlined-select-currency"
								label={t("role")}
								select
								helperText={t(errors?.roleIds?.message)}
								{...field}
								onChange={(e) => {
									const selectedRoleName = roleData.find(role => role._id === e.target.value)?.name;
									setSelectedRole(selectedRoleName || '');
									field.onChange(e);
								}}
							>
								{roleData
									?.filter((role) => role.roleType !== "enduser")
									.map((option) => (
										<MenuItem key={option._id} value={option._id}>
											{option.name}
										</MenuItem>
									))}
							</TextField>
						</FormGroup>
					)}
				/>
				{
					(userRole === speakerRoleId) &&
					<>
						<Controller
							name="designation"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={t('adminForm_designation')}
									required
									type="designation"
									error={!!errors.designation}
									helperText={t(errors?.designation?.message)}
									variant="outlined"
									fullWidth
									className='!mb-0'
								/>
							)}
						/>
						<Controller
							name="organisation"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label={t('adminForm_organisation')}
									required
									type="organisation"
									error={!!errors.organisation}
									helperText={t(errors?.organisation?.message)}
									variant="outlined"
									fullWidth
									className='!mb-0'
								/>
							)}
						/>
					</>
				}
			</form>
		</OnionSidebar>
	);
}

export default UpdateAdminForm;
