import {
  Button,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import WYSIWYGEditor from "app/shared-components/WYSIWYGEditor";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import OnionCustomRadioButton from "app/shared-components/components/OnionCustomRadioButton";
import GeneralHeader from "./GeneralHeader";
import { FormControl } from "@mui/base";
import { Box } from "@mui/system";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
}));
// Zod schema
const schema = z.object({
  expoMode: z.enum(["public", "private"]),
  expoType: z.enum(["online", "offline", "hybrid"]),
  address: z.string().min(1, "Address is required"),
  expoPricing: z.enum(["free", "paid"]),
  price: z.number().optional().nullable(),
  expoCode: z.string().min(1, "Expo code is required"),
  thumbnail: z.string().optional(),
  termsConditions: z.enum(["enable", "disable"]),
  termsContent: z.string().optional(),
});

// Default values
const defaultValues = {
  expoMode: "public",
  expoType: "online",
  address: "",
  expoPricing: "free",
  price: null,
  expoCode: "",
  thumbnail: "",
  termsConditions: "disable",
  termsContent: "",
};
function General() {
  const { t } = useTranslation("general");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const expoPricing = watch("expoPricing");
  const termsConditions = watch("termsConditions");

  const onSubmit = async (data) => {
    try {
      console.log(data, "data from form");

      //API fetch here
    } catch (error) {
      console.error("API error:", error);
    }
  };

  return (
    <div className="ml-32">
      <div className="mb-32">
        <GeneralHeader />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col w-full">
          <div className="w-full sm:max-w-[70%]">
            {/* Expo Mode */}
            <div className="mb-16">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-4"
              >
                {t("gen_expoMode_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoMode_subtitle")}
              </Typography>
              <div className="pt-14 pb-10">
                <Controller
                  name="expoMode"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <OnionCustomRadioButton
                        value="public"
                        label={t("gen_expoMode_public")}
                      />
                      <OnionCustomRadioButton
                        value="private"
                        label={t("gen_expoMode_private")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expoMode && (
                  <Typography color="error">
                    {errors.expoMode.message}
                  </Typography>
                )}
              </div>
            </div>

            {/* Expo Type */}
            <div className="mb-10">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t("gen_expoType_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoType_subtitle")}
              </Typography>
              <div className="py-16">
                <Controller
                  name="expoType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <OnionCustomRadioButton
                        value="online"
                        label={t("gen_expoOnline")}
                      />
                      <OnionCustomRadioButton
                        value="offline"
                        label={t("gen_expoOffline")}
                      />
                      <OnionCustomRadioButton
                        value="hybrid"
                        label={t("gen_expoHybrid")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expoType && (
                  <Typography color="error">
                    {errors.expoType.message}
                  </Typography>
                )}
              </div>
              <div className="pt-10">
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("gen_expoAddressPlaceholder_text")}
                      multiline
                      rows={5}
                      fullWidth
                      className="sm:max-w-[70%]"
                      error={!!errors.address}
                      helperText={errors.address?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Expo Pricing */}
            <div className="mb-10">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t("gen_expoPricing_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoPricing_subtitle")}
              </Typography>
              <div className="py-10">
                <Controller
                  name="expoPricing"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <OnionCustomRadioButton
                        value="free"
                        label={t("gen_expoPricingFree_title")}
                      />
                      <OnionCustomRadioButton
                        value="paid"
                        label={t("gen_expoPricingPaid_title")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expoPricing && (
                  <Typography color="error">
                    {errors.expoPricing.message}
                  </Typography>
                )}
              </div>
              {expoPricing === "paid" && (
                <div className="py-10">
                  <FormControl
                    fullWidth
                    sx={{ m: 1 }}
                    className="sm:max-w-[70%]"
                  >
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <>
                          <InputLabel htmlFor="outlined-adornment-amount">
                            {t("gen_expoPricing_helperText")}
                          </InputLabel>
                          <OutlinedInput
                            {...field}
                            id="outlined-adornment-amount"
                            startAdornment={
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            }
                            label="Amount"
                            type="number"
                            error={!!errors.price}
                          />
                          {errors.price && (
                            <Typography color="error">
                              {errors.price.message}
                            </Typography>
                          )}
                        </>
                      )}
                    />
                  </FormControl>
                </div>
              )}
            </div>

            {/* Expo Code */}
            <div className="mb-10">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t("gen_expoCode_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoCode_subtitle")}
              </Typography>
              <div className="py-10">
                <Controller
                  name="expoCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="w-full md:w-2/4"
                      required
                      label={t("gen_expoCode_helperText")}
                      error={!!errors.expoCode}
                      helperText={errors.expoCode?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Upload Thumbnail */}
            <div className="mb-10">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t("gen_expoUploadThumbnail_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoUploadThumbnail_subtitle")}
              </Typography>
              <div className="py-10">
                <Box
                  component="section"
                  className="text-center rounded-6 p-24 flex flex-col items-center justify-end sm:max-w-[80%]"
                  sx={{
                    minHeight: "250px",
                    p: 2,
                    border: "2px dashed",
                    borderColor: "text.disabled",
                  }}
                >
                  <FuseSvgIcon
                    style={{ opacity: "0.2" }}
                    className="text-48"
                    size={70}
                    color="text.disabled"
                  >
                    heroicons-outline:plus-circle
                  </FuseSvgIcon>
                  <div className="my-20">
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[12px] block"
                    >
                      {t("gen_expoUploadThumbnailFiles")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[11px] block"
                    >
                      {t("gen_expoUploadThumbnailFileMinSize")}
                    </Typography>
                  </div>
                  <Button
                    className="mx-4 rounded-[10px] font-medium uppercase"
                    variant="contained"
                    color="primary"
                  >
                    <span className="">
                      {t("gen_expoUploadThumbnail_buttonText")}
                    </span>
                  </Button>
                </Box>
              </div>
            </div>

            {/* Expo Terms & Conditions */}
            <div className="mb-10">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t("gen_expoTermNconditions_title")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("gen_expoTermNconditions_subtitle")}{" "}
              </Typography>
              <div className="py-10">
                <Controller
                  name="termsConditions"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field} row>
                      <OnionCustomRadioButton value="enable" label={t("gen_expoTermNconditions_enable")} />
                      <OnionCustomRadioButton value="disable" label={t("gen_expoTermNconditions_disable")} />
                    </RadioGroup>
                  )}
                />
                {errors.termsConditions && (
                  <Typography color="error">
                    {errors.termsConditions.message}
                  </Typography>
                )}
              </div>
              {termsConditions === "enable" && (
                <div className="py-10">
                  <Controller
                    name="termsContent"
                    control={control}
                    render={({ field }) => (
                      <WYSIWYGEditor className="mt-8 mb-16" {...field} />
                    )}
                  />
                  {errors.termsContent && (
                    <Typography color="error">
                      {errors.termsContent.message}
                    </Typography>
                  )}
                </div>
              )}
            </div>

            <div className="text-right">
              <Button
                type="submit"
                className="mx-4 rounded-[10px] font-medium uppercase"
                variant="contained"
                color="primary"
              >
                <span className="">{t("gen_expoSaveButton")}</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default General;
