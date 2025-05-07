import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useAppDispatch } from "app/store/hooks";
import { useDebounce } from "@fuse/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import PlatformHeader from "../PlatformHeader";
import { PasswordSettingsUpdateAPI } from "./apis/Password-Settings-Update-Api";
import { SettingsApi } from "../../SettingsApi";
import OnionPageOverlay from "app/shared-components/components/OnionPageOverlay";

const defaultValues = {
  passwordRange: 6,
  requireMinimumOneNumerical: false,
  resetPasswordAfterFirstLogin: false,
  requireMinimumOneCapitalLetter: false,
  requireMinimumOneSpecialCharacter: false,
  enforcePasswordResetAfterPasswordResetedByAdmin: false,
  defaultPasswordSetByAdmin: "",
};

type PasswordForm = {
  passwordRange: number;
  requireMinimumOneNumerical: boolean;
  resetPasswordAfterFirstLogin: boolean;
  requireMinimumOneCapitalLetter: boolean;
  requireMinimumOneSpecialCharacter: boolean;
  enforcePasswordResetAfterPasswordResetedByAdmin: boolean;
  defaultPasswordSetByAdmin: string;
};

function hasUpperCase(password: string): boolean {
  for (let i = 0; i < password.length; i++) {
    if (password[i] >= "A" && password[i] <= "Z") {
      return true; // Found an uppercase letter
    }
  }
  return false; // No uppercase letter found
}

function hasSpecialCharacter(password: string): boolean {
  const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  return regex.test(password);
}

function hasNumber(password: string): boolean {
  for (let i = 0; i < password.length; i++) {
    if (!isNaN(parseInt(password[i], 10))) {
      return true; // Found a numerical value
    }
  }
  return false; // No numerical value found
}

function PasswordSettingsContent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [password, setPassword] = useState<string>();
  const [prevData, setPrevData] = useState<PasswordForm>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const schema = z.object({
    passwordRange: z
      .string()
      .min(1, `${t("pleaseEnterAPasswordRange")}`)
      .refine((value) => parseInt(value) >= 6, {
        message: `${t("defaultPasswordRangeMustHaveAMinimumValueOf6")}`,
      }),
    requireMinimumOneNumerical: z.boolean(),
    resetPasswordAfterFirstLogin: z.boolean(),
    requireMinimumOneCapitalLetter: z.boolean(),
    requireMinimumOneSpecialCharacter: z.boolean(),
    enforcePasswordResetAfterPasswordResetedByAdmin: z.boolean(),
    defaultPasswordSetByAdmin: z
    .string()
    .min(1)
    .refine((value) => !/\s/.test(value), {
      message: 'Password should not contain spaces',
    })
  });

  const { control, handleSubmit, getValues, watch, setValue, formState } =
    useForm({
      mode: "onChange",
      defaultValues,
      resolver: zodResolver(schema),
    });

  const { isValid, dirtyFields, errors } = formState;

  const getPasswordData = async () => {
    const passwordData = await SettingsApi({ settingsKey: "password" });

    if (passwordData) {
      setPrevData(passwordData);
    }
  };

  useEffect(() => {
    getPasswordData();
  }, []);

  useEffect(() => {
    if (prevData) {
      setValue("passwordRange", prevData?.passwordRange);
      setValue(
        "requireMinimumOneCapitalLetter",
        prevData.requireMinimumOneCapitalLetter
      );
      setValue(
        "requireMinimumOneNumerical",
        prevData.requireMinimumOneNumerical
      );
      setValue(
        "requireMinimumOneSpecialCharacter",
        prevData.requireMinimumOneSpecialCharacter
      );
      setValue(
        "resetPasswordAfterFirstLogin",
        prevData.resetPasswordAfterFirstLogin
      );
      setValue(
        "enforcePasswordResetAfterPasswordResetedByAdmin",
        prevData.enforcePasswordResetAfterPasswordResetedByAdmin
      );
      setValue("defaultPasswordSetByAdmin", prevData.defaultPasswordSetByAdmin);
    }
  }, [prevData]);

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({
        message: `${t("passwordSettingsUpdated")}`,
        variant: "success",
      })
    );
    setIsLoading((prev) => !prev);
  }, 300);

  const [passwordRules, setPasswordRules] = useState([
    {
      key: "length",
      text: `${t("shouldContainAtLeast")} 8 ${t("letters")}`,
      active: true,
      passed: false,
    },
    {
      key: "capitalLetter",
      text: `${t("shouldContainMin01SpecialCharacter")}`,
      active: true,
      passed: false,
    },
    {
      key: "numerical",
      text: `${t("shouldContainMin01Numerical")}`,
      active: true,
      passed: false,
    },
    {
      key: "specialCharacter",
      text: `${t("shouldContainMin01SpecialCharacter")}`,
      active: true,
      passed: false,
    },
  ]);

  const watchedData = watch();

  useEffect(() => {
    manageRulesText({
      rule: "length",
      text: `${t("shouldContainAtLeast")} ${getValues().passwordRange || 6} ${t("letters")}`,
    });
    // manageRules({ rule: 'length', isActive: getValues().passwordRange })
    manageRules({
      rule: "capitalLetter",
      isActive: getValues().requireMinimumOneCapitalLetter,
    });
    manageRules({
      rule: "numerical",
      isActive: getValues().requireMinimumOneNumerical,
    });
    manageRules({
      rule: "specialCharacter",
      isActive: getValues().requireMinimumOneSpecialCharacter,
    });
  }, [
    watchedData.passwordRange,
    watchedData.requireMinimumOneCapitalLetter,
    watchedData.requireMinimumOneNumerical,
    watchedData.requireMinimumOneSpecialCharacter,
  ]);

  const onSubmit = async (formData: PasswordForm) => {


    setIsLoading((prev) => !prev);
    const {
      passwordRange,
      requireMinimumOneNumerical,
      resetPasswordAfterFirstLogin,
      requireMinimumOneCapitalLetter,
      requireMinimumOneSpecialCharacter,
      enforcePasswordResetAfterPasswordResetedByAdmin,
      defaultPasswordSetByAdmin,
    } = formData;
    const data = {
      passwordRange,
      requireMinimumOneNumerical,
      resetPasswordAfterFirstLogin,
      requireMinimumOneCapitalLetter,
      requireMinimumOneSpecialCharacter,
      enforcePasswordResetAfterPasswordResetedByAdmin,
      defaultPasswordSetByAdmin,
    };
    try {
      const response = await PasswordSettingsUpdateAPI({ data });
      const result = response?.data;


      if (result) {
        handleUpdate();
      }
    } catch (err) {
      const errorMesssage = err?.response?.data?.message;

      if (errorMesssage) {
        dispatch(
          showMessage({
            message: errorMesssage || `${t("settingsNotFound")}`,
            variant: "error",
          })
        );
      }

      setIsLoading((prev) => !prev);
    }
  };

  const updateRuleValidationStatus = ({ rule, isPassed }) => {
    setPasswordRules((prevItems) =>
      prevItems.map((pRules) =>
        pRules.key === rule ? { ...pRules, passed: isPassed } : pRules
      )
    );
  };

  const manageRules = ({ rule, isActive }) => {
    setPasswordRules((prevItems) =>
      prevItems.map((pRules) =>
        pRules.key === rule ? { ...pRules, active: isActive } : pRules
      )
    );
  };

  const manageRulesText = ({ rule, text }) => {
    setPasswordRules((prevItems) =>
      prevItems.map((pRules) =>
        pRules.key === rule ? { ...pRules, text } : pRules
      )
    );
  };

  const handleChange = (e: any) => {
    updateRuleValidationStatus({
      rule: "length",
      isPassed: e.target.value.length >= getValues().passwordRange,
    });
    updateRuleValidationStatus({
      rule: "capitalLetter",
      isPassed: hasUpperCase(e.target.value),
    });
    updateRuleValidationStatus({
      rule: "numerical",
      isPassed: hasNumber(e.target.value),
    });
    updateRuleValidationStatus({
      rule: "specialCharacter",
      isPassed: hasSpecialCharacter(e.target.value),
    });
    setPassword(e.target.value);
  };

  return (
    <OnionPageOverlay>
      <PlatformHeader
        title={t("passwordPolices")}
        subTitle={t("passwordSettings")}
      />
      <form
        spellCheck="false"
        name="passwordSettingsForm"
        noValidate
        className="mt-10 flex w-full flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <Header
          label={t("passwordPolices")}
          content={t("passwordPolicesHelperText")}
        />
        <div className="flex w-full flex-col md:flex-row justify-center items-center">
          <div className="flex flex-col md:w-1/2">
            <Controller
              name="passwordRange"
              control={control}
              render={({ field }) => (
                <FormControl className="md:w-1/3 mb-16">
                  <Typography
                    component="h4"
                    className="flex-1 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate mb-16"
                  >
                    {t("passwordRange")}
                  </Typography>
                  <TextField
                    {...field}
                    id="outlined-basic"
                    label={t("minLength")}
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    placeholder="6"
                    error={!!errors.passwordRange}
                    helperText={errors?.passwordRange?.message}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="requireMinimumOneCapitalLetter"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={value} onChange={onChange} />}
                    label={t("shouldContainMinimum1CapitalLetter")}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="requireMinimumOneNumerical"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={value} onChange={onChange} />}
                    label={t("shouldContainMinimum1Numerical")}
                  />
                </FormControl>
              )}
            />
            <Controller
              name="requireMinimumOneSpecialCharacter"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={value} onChange={onChange} />}
                    label={t("shouldContainMinimum1SpecialCharacter")}
                  />
                </FormControl>
              )}
            />
          </div>
          <div className="w-full md:w-1/2">
            <Card sx={{ maxWidth: "100%" }}>
              <CardHeader
                title={
                  <Typography className="text-15" variant="h6">
                    {t("preview")}
                  </Typography>
                }
              />
              <Divider />
              <CardContent>
                <TextField
                  label={t("password")}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  onChange={handleChange}
                />
                {passwordRules.map((pRules) => {
                  return (
                    <Typography
                      key={pRules.key}
                      className="text-13 m-2"
                      color={
                        pRules.active
                          ? pRules.passed
                            ? "green"
                            : "red"
                          : "lightgray"
                      }
                    >
                      {pRules.text}
                    </Typography>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col">
          <Header
            label={t("defaultPassword")}
            content={t("defaultPasswordHelperText")}
          />
          <Controller
            name="defaultPasswordSetByAdmin"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="mb-24 mt-10 w-1/3"
                label={t("defaultPassword")}
                type="text"
                error={!!errors.defaultPasswordSetByAdmin}
                helperText={errors?.defaultPasswordSetByAdmin?.message}
                variant="outlined"
                required
                fullWidth
              />
            )}
          />
          <Header
            label={t("resetPasswordPolicies")}
            content={t("resetPasswordPoliciesHelperText")}
          />
          <Controller
            name="resetPasswordAfterFirstLogin"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl>
                <FormControlLabel
                  control={<Checkbox checked={value} onChange={onChange} />}
                  label={t("resetPasswordAfterSuccessfulFirstLogin")}
                />
              </FormControl>
            )}
          />
          <Controller
            name="enforcePasswordResetAfterPasswordResetedByAdmin"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl>
                <FormControlLabel
                  control={<Checkbox checked={value} onChange={onChange} />}
                  label={t("enforcePasswordResetAfterPasswordResetedByAdmin")}
                />
              </FormControl>
            )}
          />
          <div className="flex md:w-1/2 justify-end mt-16 ">
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={isLoading}
            >
              {isLoading === true ? (
                <CircularProgress size={25} color="inherit" />
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </div>
      </form>
    </OnionPageOverlay>
  );
}

export default PasswordSettingsContent;
