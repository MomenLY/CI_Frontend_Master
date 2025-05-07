import {
	Button,
	FormGroup,
	TextField,
	Typography,
	MenuItem,
	CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
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
	roleIds: [""],
};

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	roleIds: string[];
};

const schema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().email("You must enter a valid email").optional(),
	roleIds: z.string().nullable(),
});

function UpdateAdminForm() {
	const { t } = useTranslation();
	const routeParams = useParams();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const [userData, setUserData] = useState<FormData>();
	const [roleData, setRoleData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const getUserData = async () => {
		const User = await GetUserAPI({ id: routeParams.id });
		setUserData(User?.data);
	};


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

	const { control, formState, handleSubmit, setValue } = useForm({
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
		setValue("firstName", userData?.firstName || "");
		setValue("lastName", userData?.lastName || "");
		setValue("email", userData?.email || "");
		setValue("roleIds", userData?.roleIds[0] || []);
	}, [userData]);

	const handleUpdate = useDebounce(() => {
		dispatch(showMessage({ message: t('userUpdatedSuccess'), variant: 'success' }));
		navigate('/admin/settings/user-settings/admin-management');
		setIsLoading((prev) => !prev);
	}, 300);

	const onSubmit = async (formData: FormData) => {

		const { firstName, lastName, email, roleIds } = formData;
		Onion.log(roleIds, "in update form")
		setIsLoading((prev) => !prev);
		const data = {
			userId: routeParams.id,
			firstName,
			lastName,
			email,
			roleIds
		};
		try {


			const response = await UpdateUserAPI({ data });
			const result = response?.data;
			if (result) {
				// updateLocalCache(result);
				handleUpdate();
				dispatch(setShouldUpdate(true))

			};
		} catch (err) {
			const errorMesssage = err?.response?.data?.message;
			if (errorMesssage) {
				dispatch(showMessage({ message: errorMesssage || 'User already exists', variant: 'error' }));
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
			footerButtonLabel={t('save')}
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
							helperText={errors?.firstName?.message}
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
							autoFocus
							type="lastName"
							error={!!errors.lastName}
							helperText={errors?.lastName?.message}
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
							autoFocus
							type="email"
							error={!!errors.email}
							helperText={errors?.email?.message}
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
								{...field}
							>
								{(roleData !== null || undefined) &&
									roleData.map((option) => (
										<MenuItem
											key={option._id}
											value={option._id}
										>
											{option.name}
										</MenuItem>
									))}
							</TextField>
						</FormGroup>
					)}
				/>
			</form>
		</OnionSidebar>
	);
}

export default UpdateAdminForm;
