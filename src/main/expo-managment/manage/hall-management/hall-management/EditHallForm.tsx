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
import { GetHallAPI } from "../apis/Get-Hall-API";
import { BulkHallUpdateAPI } from "../apis/Bulk-Hall-Update-Api";
import { setState } from "../HallManagementSlice";

const defaultValues = {
  hallName: "",
  hallDescription: "",
  hallExpoId: "46cc88f5-bb24-48ae-a585-1a445e49778a",
};

type FormData = {
  hallName: string;
  hallDescription: string;
  hallExpoId: string,
};

const schema = z.object({
  hallName: z.string().nonempty("You must enter your Hall Name."),
  hallDescription: z.string().nonempty("You must enter your description."),
});

export default function EditHallForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
	const routeParams = useParams();
  const { t } = useTranslation('hallManagement');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [hallData, setHallData] = useState<FormData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useUsersDispatch();
  const state = useUsersSelector((state) => state.state.value);

  const getHallData = async () => {
		const hall = await GetHallAPI({ id: routeParams.id });
    console.log(hall,'hallsss');
    
		setHallData(hall?.data);
	};

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
  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    GetAllAdmins();
    getHallData()
  }, []);

  useEffect(() => {
		setValue("hallName", hallData?.hallName || "");
		setValue("hallDescription", hallData?.hallDescription || "");
	}, [hallData]);


  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({ message: t("hall_update_title"), variant: "success" })
    );
    navigate("/expo-management/manage/hall");
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const {hallName,hallDescription} = formData;
    setIsLoading((prev) => !prev);
    const data = {
      id: routeParams.id,
      hallName,
      hallDescription,
      hallExpoId: '46cc88f5-bb24-48ae-a585-1a445e49778a'
    }
    try {
    const response = await BulkHallUpdateAPI({ data });
    const result = response?.data;
    console.log(response?.data?.message, "Updated hall result");

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
      title={t("hall_update_title")}
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
        subTitle={t("userBasicInfoHelpText")}
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
          name="hallDescription"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("description")}
              autoFocus
              type="lastName"
              error={!!errors.hallDescription}
              helperText={errors?.hallDescription?.message}
              variant="outlined"
              fullWidth
            />
          )}
        />
      </form>
    </OnionSidebar>
  );
}
