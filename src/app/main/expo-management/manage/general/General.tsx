import {
  Button,
  FormControl,
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
import { Box } from "@mui/system";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Controller, useForm } from "react-hook-form";
import { boolean, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { updateExpoGeneralSettings } from "./api/update-expo-general-API";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useDebounce } from "@fuse/hooks";
import { useAppDispatch } from "app/store/hooks";
import { useEffect, useState } from "react";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { getExpoById } from "../registration/api/get-expo-details-API";
import { CircularProgressWithLabel } from "app/shared-components/onion-file-upload/utils/progressBars";
import {
  bannerImageUrl,
  bannerPath,
  defaultBannerImageUrl,
  defaultExpoImageUrl,
  expoImageUrl,
  expoPath,
} from "src/utils/urlHelper";
import FuseLoading from "@fuse/core/FuseLoading";
import { useParams } from "react-router";
import { convertImageToDataURL } from "app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";

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

function isHTMLContentEmpty(html: string): boolean {
  // Remove all HTML tags
  const text = html.replace(/<[^>]*>/g, "");
  // Remove all whitespace, including non-breaking spaces
  const trimmed = text.replace(/\s|&nbsp;/g, "");
  return trimmed.length === 0;
}


// Default values
const defaultValues = {
  expExpoMode: "Public",
  expType: "Online",
  expVenue: "",
  expAddress: "",
  expIsPaid: false,
  expPrice: 0,
  expCode: "",
  expBanerImage: "",
  expImage: "",
  expTermsConditionIsEnabled: false,
  expTermsAndConditions: "",
};

type GeneralForm = {
  expExpoMode: string;
  expType: string;
  expVenue: string;
  expAddress: string;
  expIsPaid: boolean;
  expPrice: number | string;
  expCode: string;
  expImage: string;
  expBanerImage: string;
  expTermsConditionIsEnabled: boolean;
  expTermsAndConditions: string;
};

function General() {
  const routeParams = useParams();
  const { t } = useTranslation("general");
  const dispatch = useAppDispatch();
  const [prevData, setPrevData] = useState<GeneralForm>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [upLoadProgress, setUploadProgress] = useState<any>();
  const [autoUpload, setAutoUpload] = useState<boolean>(false);

  // Zod schema
  const schema = z
    .object({
      expExpoMode: z.enum(["Public", "Private"]),
      expType: z.enum(["Online", "Offline", "Hybrid"]),
      expVenue: z.string().nullable(),
      expAddress: z.string().nullable(),
      expIsPaid: z.boolean(),
      expPrice: z
        .preprocess(
          (val) => {
            if (typeof val === "string") {
              const parsed = Number(val.replace(/,/g, ""));
              return isNaN(parsed) ? val : parsed;
            }
            return val;
          },
          z.union([z.number(), z.string()])
        )
        .optional()
        .transform((value) => (value === 0 ? null : value)),
      expCode: z
        .string()
        .min(1, 'gen_expo_code_error')
        .refine(
          (value) => !/\s/.test(value),
          'gen_expo_code_valid'
        ),
      expImage: z.string().optional(),
      expBanerImage: z.string().optional(),
      expTermsConditionIsEnabled: z.boolean(),
      expTermsAndConditions: z.string().optional().nullable(),
    })
    .refine(
      (data) => {
        if (
          data.expType !== "Online" &&
          (!data.expAddress || data.expAddress.length === 0)
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'gen_error_offline',
        path: ["expAddress"],
      }
    )
    .refine(
      (data) => {
        if (
          data.expType !== "Online" &&
          (!data.expVenue || data.expVenue.length === 0)
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'gen_error_venue',
        path: ["expVenue"],
      }
    )
    .refine(
      (data) => {
        if (data.expIsPaid) {
          return (
            data.expPrice !== undefined &&
            typeof data.expPrice === "number" &&
            data.expPrice > 0 && Number.isInteger(data.expPrice)
          );
        }
        return true;
      },
      {
        message: 'gen_price_error',
        path: ["expPrice"],
      }
    )
    .refine(
      (data) => {
        if (data.expTermsConditionIsEnabled) {
          return (
            data.expTermsAndConditions !== undefined &&
            data.expTermsAndConditions !== null &&
            !isHTMLContentEmpty(data.expTermsAndConditions)
          );
        }
        return true;
      },
      {
        message: 'gen_error_terms',
        path: ["expTermsAndConditions"],
      }
    );



  const getExpo = async () => {
    try {
      setIsLoading(true);
      const res = await getExpoById(routeParams.id);
      if (res) {
        setPrevData(res?.data?.expo);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(true);
      console.error(error);
    }
  };

  useEffect(() => {
    getExpo();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: prevData || defaultValues,
  });

  const expIsPaid = watch("expIsPaid");
  const expTermsConditionIsEnabled = watch("expTermsConditionIsEnabled");

  useEffect(() => {
    if (prevData) {
      setValue("expExpoMode", prevData?.expExpoMode);
      setValue("expType", prevData?.expType);
      setValue("expVenue", prevData?.expVenue);
      setValue("expAddress", prevData?.expAddress);
      setValue("expIsPaid", prevData?.expIsPaid);
      setValue("expPrice", prevData?.expIsPaid ? prevData?.expPrice : 0);
      // setValue("expPrice",prevData?.expIsPaid === true ? prevData?.expPrice : 0);
      setValue("expCode", prevData?.expCode);
      setValue(
        "expTermsConditionIsEnabled",
        prevData?.expTermsConditionIsEnabled
      );
      setValue("expTermsAndConditions", prevData?.expTermsAndConditions);
      setValue("expImage", prevData?.expImage),
        setValue("expBanerImage", prevData?.expBanerImage);
    }
  }, [prevData]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstError}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [errors]);

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({
        message: t("gen_update_sucsess"),
        variant: "success",
      })
    );
    setFileQueue({});
    // setIsLoading((prev) => !prev);
    getExpo();
  }, 300);

  const handleProgress = (progress: {}) => {
    setUploadProgress(progress);
  };
  const handleUploadComplete = async (result: {
    status: string;
    message: string;
    data: any;
    id: string;
  }) => {
    const _result = await result?.data;

    if (result.id === "expBanerImage") {
      setValue("expBanerImage", _result?.data);
      setBannerPreviewimage("");
    }

    if (result.id === "expImage") {
      setValue("expImage", _result?.data);
      setExpoPreviewimage("");
    }
    setPrevData((prev) => ({
      ...prev,
      expImage: result.id === "expImage" ? _result?.data : prev?.expImage,
      expBanerImage:
        result.id === "expBanerImage" ? _result?.data : prev?.expBanerImage,
    }));
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[result.id] = true;
      return _prev;
    });
  };

  const UploadProgress = ({ progress }) => {
    return (
      <div
        className=" w-80 h-80 bg-cover bg-center flex justify-center items-center relative"
        style={{ backgroundImage: "url('assets/images/logo/logo.svg')" }}
      >
        <div className=" w-80 h-80 bg-grey-700 bg-opacity-50 flex justify-center items-center">
          <CircularProgressWithLabel value={progress} />
        </div>
      </div>
    );
  };

  const handleDefectiveFiles = (files) => {
    for (const fileId in files) {
      if (files.hasOwnProperty(fileId)) {
        const file = files[fileId];
        const errorMessage = file.defects.join("<br />");
        dispatch(showMessage({ message: `${errorMessage}`, variant: 'error' }));
      };
    }
  };

  const [fileQueue, setFileQueue] = useState({});
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [bannerPreviewImage, setBannerPreviewimage] = useState("");
  const [expoPreviewImage, setExpoPreviewimage] = useState("");
  const handleFileSelect = (files) => {
    if (files.identifier === "expBanerImage") {
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(
          files.files[fileKey]["file"],
          setBannerPreviewimage
        );
        break;
      }
    }

    if (files.identifier === "expImage") {
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(
          files.files[fileKey]["file"],
          setExpoPreviewimage
        );
        break;
      }
    }
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[files.identifier] = false;
      return _prev;
    });
  };
  const onSubmit = async (data) => {
    setIsRequestInProgress(true);
    if (Object.keys(fileQueue).length > 0) {
      setPrevData(data);
      setAutoUpload(true);
    } else {
      onSubmitProceed(data);
    }
  };

  useEffect(() => {
    if (Object.keys(fileQueue).length > 0) {
      let isAllFilesUploadCompleted = true;
      for (let [identifier, uploadStatus] of Object.entries(fileQueue)) {
        if (uploadStatus === false) {
          isAllFilesUploadCompleted = false;
          break;
        }
      }
      if (isAllFilesUploadCompleted) {
        onSubmitProceed(prevData);
      }
    }
  }, [fileQueue]);

  const onSubmitProceed = async (data) => {
    try {
      const res = await updateExpoGeneralSettings(data, routeParams.id);
      if (res.statusCode == 200) {
        handleUpdate();
      }
      setIsRequestInProgress(false);
      setAutoUpload(false);
      await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + routeParams.id);
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const handleCropCancel = (identifier) => {
    if (identifier === "expBanerImage") {
      setBannerPreviewimage("");
    }

    if (identifier === "expImage") {
      setExpoPreviewimage("");
    }
  }

  if (isLoading) {
    return <FuseLoading />;
  }
  return (
    <div>
      <div className="p-[26px] pb-[15px]">
        <GeneralHeader />
      </div>
      <div className="pt-[10px] p-[26px] flex flex-col w-full">
        <div className="w-full md:max-w-[545px] ">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <div className="flex flex-col w-full mb-32"> */}

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
                className="font-normal text-[11px] block md:max-w-[280px]"
              >
                {t("gen_expoMode_subtitle")}
              </Typography>
              <div className="pt-14 pb-10">
                <Controller
                  name="expExpoMode"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      className="space-x-0"
                    >
                      <OnionCustomRadioButton
                        value="Public"
                        label={t("gen_expoMode_public")}
                      />
                      <OnionCustomRadioButton
                        value="Private"
                        label={t("gen_expoMode_private")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expExpoMode && (
                  <Typography color="error">
                    {t(errors.expExpoMode.message)}
                  </Typography>
                )}
              </div>
            </div>

            {/* Expo Type */}
            {prevData?.expType !== "Online" && (
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
                {/* <div className="py-16">
    <Controller
    name="expType"
    control={control}
    render={({ field }) => (
    <RadioGroup {...field} row>
    <OnionCustomRadioButton
    value="Online"
    label={t("gen_expoOnline")}
    />
    <OnionCustomRadioButton
    value="Offline"
    label={t("gen_expoOffline")}
    />
    <OnionCustomRadioButton
    value="Hybrid"
    label={t("gen_expoHybrid")}
    />
    </RadioGroup>
    )}
    />
    {errors.expType && (
    <Typography color="error">
    {errors.expType.message}
    </Typography>
    )}
    </div> */}

                {prevData?.expType !== "Online" && (
                  <div className="pt-10 pb-28">
                    <Controller
                      name="expVenue"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <span>
                              {t("gen_expoVenuePlaceholder_text")}{" "}
                              <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          multiline
                          rows={1}
                          fullWidth
                          className="sm:max-w-[370px]"
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                            },
                          }}
                          error={!!errors.expVenue}
                          helperText={t(errors.expVenue?.message)}
                        />
                      )}
                    />
                  </div>
                )}

                {prevData?.expType !== "Online" && (
                  <div className="pt-10 pb-28">
                    <Controller
                      name="expAddress"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={
                            <span>
                              {t("gen_expoAddressPlaceholder_text")}{" "}
                              <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          multiline
                          rows={5}
                          fullWidth
                          className="sm:max-w-[370px]"
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                            },
                          }}
                          error={!!errors.expAddress}
                          helperText={t(errors.expAddress?.message)}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Expo Pricing */}
            <div className="mb-10">
              <div className="py-10">
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
              </div>
              <div className="py-10">
                <Controller
                  name="expIsPaid"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="row-radio-buttons-group"
                      className="space-x-0"
                      onChange={(e) =>
                        field.onChange(e.target.value === "true")
                      }
                    >
                      <OnionCustomRadioButton
                        value="false"
                        label={t("gen_expoPricingFree_title")}
                      />
                      <OnionCustomRadioButton
                        value="true"
                        label={t("gen_expoPricingPaid_title")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expIsPaid && (
                  <Typography color="error">
                    {t(errors.expIsPaid.message)}
                  </Typography>
                )}
              </div>
              {expIsPaid === true && (

                <div className="py-10">
                  <Controller
                    name="expPrice"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        type="number"
                        {...field}
                        className="w-full md:max-w-[370px]"
                        required
                        label={t("gen_expoPricing_helperText")}
                        error={!!errors.expPrice}
                        helperText={t(errors.expPrice?.message)}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {/* Expo Code */}
            <div className="mb-10 hidden">
              <div className="py-10">
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
              </div>
              <div className="py-10">
                <Controller
                  name="expCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      className="w-full md:max-w-[172px]"
                      disabled
                      required
                      label={t("gen_expoCode_helperText")}
                      error={!!errors.expCode}
                      helperText={t(errors.expCode?.message)}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: "2px",
                        },
                      }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Upload banner expBanerImage */}
            <div className="pt-10 mb-10">
              <div className="py-10">
                <Typography
                  color="text.primary"
                  className="font-semibold text-[13px] block mb-6"
                >
                  {t("gen_expoUploadBannerThumbnail_title")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  className="font-normal text-[11px] block"
                >
                  {t("gen_expoUploadBannerThumbnail_subtitle")}
                </Typography>
              </div>
              <div className="py-20">
                <Controller
                  name="expBanerImage"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      className="w-full"
                      error={!!errors.expBanerImage}
                    >
                      <Box
                        sx={{
                          Height: "100%",
                          maxHeight: "254px",
                          minHeight: "254px",
                          padding: "0",
                          border: "2px dashed",
                          borderColor: "#D9D9D9",
                        }}
                        className="text-center rounded-6 p-0 sm:max-w-[372px]"
                        role="button"
                      >
                        <div className="p-16 flex flex-col items-center">
                          {upLoadProgress?.id === "expBanerImage" &&
                            upLoadProgress?.progress < 100 ? (
                            <UploadProgress
                              progress={upLoadProgress?.progress}
                            />
                          ) : (
                            <>
                              {prevData?.expBanerImage ? (
                                <div className="min-h-[110px]">
                                  <img
                                    className="w-full mb-12 object-contain"
                                    style={{
                                      maxHeight: "112px",
                                      height: "100%",
                                    }}
                                    src={
                                      bannerPreviewImage
                                        ? bannerPreviewImage
                                        : prevData?.expBanerImage === "default.webp"
                                          ? defaultBannerImageUrl(
                                            prevData?.expBanerImage
                                          )
                                          : bannerImageUrl(prevData?.expBanerImage)
                                    }
                                    alt="admin logo"
                                  />
                                </div>
                              ) : (
                                <div className="">
                                  <FuseSvgIcon
                                    style={{
                                      opacity: "0.2",
                                    }}
                                    className="text-48"
                                    size={100}
                                    color="text.disabled"
                                  >
                                    heroicons-outline:plus-circle
                                  </FuseSvgIcon>
                                </div>
                              )}
                            </>
                          )}

                          <div className="mt-0 mb-[12px]">
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
                          <OnionFileUpload
                            {...field}
                            id="expBanerImage"
                            loader={false}
                            accept={"image/jpeg, image/png, image/webp"}
                            maxFileSize={2}
                            multiple={false}
                            autoUpload={false}
                            beginUpload={autoUpload}
                            onSelect={handleFileSelect}
                            buttonLabel={t(
                              "gen_expoUploadThumbnail_buttonText"
                            )}
                            buttonColor={"primary"}
                            uploadPath={bannerPath}
                            onProgress={handleProgress}
                            onFileUploadComplete={handleUploadComplete}
                            onSelectingDefectiveFiles={handleDefectiveFiles}
                            cropper={true}
                            aspectRatio={2.75 / 1}
                            onCropCancel={handleCropCancel}
                          />
                        </div>
                      </Box>
                    </FormControl>
                  )}
                />
              </div>
            </div>

            {/* Upload preview expImage */}

            <div className="pt-10 mb-10">
              <div className="py-10">
                <Typography
                  color="text.primary"
                  className="font-semibold text-[13px] block mb-6"
                >
                  {t("gen_expoUploadPreviewThumbnail_title")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  className="font-normal text-[11px] block"
                >
                  {t("gen_expoUploadPreviewThumbnail_subtitle")}
                </Typography>
              </div>

              <div className="py-20">
                <Controller
                  name="expImage"
                  control={control}
                  render={({ field }) => (
                    <FormControl className="w-full" error={!!errors.expImage}>
                      <Box
                        sx={{
                          Height: "100%",
                          maxHeight: "254px",
                          minHeight: "254px",
                          padding: "0",
                          border: "2px dashed",
                          borderColor: "#D9D9D9",
                        }}
                        className="text-center rounded-6 p-0 sm:max-w-[372px]"
                        role="button"
                      >
                        <div className="p-16 flex flex-col items-center">
                          {upLoadProgress?.id === "expImage" &&
                            upLoadProgress?.progress < 100 ? (
                            <UploadProgress
                              progress={upLoadProgress?.progress}
                            />
                          ) : (
                            <>
                              {prevData?.expImage ? (
                                <div className="min-h-[110px]">
                                  <img
                                    className="w-full mb-12 object-contain"
                                    style={{
                                      maxHeight: "112px",
                                      height: "100%",
                                    }}
                                    src={
                                      expoPreviewImage
                                        ? expoPreviewImage
                                        : prevData?.expImage === "default.webp"
                                          ? defaultExpoImageUrl(
                                            prevData?.expImage
                                          )
                                          : expoImageUrl(prevData?.expImage)
                                    }
                                    alt="admin logo"
                                  />
                                </div>
                              ) : (
                                <div className="">
                                  <FuseSvgIcon
                                    style={{
                                      opacity: "0.2",
                                    }}
                                    className="text-48"
                                    size={100}
                                    color="text.disabled"
                                  >
                                    heroicons-outline:plus-circle
                                  </FuseSvgIcon>
                                </div>
                              )}
                            </>
                          )}
                          {/* 
    {prevData?.expImage && (
    <span className="items-center">
    {prevData.expImage?.substring(
    prevData.expImage.lastIndexOf("/") + 1
    )}
    </span>
    )} */}
                          {/* <div className="flex flex-col justify-center items-center text-12 opacity-50">
    <text>{t("supportedFiles")}- JPG, JPEG, PNG</text>
    <text>({t("fileSizeMin")} 300X300)</text>
    </div> */}

                          <div className="mt-0 mb-[12px]">
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
                          <OnionFileUpload
                            {...field}
                            id="expImage"
                            loader={false}
                            accept={"image/jpeg, image/png, image/webp"}
                            maxFileSize={2}
                            multiple={false}
                            autoUpload={false}
                            beginUpload={autoUpload}
                            buttonLabel={t(
                              "gen_expoUploadThumbnail_buttonText"
                            )}
                            buttonColor={"primary"}
                            uploadPath={expoPath}
                            onProgress={handleProgress}
                            onFileUploadComplete={handleUploadComplete}
                            onSelectingDefectiveFiles={handleDefectiveFiles}
                            onSelect={handleFileSelect}
                            cropper={true}
                            aspectRatio={1.63 / 1}
                            onCropCancel={handleCropCancel}
                          />
                        </div>
                      </Box>
                    </FormControl>
                  )}
                />
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
              <div className="pt-10">
                <Controller
                  name="expTermsConditionIsEnabled"
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
                        label={t("gen_expoTermNconditions_enable")}
                      />
                      <OnionCustomRadioButton
                        value="false"
                        label={t("gen_expoTermNconditions_disable")}
                      />
                    </RadioGroup>
                  )}
                />
                {errors.expTermsConditionIsEnabled && (
                  <Typography color="error">
                    {t(errors.expTermsConditionIsEnabled.message)}
                  </Typography>
                )}
              </div>
              {expTermsConditionIsEnabled === true && (
                <div className="pt-10">
                  <Controller
                    name="expTermsAndConditions"
                    control={control}
                    render={({ field }) => (
                      <WYSIWYGEditor className="mt-8 mb-16" {...field} />
                    )}
                  />
                  {errors.expTermsAndConditions && (
                    <Typography color="error">
                      {t(errors.expTermsAndConditions.message)}
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
                disabled={isRequestInProgress}
              >
                <span className="">{t("gen_expoSaveButton")}</span>
              </Button>
            </div>

            {/* </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default General;
