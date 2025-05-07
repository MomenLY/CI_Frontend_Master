import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import _ from "@lodash";
import {
  FormGroup,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl } from "@mui/base";
import { useTranslation } from "react-i18next";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import CountryCodeSelector from "./phone-number-selector/CountryCodeSelector";
import { selectUser } from "../../../../auth/user/store/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getUserDetailsByIdAPI, userProfileUpdate } from "./apis/UserAPI";
import { COUNTRIES } from "./store/countries";
import GeneralSettingsHeader from "../GeneralSettingsHeader";
import Header from "../basic-settings/Header";
import { useEffect, useState } from "react";
import OnionPageOverlay from "app/shared-components/components/OnionPageOverlay";

type FormType = {
  firstName: string;
  email: string;
  dob: string;
  gender: string;
  phoneNumber: string;
  countryCode: string;
  country: string;
  address: string;
};

function ProfileSettingsContent() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // get user details from session
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  // schema for user profile
  const schema = z.object({
    firstName: z.string()
      .min(1, `${t('youMustEnterYourName')}`)
      .max(50, `${t('pleaseLimitYourInputToAMaximumOf50Characters')}`)
      .refine(value => value.trim() !== '', { message: `${t('inputCannotBeEmptyOrJustWhitespace')}` }),
    email: z.string().email(`${t('youMustEnterAValidEmail')}`).nullable(),
    dob: z.string().nullable(),
    gender: z.string().nullable(),
    country: z.string().nullable(),
    countryCode: z.string().nullable(),
    _id: z.string().nullable(),
    address: z.string().nullable(),
    phoneNumber: z
      .string()
      .nullable()
  });

  //get user details by id
  const getUserDetails = async () => {
    let response = await getUserDetailsByIdAPI({ id: user.uuid });
    if (response.data) {
      setValue("gender", response?.data?.user?.data?.gender);
      setValue("email", response?.data?.user?.data?.email);
      setValue("phoneNumber", response?.data?.user?.data?.phoneNumber);

      setValue("address", response?.data?.user?.data?.address);
      let dateOfBirthStr = response?.data?.user?.data?.dateOfBirth;
      if (dateOfBirthStr) {
        // Create a new Date object
        let dateOfBirth = new Date(dateOfBirthStr);
        // Format the date as YYYY-MM-DD
        let year = dateOfBirth.getFullYear();
        let month = String(dateOfBirth.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        let day = String(dateOfBirth.getDate()).padStart(2, "0");
        let formattedDate = `${year}-${month}-${day}`;
        // Set the value of the date input field
        setValue("dob", formattedDate);
      }
      setValue("firstName", response?.data?.user?.data?.firstName);
      if (response?.data?.user?.data?.countryCode === null) {
        setValue("countryCode", "+91");
      } else {
        setValue("countryCode", response?.data?.user?.data?.countryCode);
      }
      if (response?.data?.user?.data?.country === null) {
        setValue("country", "India");
      } else {
        setValue("country", response?.data?.user?.data?.country);
      }
    }
  };
  useEffect(() => {
    getUserDetails();
  }, []);

  //defaultvalues
  const defaultValues = {
    _id: user.uuid,
    name: "",
    email: "",
    dob: "",
    gender: "",
    phoneNumber: "",
    country: "",
    countryCode: "+91",
    address: "",
  };

  // use form hook
  const { control, watch, formState, handleSubmit, setValue } = useForm<FormType>({
    mode: "all",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { isValid, dirtyFields, errors } = formState;


  // handle phone submit event

  const onSubmit = async (formData: FormType) => {
    setIsLoading((prev) => !prev);
    try {
      const response = await userProfileUpdate({ data: { formData } });

      if (response) {
        dispatch(
          showMessage({
            message: `${t('profileSettingsUpdated')}`,
            variant: "success",
          })
        );
        setIsLoading((prev) => !prev);
      }
    } catch (err) {
      if (err?.response?.data?.message) {
        dispatch(
          showMessage({
            message: `${err?.response?.data?.message}`,
            variant: "error",
          })
        );
      } else if (err?.message) {
        dispatch(showMessage({ message: `${err?.message}`, variant: "error" }));
      }
      setIsLoading((prev) => !prev);
    }
  };

  return (
    <OnionPageOverlay>
      <GeneralSettingsHeader
        title={t("Profile Settings")}
        subTitle={t("Profile Settings")}
      />
      <Header
        label={""}
        content={t("profileSettingsHelperText")}
      />
      <form
        spellCheck="false"
        name="profileSettingForm"
        noValidate
        className="mt-20 flex w-full flex-col justify-center space-y-10"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="flex flex-col space-y-28 md:w-1/2 ">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.firstName}
                  helperText={errors?.firstName?.message}
                  id="outlined-basic"
                  label={t("firstName")}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  id="outlined-basic"
                  label={t("email")}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            )}
          />
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.dob}
                  helperText={errors?.dob?.message}
                  id="outlined-basic"
                  variant="outlined"
                  placeholder=""
                  label={t("dateOfBirth")}
                  type="date"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: new Date().toISOString().split("T")[0],
                  }}
                />
              </FormControl>
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormGroup>
                  <TextField
                    error={!!errors.gender}
                    helperText={errors?.gender?.message}
                    id="outlined-select-currency"
                    placeholder={t("gender")}
                    label={t("gender")}
                    select
                    {...field}
                    fullWidth
                  >
                    <MenuItem value="Male">{t('male')}</MenuItem>
                    <MenuItem value="Female">{t('female')}</MenuItem>
                  </TextField>
                </FormGroup>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextField
                {...field}
                label={t("phoneNumber")}
                placeholder={t("phoneNumber")}
                variant="outlined"
                fullWidth
                error={!!errors.phoneNumber}
                helperText={errors?.phoneNumber?.message}
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
                  ),
                }}
              />
            )}
          />
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormGroup>
                  <TextField
                    id="outlined-select-currency"
                    error={!!errors.country}
                    helperText={errors?.country?.message}
                    select
                    placeholder={t("country")}
                    label={t("country")}
                    fullWidth
                    {...field}
                  >
                    {COUNTRIES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormGroup>
              </FormControl>
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.address}
                  helperText={errors?.address?.message}
                  id="outlined-basic"
                  placeholder={t("address")}
                  label={t("address")}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
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
            disabled={isLoading}
          >
            {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("save")}
          </Button>
        </div>
      </form>
    </OnionPageOverlay>
  );
}

export default ProfileSettingsContent;
