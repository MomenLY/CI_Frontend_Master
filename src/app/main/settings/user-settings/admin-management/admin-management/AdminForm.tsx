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
import { z } from "zod";
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

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: '',
  shouldSendEmail: true

};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  shouldSendEmail: boolean;
};

const schema = z.object({
  firstName: z.string().nonempty("You must enter your name."),
  lastName: z.string().nonempty("You must enter your name."),
  email: z
    .string()
    .email("You must enter a valid email")
    .nonempty("You must enter an email"),
  password: z.string().nonempty("Please enter your password."),
  role: z.string().nonempty("You must enter a role."),
  shouldSendEmail: z.boolean(),
});

function AdminForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [defaultPassword, setDefaultPassword] = useState("");
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

  Onion.log("Helloo")

  const { control, formState, handleSubmit, setValue, getValues } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    setValue("password", defaultPassword);
  }, [defaultPassword, setValue]);

  const handleUpdate = useDebounce(() => {
    dispatch(showMessage({ message: "New User Added", variant: "success" }));
    navigate("/admin/settings/user-settings/admin-management");
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const data = formData;

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
            message: errorMesssage || "Server error",
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
            message: "Email and Password copied to clipboard",
            variant: "success",
          })
        );
      },
      (err) => {
        console.error('Could not copy text: ', err);
        dispatch(
          showMessage({
            message: "Failed to copy",
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
      footerButtonLabel={t("save")}
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
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("password")}
              autoFocus
              type="text"
              error={!!errors.password}
              helperText={errors?.password?.message}
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
                select
                {...field}
              >
                {(roleData !== null || undefined) &&
                  roleData.map((option) => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </FormGroup>
          )}
        />
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
