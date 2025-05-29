import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  styled,
  TextField,
} from "@mui/material";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { useDebounce } from "@fuse/hooks";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "@lodash";
import { BasicSettingsUpdateAPI } from "./apis/Basic-Settings-Update-Api";
import GeneralSettingsHeader from "../GeneralSettingsHeader";
import Header from "./Header";
import { SettingsApi } from "../../SettingsApi";
import { useEffect, useState } from "react";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { CircularProgressWithLabel } from "app/shared-components/onion-file-upload/utils/progressBars";
import OnionPageOverlay from "app/shared-components/components/OnionPageOverlay";
import { convertImageToDataURL } from "app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper";
import {
  defaultLogoImageUrl,
  getLogoPath,
  logoImageUrl,
  logoPath,
} from "src/utils/urlHelper";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import LocalCache from "src/utils/localCache";
import { getSettings } from "src/utils/settingsLibrary";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";

const defaultValues = {
  logo: "",
  favicon: "",
  companyName: "",
  address: "",
};

type PrevFormData = {
  logo: string;
  favicon: string;
  companyName: string;
  address: string;
};

function BasicSettingsContent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [prevData, setPrevData] = useState<PrevFormData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [upLoadProgress, setUploadProgress] = useState<any>();
  const [autoUpload, setAutoUpload] = useState<boolean>(false);
  const [fileQueue, setFileQueue] = useState({});
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [logoPreviewImage, setLogoPreviewimage] = useState("");
  const [faviconPreviewImage, setFaviconPreviewimage] = useState("");
  let tenantId = localStorage.getItem("tenant_id");
  const [isLogoError, setIsLogoError] = useState<boolean>(false);
  const [isFaviconError, setIsFaviconError] = useState<boolean>(false);
  const [imageFileErrors, setImageFileErrors] = useState({});

  const schema = z.object({
    logo: z.string().min(1, "youMustUploadALogo"),
    favicon: z.string().min(1, "youMustUploadAIcon"),
    companyName: z
      .string()
      .min(1, "youMustEnterACompanyName")
      .refine((value) => value.trim() !== "", {
        message: "inputCannotBeEmptyOrJustWhitespace",
      })
      .refine(
        (value) => !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value),
        { message: 'basic_companyname_url_alert' }
      ),
    address: z
      .string()
      .min(1, "youMustEnterACompanyAddress")
      .refine((value) => value.trim() !== "", {
        message: "inputCannotBeEmptyOrJustWhitespace",
      }),
  });

  const { control, formState, handleSubmit, getValues, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { errors } = formState;

  const getBasicData = async () => {
    // LocalCache.deleteItem(cacheIndex.settings)
    // await LocalCache.getItem(cacheIndex.settings, get) 
    const basicData = await SettingsApi({ settingsKey: "basic" });
    if (basicData) {
      setPrevData(basicData);
    }
  };

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

  useEffect(() => {
    getBasicData();
  }, []);

  useEffect(() => {
    if (prevData) {
      setValue("logo", `${prevData?.logo}` || "");
      setValue("favicon", `${prevData?.favicon}` || "");
      setValue("companyName", `${prevData?.companyName}` || ``);
      setValue("address", `${prevData?.address}` || "");
    }
  }, [prevData]);

  const handleUpdate = useDebounce(() => {
    dispatch(
      showMessage({
        message: `${t("basicSettingsUpdated")}`,
        variant: "success",
      })
    );
    setFileQueue({});
    setIsLoading((prev) => !prev);
  }, 300);

  const onSubmit = async (data) => {
    setIsRequestInProgress(true);
    if (Object.keys(fileQueue).length > 0) {
      setPrevData(data);
      setAutoUpload(true);
    } else {
      onSubmitProceed(data);
    }
  };

  const handleUploadComplete = async (result: {
    status: string;
    message: string;
    data: any;
    id: string;
  }) => {
    const _result = await result?.data;

    if (result.id === "logo") {
      const updatedLogoUrl = `${_result?.data}?v=${new Date().getTime()}`;
      setValue("logo", updatedLogoUrl);
    }

    if (result.id === "favicon") {
      const updatedLogoUrl = `${_result?.data}?v=${new Date().getTime()}`;
      setValue("favicon", updatedLogoUrl);
      //setFaviconPreviewimage("");
    }

    setPrevData((prev) => ({
      ...prev,
      logo: result.id === "logo" ? _result?.data : prev?.logo,
      favicon: result.id === "favicon" ? _result?.data : prev?.favicon,
    }));
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[result.id] = true;
      return _prev;
    });
  };

  const handleProgress = (progress: {}) => {
    setUploadProgress(progress);
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

  const handleDefectiveFiles = ({ files }) => {
    dispatch(showMessage({ message: t('fileUpload_error_message'), variant: 'error' }));
  };

  const handleFileSelect = (files) => {
    if (files.identifier === "logo") {
      setIsLogoError(false);
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(
          files.files[fileKey]["file"],
          setLogoPreviewimage
        );
        break;
      }
    }

    if (files.identifier === "favicon") {
      setIsFaviconError(false);
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(
          files.files[fileKey]["file"],
          setFaviconPreviewimage
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

  const onSubmitProceed = async (data) => {
    try {
      const response = await BasicSettingsUpdateAPI(data);
      const result = response?.data;
      if (result) {
        await LocalCache.deleteItem(`${tenantId}_basic`, "settings");
        handleUpdate();
      }
      setIsRequestInProgress(false);
      setAutoUpload(false);
      setIsLoading((prev) => !prev);
    } catch (err) {
      const errorMesssage = err?.response?.data?.message;

      if (errorMesssage) {
        dispatch(
          showMessage({
            message: errorMesssage || "Settings not found",
            variant: "error",
          })
        );
        setIsLoading((prev) => !prev);
      }
    }
  };

  const handleCropCancel = (identifier) => {
    if (identifier === "logo") {
      // setLogoPreviewimage("");
    }

    if (identifier === "favicon") {
      // setFaviconPreviewimage("");
    }
  };

  const handleFaviconError = () => {
    setIsFaviconError(true);
  }

  const handleLogoError = () => {
    setIsLogoError(true);
  }

  return (
    <OnionPageOverlay>
      <GeneralSettingsHeader
        title={t("Basic Settings")}
        subTitle={t("Basic Settings")}
      />
      <form
        spellCheck="false"
        name="basicSettingsForm"
        noValidate
        className="mt-10 flex w-full flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="flex w-full flex-col">
          <Header
            label={t("logoSettings")}
            content={t("logoSettingsHelperText")}
          />
          <div className="flex-cole md:flex md:space-y-0 space-y-5 md:space-x-16 mt-16 justify-center items-center">
            <Controller
              name="logo"
              control={control}
              render={({ field }) => (
                <FormControl className="w-full md:w-1/2" error={!!errors.logo}>
                  <Box
                    sx={{
                      borderColor: "divider",
                    }}
                    className="flex flex-col space-y-20 items-center justify-center w-full h-[298px] rounded-lg cursor-pointer border-3 border-gray-400 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
                    role="button"
                  >
                    {upLoadProgress?.id === "logo" &&
                      upLoadProgress?.progress < 100 ? (
                      <UploadProgress progress={upLoadProgress?.progress} />
                    ) : (
                      <>
                        {prevData?.logo && !isLogoError ? (
                          <div className="min-h-[110px]">
                            <img
                              className="w-full mb-12 object-contain"
                              style={{
                                maxHeight: "112px",
                                height: "100%",
                              }}
                              src={
                                logoPreviewImage
                                  ? logoPreviewImage
                                  : prevData?.logo === "default.webp"
                                    ? defaultLogoImageUrl(prevData?.logo)
                                    : logoImageUrl(prevData?.logo, tenantId) +
                                    `?v=${new Date().getTime()}`
                              }
                              alt="admin logo"
                              onError={handleLogoError}
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
                    <div className="flex flex-col justify-center items-center text-12 opacity-50">
                      <text>{t("supportedFiles")}- PNG</text>
                      <text>({t("fileSizeMax")} 2 MB)</text>
                    </div>
                    <OnionFileUpload
                      {...field}
                      id="logo"
                      loader={false}
                      accept={"image/png"}
                      maxFileSize={2}
                      multiple={false}
                      autoUpload={false}
                      beginUpload={autoUpload}
                      onSelect={handleFileSelect}
                      buttonLabel={t("uploadLogo")}
                      buttonColor={"primary"}
                      uploadPath={getLogoPath(tenantId)}
                      onProgress={handleProgress}
                      onFileUploadComplete={handleUploadComplete}
                      onSelectingDefectiveFiles={handleDefectiveFiles}
                      cropper={true}
                      onCropCancel={handleCropCancel}
                      fileName={tenantId ? tenantId : "ci_tenant_dev"}
                    />
                  </Box>
                </FormControl>
              )}
            />
            {/* <Controller
              name="favicon"
              control={control}
              render={({ field }) => (
                <FormControl
                  className="w-full md:w-1/2"
                  error={!!errors.favicon}
                >
                  <Box
                    sx={{
                      borderColor: "divider",
                    }}
                    className="flex flex-col space-y-20 items-center justify-center w-full h-[298px] rounded-lg cursor-pointer border-3 border-gray-400 border-dashed hover:bg-hover transition-colors duration-150 ease-in-out"
                    role="button"
                  >
                    {upLoadProgress?.id === "favicon" &&
                      upLoadProgress?.progress < 100 ? (
                      <UploadProgress progress={upLoadProgress?.progress} />
                    ) : (
                      <>
                        {prevData?.favicon && !isFaviconError ? (
                          <div className="min-h-[110px]">
                            <img
                              className="w-full mb-12 object-contain"
                              style={{
                                maxHeight: "112px",
                                height: "100%",
                              }}
                              src={
                                faviconPreviewImage
                                  ? faviconPreviewImage
                                  : prevData?.favicon === "default.webp"
                                    ? defaultLogoImageUrl(prevData?.favicon)
                                    : logoImageUrl(prevData?.favicon, tenantId) +
                                    `?v=${new Date().getTime()}`
                              }
                              alt="admin logo"
                              onError={handleFaviconError}
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
                    <div className="flex flex-col justify-center items-center text-12 opacity-50">
                      <text>{t("supportedFiles")}- PNG</text>
                      <text>({t("fileSizeMax")} 2 MB)</text>
                    </div>
                    <OnionFileUpload
                      {...field}
                      id="favicon"
                      loader={false}
                      accept={"image/png"}
                      maxFileSize={5}
                      multiple={false}
                      autoUpload={false}
                      beginUpload={autoUpload}
                      onSelect={handleFileSelect}
                      buttonLabel={t("uploadFavicon")}
                      buttonColor={"primary"}
                      uploadPath={getLogoPath(tenantId)}
                      onProgress={handleProgress}
                      onFileUploadComplete={handleUploadComplete}
                      onSelectingDefectiveFiles={handleDefectiveFiles}
                      cropper={true}
                      aspectRatio={1 / 1}
                      onCropCancel={handleCropCancel}
                    />
                  </Box>
                </FormControl>
              )}
            /> */}
          </div>
        </div>
        <div className="w-full flex space-y-28 flex-col">
          <Header
            label={t("organisationSettings")}
            content={t("organisationSettingsHelperText")}
          />
          <Controller
            name="companyName"
            control={control}
            render={({ field }) => (
              <FormControl className="space-y-20 md:w-1/3">
                <TextField
                  {...field}
                  id="outlined-basic"
                  label={t("companyName")}
                  variant="outlined"
                  error={!!errors.companyName}
                  helperText={t(errors?.companyName?.message)}
                />
              </FormControl>
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormControl className="space-y-20 md:w-1/3">
                <TextField
                  {...field}
                  id="outlined-multiline-static"
                  label={t("companyAddress")}
                  multiline
                  rows={6}
                  error={!!errors.address}
                  helperText={t(errors?.address?.message)}
                />
              </FormControl>
            )}
          />
        </div>
        <div className="flex md:w-1/2 justify-end mt-16 ">
          <Button
            type="submit"
            className="mx-4 rounded-[10px] font-medium uppercase "
            variant="contained"
            color="primary"
            disabled={isLoading || autoUpload}
          >
            {isRequestInProgress === true ? (
              <CircularProgress size={25} color="inherit" />
            ) : (
              t("common_save")
            )}
          </Button>
        </div>
      </form>
    </OnionPageOverlay>
  );
}

export default BasicSettingsContent;