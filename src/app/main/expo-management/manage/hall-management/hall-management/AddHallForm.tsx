import {
  TextField,

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
import {
  useUsersDispatch,
  useUsersSelector,
} from "src/app/main/users/UsersSlice";
import { AddHallAPI } from "../apis/Add-Hall-API";
import { setState } from "../HallManagementSlice";
import { useParams } from "react-router";


const defaultValues = {
  hallName: "",
  description: "",
};

type FormData = {
  hallName: string;
  description: string;
};

export default function AddHallForm() {
  const routeParams = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("hallManagement");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useUsersDispatch();
  const state = useUsersSelector((state) => state.state.value);

  const schema = z.object({
    hallName: z
      .string()
      .min(1, 'hall_hallNameRequiredMessage')
      .max(50, 'hall_hallNameMaxLengthMessage')
      .refine(value => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value), 'hall_hallNameEmailInvalidMessage')
      .refine(value => !/^(ftp|http|https):\/\/[^ "]+$/.test(value), 'hall_hallNameUrlInvalidMessage')
      .refine(value => !/^\s/.test(value), 'hall_hallNameLeadingSpaceMessage')
      .refine(value => value.trim().length > 0, 'hall_hallNameSpacesOnlyMessage'),
    description: z
      .string()
      .max(100, 'hall_hallDescriptionMaxLengthMessage')
      .refine(value => !/^\s/.test(value), 'hall_hallDescriptionLeadingSpaceMessage')
      .nullable(),
  });

  const { control, formState, handleSubmit } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({
        message: t("hall_addedSuccessMessage"),
        variant: "success",
      })
    );
    navigate(-1);
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (formData: FormData) => {
    const data = formData;
    setIsLoading((prev) => !prev);
    try {
      const response = await AddHallAPI(data, routeParams.id);
      const result = response?.data;

      if (result) {
        handleUpdate();
        dispatch(showMessage({ message: t('hall_addedSuccessMessage'), variant: 'success' }));
        navigate(-1);
        dispatchRefresh(setState(!state));
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

  return (
    <OnionSidebar
      title={t("hall_addhall_title")}
      exitEndpoint={-1}
      sidebarWidth="small"
      footer={true}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonLabel={t("hall_submit")}
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
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              }}
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
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              rows={5}
              {...field}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                },
              }}
              label={t("hall_description")}
              autoFocus
              placeholder="Please type here..."
              type="lastName"
              error={!!errors.description}
              helperText={t(errors?.description?.message)}
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