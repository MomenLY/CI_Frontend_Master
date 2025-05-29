import {
  Button,
  FormGroup,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { ZodIssueCode, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "@lodash";
import { useDebounce } from "@fuse/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { AddUserAPI } from "src/app/main/users/apis/Add-User-Api";
import { FormControl } from "@mui/base";
import OnionSidebar from "app/shared-components/components/OnionSidebar";
import OnionSubHeader from "app/shared-components/components/OnionSubHeader";
import { useLocation } from "react-router-dom";
import { setShouldUpdate } from "src/app/auth/user/store/adminSlice";
import LocalCache from "src/utils/localCache";
import { Onion } from "src/utils/consoleLog";
import { updateLocalCache } from "src/utils/updateLocalCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";
import { SettingsApi } from "../../../SettingsApi";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { t } from "i18next";

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  designation: '',
  organisation: '',
  shouldSendEmail: true,
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  designation?: string;
  organisation?: string;
  shouldSendEmail: boolean;
};

function AdminForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('adminManagement');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [defaultPassword, setDefaultPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState('');
  const location = useLocation();

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

  useEffect(() => {
    GetAllAdmins();
  }, []);

  useEffect(() => {
    const fetchDefaultPassword = async () => {
      try {
        const passwordData = await SettingsApi({ settingsKey: "password" });
        setDefaultPassword(passwordData.defaultPasswordSetByAdmin);
      } catch (error) {
        console.error("Error fetching default password:", error);
      }
    };

    fetchDefaultPassword();
  }, []);


  const schema = z.object({
    firstName: z.string().nonempty("adminManagement_firstName_required"),
    lastName: z.string().nonempty("adminManagement_lastName_required"),
    email: z
      .string()
      .email("adminManagement_valid_email")
      .nonempty("adminManagement_email_required"),
    password: z.string().nonempty("adminManagement_password_required"),
    role: z.string().nonempty("adminManagement_role_required"),
    designation: z.string().optional(),
    organisation: z.string().optional(),
    shouldSendEmail: z.boolean(),
  }).superRefine((data, ctx) => {
    if (data.role === import.meta.env.VITE_SPEAKER_ID) {
      if (!data.designation || data.designation.trim() === '') {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          path: ['designation'],
          message: 'adminManagement_designation_required',
        });
      }

      if (!data.organisation || data.organisation.trim() === '') {
        ctx.addIssue({
          code: ZodIssueCode.custom,
          path: ['organisation'],
          message: 'adminManagement_organisation_required',
        });
      }
    }
  });

  const { control, formState, handleSubmit, setValue, watch, getValues } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    setValue("password", defaultPassword);
  }, [defaultPassword, setValue]);

  const handleUpdate = useDebounce(() => {
    dispatch(showMessage({ message: t('new_admin_add_success_message'), variant: "success" }));
    navigate("/admin/settings/user-settings/admin-management");
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      designation: formData.designation,
      organisation: formData.organisation,
      roleIds: [formData.role],
      shouldSendEmail: formData.shouldSendEmail
    }

    setIsLoading((prev) => !prev);
    try {
      const response = await AddUserAPI({ data });
      const result = response?.data;

      if (result) {
        handleUpdate();
        dispatch(setShouldUpdate(true));
      }
    } catch (err) {
      const errorMesssage = err?.response?.data?.message;
      if (errorMesssage) {
        dispatch(
          showMessage({
            message: errorMesssage || t('server_error_message'),
            variant: "error",
          })
        );
        setIsLoading((prev) => !prev);
      }
    }
  };

  const copyToClipboard = () => {
    const { email, password } = getValues();
    const textToCopy = `Email: ${email}, Password: ${password}`;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        dispatch(
          showMessage({
            message: t('email_password_copied_clipboard'),
            variant: "success",
          })
        );
      },
      (err) => {
        console.error('Could not copy text: ', err);
        dispatch(
          showMessage({
            message: t('email_password_notCopied_clipboard'),
            variant: "error",
          })
        );
      }
    );
  };

  return (
    <OnionSidebar
      title={t("addAdmin")}
      exitEndpoint="/admin/settings/user-settings/admin-management"
      sidebarWidth="small"
      footer={true}
      footerButtonLabel={t("common_save")}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
      isFooterButtonLoading={isLoading}
      footerButtonSize="medium"
    >
      <OnionSubHeader
        title={t("basicInfo")}
        subTitle={t("userBasicInfoHelpText")}
      />
      <form
        name="AdminAddForm"
        noValidate
        spellCheck={false}
        className="mt-20 flex w-full md:w-full flex-col justify-center space-y-20"
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
              autoFocus
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
              autoFocus
              type="email"
              error={!!errors.email}
              helperText={t(errors?.email?.message)}
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("password")}
              autoFocus
              type="text"
              error={!!errors.password}
              helperText={t(errors?.password?.message)}
              variant="outlined"
              fullWidth
              InputProps={{
                endAdornment: (
                  <IconButton onClick={copyToClipboard} edge="end">
                    <FuseSvgIcon size={20}>material-solid:content_copy</FuseSvgIcon>
                  </IconButton>
                ),
              }}
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormGroup>
              <TextField
                id="outlined-select-currency"
                label={t("role")}
                helperText={t(errors?.role?.message)}
                select
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
          selectedRole === 'Speaker' &&
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

        <Controller
          name="shouldSendEmail"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={value} onChange={onChange} />}
                label={t("markFieldAsEmailSendRequired/Mandatory")}
              />
            </FormControl>
          )}
        />
      </form>
    </OnionSidebar>
  );
}

export default AdminForm;
