import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import RegistrationHeader from "./RegistrationHeader";
import OnionCustomeSubTitle from "app/shared-components/components/OnionCustomeSubTitle";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  RadioGroup,
  TextField,
} from "@mui/material";
import OnionCustomRadioButton from "app/shared-components/components/OnionCustomRadioButton";
import { DatePicker } from "@mui/x-date-pickers";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import OnionCustomFields from "app/shared-components/onion-custom-fields/OnionCustomFields";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { updateExpoRegistrationSettings } from "./api/update-expo-registration-API";
import { format } from "date-fns";
import { getExpoById } from "./api/get-expo-details-API";
import { useAppDispatch } from "app/store/hooks";
import { useDebounce } from "@fuse/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useProfileSelector } from "src/app/main/settings/user-settings/profile-field-settings/ProfileFieldSettingsSlice";
import FuseLoading from "@fuse/core/FuseLoading";
import { useParams } from "react-router";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";

const defaultValues = {
  expIsRegistrationEnabled: false || true,
  expMinSeats: null,
  expMaxSeats: null,
  expIsSeatsUnlimited: "",
  expRegistrationStartType: "",
  expRegistrationStartDate: null,
  expRegistrationStartBefore: 0,
  expRegistrationEndType: "",
  expRegistrationEndBefore: 0,
  expRegistrationEndDate: null,
};

type RegistrationForm = {
  expStartDate: string;
  expEndDate: string;
  expIsRegistrationEnabled: boolean;
  expMinSeats: number;
  expMaxSeats: number;
  expIsSeatsUnlimited: boolean | string;
  expRegistrationStartType: string;
  expRegistrationStartDate: string;
  expRegistrationStartBefore: number;
  expRegistrationEndType: string;
  expRegistrationEndBefore: number;
  expRegistrationEndDate: string;
  expCode: string;
};

const schema = z
  .object({
    expIsRegistrationEnabled: z.boolean(),
    expMinSeats: z.coerce.number().nullable(),
    expMaxSeats: z.coerce.number().nullable(),
    expIsSeatsUnlimited: z.boolean(),
    expRegistrationStartType: z.enum(["Immediate", "Days", "Date"]),
    expRegistrationEndType: z.enum(["Immediate", "Days", "Date"]),
    expRegistrationEndBefore: z.coerce.number().nullable(),
    expRegistrationStartBefore: z.coerce.number().nullable(),
    expRegistrationStartDate: z.preprocess((arg: unknown) => {
      if (arg instanceof Date) return arg;
      if (typeof arg === "string" || typeof arg === "number")
        return new Date(arg);
      return null;
    }, z.date().nullable()),
    expRegistrationEndDate: z.preprocess((arg: unknown) => {
      if (arg instanceof Date) return arg;
      if (typeof arg === "string" || typeof arg === "number")
        return new Date(arg);
      return null;
    }, z.date().nullable()),
    // expRegistrationStartDate: z.date().nullable(),
    // expRegistrationEndDate: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (!data.expIsSeatsUnlimited) {
        return data.expMinSeats !== null && data.expMinSeats >= 1;
      }
      return true;
    },
    {
      message: 'minSeats_error_message',
      path: ["expMinSeats"],
    }
  )
  .refine(
    (data) => {
      if (!data.expIsSeatsUnlimited) {
        return (
          data.expMaxSeats !== null &&
          data.expMaxSeats >= (data.expMinSeats || 0)
        );
      }
      return true;
    },
    {
      message: 'maxSeats_error_message',
      path: ["expMaxSeats"],
    }
  )
  .refine(
    (data) => {
      if (data.expRegistrationStartType === "Days") {
        return (
          data.expRegistrationStartBefore !== null &&
          data.expRegistrationStartBefore >= 1
        );
      }
      return true;
    },
    {
      message: 'atLeast_1day_errorMessage',
      path: ["expRegistrationStartBefore"],
    }
  )
  .refine(
    (data) => {
      if (data.expRegistrationEndType === "Days") {
        return (
          data.expRegistrationEndBefore !== null &&
          data.expRegistrationEndBefore >= 1
        );
      }
      return true;
    },
    {
      message: 'atLeast_1day_errorMessage',
      path: ["expRegistrationEndBefore"],
    }
  );

function Registration() {
  const { t } = useTranslation("registration");
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [prevData, setPrevData] = useState<RegistrationForm>();
  const state = useProfileSelector((state) => state.state.value);

  const routeParams = useParams();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, dirtyFields },
  } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const watchexpIsSeatsUnlimited = watch("expIsSeatsUnlimited");
  const watchexpRegistrationStartType = watch("expRegistrationStartType");
  const watchexpRegistrationEndType = watch("expRegistrationEndType");

  const watchRegistrationStartDate = watch("expRegistrationStartDate");
  const getExpo = async () => {
    try {
      setIsLoading(true);
      const res = await getExpoById(routeParams.id);
      if (res) {
        setPrevData(res?.data?.expo);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(setIsLoading(true));
    }
  };
  useEffect(() => {
    getExpo();
  }, []);

  useEffect(() => {
    if (prevData) {
      setValue("expIsRegistrationEnabled", prevData?.expIsRegistrationEnabled);
      setValue("expMinSeats", prevData?.expMinSeats);
      setValue("expMaxSeats", prevData?.expMaxSeats);
      setValue("expIsSeatsUnlimited", prevData?.expIsSeatsUnlimited);
      setValue("expRegistrationEndBefore", prevData?.expRegistrationEndBefore);
      setValue(
        "expRegistrationStartBefore",
        prevData?.expRegistrationStartBefore
      );
      setValue("expRegistrationEndType", prevData?.expRegistrationEndType);
      setValue("expRegistrationStartType", prevData?.expRegistrationStartType);
      if (prevData.expRegistrationStartDate) {
        setValue(
          "expRegistrationStartDate",
          new Date(prevData.expRegistrationStartDate),
          { shouldDirty: true }
        );
      }
      if (prevData.expRegistrationEndDate) {
        setValue(
          "expRegistrationEndDate",
          new Date(prevData.expRegistrationEndDate),
          { shouldDirty: true }
        );
      }
      // if (prevData?.expRegistrationStartType === "Date") {
      //   setValue(
      //     "expRegistrationStartDate",
      //     new Date(prevData?.expRegistrationStartDate)
      //   );
      // }
      // if (prevData?.expRegistrationEndType === "Date") {
      //   setValue(
      //     "expRegistrationEndDate",
      //     new Date(prevData?.expRegistrationEndDate)
      //   );
      // }
    }
  }, [prevData, setValue]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [errors]);

  useEffect(() => {
    if (watchexpRegistrationStartType === "Immediate") {
      setValue("expRegistrationStartDate", new Date());
    } else if (watchexpRegistrationStartType === "Date") {
      setValue("expRegistrationStartDate", prevData?.expRegistrationStartDate);
    } else if (watchexpRegistrationStartType === "Days") {
      setValue("expRegistrationStartDate", new Date());
    }
  }, [
    watchexpRegistrationStartType,
    watch("expRegistrationStartBefore"),
    setValue,
    prevData,
  ]);

  useEffect(() => {
    if (watchexpRegistrationEndType === "Immediate") {
      setValue("expRegistrationEndDate", new Date(prevData?.expStartDate));
    } else if (watchexpRegistrationEndType === "Date") {
      setValue("expRegistrationEndDate", prevData?.expRegistrationEndDate);
    } else if (watchexpRegistrationEndType === "Days") {
      setValue("expRegistrationEndDate", new Date());
    }
  }, [
    watchexpRegistrationEndType,
    watch("expRegistrationEndBefore"),
    setValue,
    prevData,
  ]);

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({
        message: t("Expo Registration Updated Successfully"),
        variant: "success",
      })
    );
    // setIsLoading((prev) => !prev);
    getExpo();
  }, 300);

  const onSubmit = async (data) => {
    try {
      const res = await updateExpoRegistrationSettings(data, routeParams.id);

      if (res.statusCode == 200) {
        handleUpdate();
        await LocalCache.deleteItem(
          cacheIndex.expoDetails + "_" + routeParams.id
        );
      }
    } catch (error) {
      const errorMesssage = error?.response?.data?.message;
      if (errorMesssage) {
        dispatch(
          showMessage({
            message: errorMesssage || "Server error",
            variant: "error",
          })
        );
      }
    }
  };

  if (isLoading) {
    return <FuseLoading />;
  }

  return (
    <div>
      <div className="p-[26px] pb-[15px]">
        <RegistrationHeader />
      </div>
      <div className="w-full container flex flex-col pt-[10px] p-[26px]">
        <div className="md:max-w-[545px] w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Expo Registration */}
            <div className="mb-20">
              <div className="py-8 pt-0">
                <OnionCustomeSubTitle
                  title={t("reg_expoRegistrationType_title")}
                  subTitle={t("reg_expoRegistrationType_subtitle")}
                />
              </div>
              <div className="py-10">
                <Controller
                  name="expIsRegistrationEnabled"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      onChange={(e) =>
                        field.onChange(e.target.value === "true")
                      }
                    >
                      <OnionCustomRadioButton
                        value="true"
                        label={t("reg_expoRegistrationEnable_text")}
                      />
                      <OnionCustomRadioButton
                        value="false"
                        label={t("reg_expoRegistrationDisable_text")}
                      />
                    </RadioGroup>
                  )}
                />
              </div>
            </div>

            {/* Registration Limit */}
            <div className="mb-32">
              <div className="py-8 pt-0">
                <OnionCustomeSubTitle
                  title={t("reg_expoLimit_title")}
                  subTitle={t("reg_expoLimit_subtitle")}
                />
              </div>

              <FormGroup>
                <Controller
                  name="expIsSeatsUnlimited"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox checked={value} onChange={onChange} />
                        }
                        label={t("reg_expoUnlimitedSeatOptions_text")}
                      />
                    </FormControl>
                  )}
                />
              </FormGroup>

              <div className="pt-16">
                <Grid container spacing={3} className="sm:max-w-[80%]">
                  {!watchexpIsSeatsUnlimited && (
                    <>
                      <Grid item xs={6}>
                        <Controller
                          name="expMinSeats"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              label={t("reg_expoMinSeats_text")}
                              error={!!errors.expMinSeats}
                              helperText={t(errors.expMinSeats?.message)}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="expMaxSeats"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="number"
                              label={t("reg_expoMaxSeats_text")}
                              error={!!errors.expMaxSeats}
                              helperText={t(errors.expMaxSeats?.message)}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </div>
            </div>

            {/* Expo Registration Start Date */}
            <div className="mb-32">
              <div className="py-8 pt-0">
                <OnionCustomeSubTitle
                  title={t("reg_expoRegistrationStartDate_title")}
                  subTitle={t("reg_expoRegistrationStartDate_subtitle")}
                />
              </div>
              <div className="pt-10 pb-12">
                <Controller
                  name="expRegistrationStartType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      sx={{ flexDirection: "column" }}
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                    >
                      <OnionCustomRadioButton
                        value="Immediate"
                        label={t("reg_expoRegistrationStartImmediately_title")}
                      />
                      <OnionCustomRadioButton
                        value="Days"
                        label={t("reg_expoRegistrationStartsBefore_title")}
                      />
                      {watchexpRegistrationStartType === "Days" && (
                        <div className="block py-10 md:max-w-[180px]">
                          <Controller
                            name="expRegistrationStartBefore"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="number"
                                label={t("reg_expoRegistrationDays_title")}
                                error={!!errors.expRegistrationStartBefore}
                                helperText={
                                  t(errors.expRegistrationStartBefore?.message)
                                }
                              />
                            )}
                          />
                        </div>
                      )}
                      <OnionCustomRadioButton
                        value="Date"
                        label={t("reg_expoRegistrationChooseStartDate_title")}
                      />
                    </RadioGroup>
                  )}
                />
              </div>
              {watchexpRegistrationStartType === "Date" && (
                <Controller
                  name="expRegistrationStartDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: "2px",
                        },
                      }}
                      className="md:w-full md:max-w-[70%]"
                      label={t("reg_expoRegistrationStartDatePicker_text")}
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        field.onChange(date);
                        field.onBlur();
                        trigger("expRegistrationStartDate");
                        const endDate = watch("expRegistrationEndDate");
                        if (endDate && date && new Date(endDate) < date) {
                          setValue("expRegistrationEndDate", null);
                        }
                      }}
                      minDate={new Date()} // Prevents selecting past dates
                      maxDate={
                        prevData?.expEndDate
                          ? new Date(prevData?.expEndDate)
                          : undefined
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          fullWidth
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  )}
                />
              )}
            </div>

            {/* Expo Registration End Date */}
            <div className="pt-8 mb-28">
              <div className="py-8 pt-0">
                <OnionCustomeSubTitle
                  title={t("reg_expoRegistrationEndDate_title")}
                  subTitle={t("reg_expoRegistrationEndDate_subtitle")}
                />
              </div>
              <div className="my-10">
                <Controller
                  name="expRegistrationEndType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      sx={{ flexDirection: "column" }}
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                    >
                      <OnionCustomRadioButton
                        value="Immediate"
                        label={t("reg_expoRegistrationEndUntil_title")}
                      />
                      <OnionCustomRadioButton
                        value="Days"
                        label={t("reg_expoRegistrationCloseBefore_title")}
                      />
                      {watchexpRegistrationEndType === "Days" && (
                        <div className="block py-20 md:max-w-[180px]">
                          <Controller
                            name="expRegistrationEndBefore"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="number"
                                label={t("reg_expoRegistrationDays_title")}
                                error={!!errors.expRegistrationEndBefore}
                                helperText={
                                  t(errors.expRegistrationEndBefore?.message)
                                }
                              />
                            )}
                          />
                        </div>
                      )}
                      <OnionCustomRadioButton
                        value="Date"
                        label={t("reg_expoRegistrationChooseEndDate_title")}
                      />
                    </RadioGroup>
                  )}
                />
              </div>

              {watchexpRegistrationEndType === "Date" && (
                <Controller
                  name="expRegistrationEndDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      className="md:w-full md:max-w-[70%]"
                      label={t("reg_expoRegistrationEndDatePicker_text")}
                      value={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        field.onChange(date);
                        field.onBlur();
                        trigger("expRegistrationEndDate");
                      }}
                      minDate={
                        watchRegistrationStartDate
                          ? new Date(watchRegistrationStartDate)
                          : new Date()
                      } // Can't be before registration start date
                      maxDate={
                        prevData?.expEndDate
                          ? new Date(prevData?.expEndDate)
                          : undefined
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                          fullWidth
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  )}
                />
              )}
            </div>

            <div className="mt-10 flex ">
              <div className="py-8 pt-0 flex-1">
                <div className="md:max-w-[350px]">
                  <OnionCustomeSubTitle
                    title={t("reg_fieldSettings_title")}
                    subTitle={t("reg_fieldSettings_subtitle")}
                  />
                </div>
              </div>
              <div className="">
                <Button
                  className="mx-4 rounded-[10px] font-medium uppercase"
                  variant="contained"
                  color="primary"
                  component={NavLinkAdapter}
                  to={"new"}
                >
                  <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                  <span className="sm:flex mx-4 ">
                    {t("reg_fieldSettings_add")}
                  </span>
                </Button>
              </div>
            </div>
            <div className=" my-36 md:max-w-[85%]">
              <OnionCustomFields
                loader
                enableStatusSwitch
                enableDelete
                type={"expo_"+routeParams.id}
                refresh={state}
              />
            </div>

            <div className="flex justify-end ">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="rounded-[10px] font-medium uppercase"
              >
                {t("reg_fieldSetting_save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registration;
