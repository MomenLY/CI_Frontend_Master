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
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import OnionSidebar from "app/shared-components/components/OnionSidebar";
import OnionSubHeader from "app/shared-components/components/OnionSubHeader";
import { debounce } from "lodash";
import LocalCache from "src/utils/localCache";
import { Onion } from "src/utils/consoleLog";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";
import OnionSelector from "app/shared-components/components/OnionSelector";
import {
  useUsersDispatch,
  useUsersSelector,
} from "src/app/main/users/UsersSlice";
import { AddHallAPI } from "../apis/Add-Hall-API";
import { setState } from "../HallManagementSlice";

const defaultValues = {
  hallName: "",
  description: "",
};

type FormData = {
  hallName: string;
  description: string;
};

const schema = z.object({
  hallName: z.string().nonempty("You must enter your Hall Name."),
  description: z.string().nonempty("You must enter your description."),
});

export default function AddHallForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('hallManagement');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useUsersDispatch();
  const state = useUsersSelector((state) => state.state.value);

  const GetAllAdmins = useCallback(
    debounce(async () => {
      const roles = await LocalCache.getItem(
        cacheIndex.roles,
        getRoles.bind(null)
      );
      setRoleData(roles ? roles : {});
    }, 300),
    []
  );

  useEffect(() => {
    GetAllAdmins();
  }, []);

  const { control, formState, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({ message: t("hall_addedSuccessMessage"), variant: "success" })
    );
    navigate("/expo-management/manage/hall");
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const data = formData;
    setIsLoading((prev) => !prev);
    try {
    const response = await AddHallAPI({ data });
    const result = response?.data;
    console.log(response, "added hall result");

    	if (result) {
    		handleUpdate();
    		dispatchRefresh(setState(!state));
    	}
    } catch (err) {
    	const errorMesssage = err?.response?.data?.message;
    	if (errorMesssage) {
    		dispatch(showMessage({ message: errorMesssage || 'Server error', variant: 'error' }));
    		setIsLoading((prev) => !prev);
    	}
    }
  };

  return (
    <OnionSidebar
      title={t("hall_addhall_title")}
      exitEndpoint="/expo-management/manage/hall"
      sidebarWidth="small"
      footer={true}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonLabel={t("save")}
      footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
      footerButtonSize="medium"
      isFooterButtonLoading={isLoading}
    >
      <OnionSubHeader
        title={t("hall_addhallInfo_title")}
        subTitle={t("hall_addhallInfo_subtitle")}
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
          name="hallName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("hallName")}
              autoFocus
              type="firstName"
              error={!!errors.hallName}
              helperText={errors?.hallName?.message}
              variant="outlined"
              fullWidth
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("description")}
              autoFocus
              type="lastName"
              error={!!errors.description}
              helperText={errors?.description?.message}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </form>
    </OnionSidebar>
  );
}
