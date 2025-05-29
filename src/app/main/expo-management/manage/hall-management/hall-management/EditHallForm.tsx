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
import OnionSelector from "app/shared-components/components/OnionSelector";
import {
  useUsersDispatch,
  useUsersSelector,
} from "src/app/main/users/UsersSlice";
import { GetHallAPI } from "../apis/Get-Hall-API";
import { BulkHallUpdateAPI } from "../apis/Bulk-Hall-Update-Api";
import { setState } from "../HallManagementSlice";
import { getExpo } from "../apis/ExpoIdFinder";
import { cleanDigitSectionValue } from "@mui/x-date-pickers/internals/hooks/useField/useField.utils";

const defaultValues = {
  hallName: "",
  hallDescription: "",
  hallExpoId: "",
};

type FormData = {
  hallName: string;
  hallDescription: string;
  hallExpoId: string,
};


export default function EditHallForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();
  const { t } = useTranslation('hallManagement');
  const [hallData, setHallData] = useState<FormData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useUsersDispatch();
  const state = useUsersSelector((state) => state.state.value);

  const schema = z.object({
    //hallName: z.string().nonempty("You must enter your Hall Name."),
    hallName: z
      .string()
      .min(1, 'hall_hallNameRequiredMessage')
      .max(50, 'hall_hallNameMaxLengthMessage')
      .refine(value => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value), 'hall_hallNameEmailInvalidMessage')
      .refine(value => !/^(ftp|http|https):\/\/[^ "]+$/.test(value), 'hall_hallNameUrlInvalidMessage')
      .refine(value => !/^\s/.test(value), 'hall_hallNameLeadingSpaceMessage')
      .refine(value => value.trim().length > 0, 'hall_hallNameSpacesOnlyMessage'),
    hallDescription: z.string()
      .max(100, 'hall_hallDescriptionMaxLengthMessage')
      .refine(value => !/^\s/.test(value), 'hall_hallDescriptionLeadingSpaceMessage')
      .nullable(),
  });

  const getHallData = async () => {
    const hall = await GetHallAPI({ id: routeParams.hallId });

    setHallData(hall?.data[0]);
  };

  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    getHallData()
  }, []);

  useEffect(() => {
    setValue("hallName", (hallData?.hallName == "defaultLobby") ? "Lobby" : hallData?.hallName || "");
    setValue("hallDescription", hallData?.hallDescription || "");
  }, [hallData]);

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({ message: t("hall_updateSuccessMessage"), variant: "success" })
    );
    // navigate(-1);
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const { hallName, hallDescription } = formData;


    setIsLoading((prev) => !prev);
    const data = {
      id: routeParams.hallId,
      hallName,
      hallDescription,
      hallExpoId: routeParams.id
    }
    try {
      const response = await BulkHallUpdateAPI({ data });
      const result = response?.data;

      if (result) {
        handleUpdate();
        navigate(-1);
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
      exitEndpoint={-1}
      sidebarWidth="small"
      footer={true}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonLabel={t("hall_submit")}
      footerButtonDisabled={!isValid}
      footerButtonSize="medium"
      isFooterButtonLoading={isLoading}
    >
      <OnionSubHeader
        title={t("hall_addhallInfo_title")}
        subTitle={t("hall_editHallInfo_title")}
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
              label={
                <span>
                  {t("hall_hallName")}
                </span>
              }
              autoFocus
              required
              type="firstName"
              error={!!errors.hallName}
              helperText={t(errors?.hallName?.message)}
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
              rows={4}
              label={
                <span>
                  {t("hall_description")}
                  {/* <span style={{ color: 'red' }}>*</span> */}
                </span>
              }
              type="text"
              error={!!errors.hallDescription}
              helperText={t(errors?.hallDescription?.message)}
              variant="outlined"
              multiline
              fullWidth
            />
          )}
        />
      </form>
    </OnionSidebar>
  );
}