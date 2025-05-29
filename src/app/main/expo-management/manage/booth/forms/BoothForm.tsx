import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { debounce } from "lodash";
import OnionSelector from "app/shared-components/components/OnionSelector";
import { t } from "i18next";
import React, { useEffect, useState, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { getBoothManagersList } from "../apis.ts/get-booth-managers-api";
import SearchableSelect from "app/shared-components/components/SearchableSelect";
import OnionDropdown from "app/shared-components/components/OnionDropdown";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/store/hooks";
import { useDebounce } from "@fuse/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { CircularProgressWithLabel } from "app/shared-components/onion-file-upload/utils/progressBars";
import { convertImageToDataURL } from "app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper";
import FuseLoading from "@fuse/core/FuseLoading";
import {
  bannerImageUrl,
  bannerPath,
  defaultBannerImageUrl,
  expoBoothLogoImageUrl,
} from "src/utils/urlHelper";
import { addBooth } from "../apis.ts/add-booth";
import { updateBooth } from "../apis.ts/update-booth";
import BoothList from "../BoothList";
import BoothListTable from "../BoothListTable";
import { getValue } from "@mui/system";
import { Warning } from "@mui/icons-material";
import WarningMessage from "../WarningMessge";
import { closeDialog, openDialog } from "@fuse/core/FuseDialog/fuseDialogSlice";
import OnionConfirmBox from "app/shared-components/components/OnionConfirmBox";

type FieldTypeArray = {
  name: string;
  value: string;
};

const defaultValues = {
  boothManager: "",
  boothManagerName: "",
  boothManagerEmail: "",
  boothManagerPhone: "",
  boothLogo1: "",
  boothLogo2: "",
  boothResources: [],
};

type FormData = {
  boothManager: string | null;
  boothManagerName: string;
  boothManagerEmail: string;
  boothManagerPhone: string;
  boothLogo1: string;
  boothLogo2: string;
  boothResources: { name: string; link: string }[];
};

type boothDetails = {
  boothCode?: string;
  boothManager: {
    id: string;
  };
  boothContact: {
    contact: string;
    email: string;
    name: string;
  };
  boothImages: {
    boothLogo1: string;
    boothLogo2: string;
  };
  boothResources: { files: { name: string; link: string }[] };
  expoCode?: string;
  id?: string;
  boothOrder: number;
};

type BoothFormProps = {
  indexNumber: number;
  boothDetails: {
    data: boothDetails;
  };
  expoDetails: {};
  setOpenWarning: (value: boolean) => void;
};

const BoothForm = React.forwardRef(
  ({ indexNumber, expoDetails, boothDetails }: BoothFormProps, ref) => {
    const { t } = useTranslation("booth");
    const dispatch = useAppDispatch();
    const [prevData, setPrevData] = useState<boothDetails>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [upLoadProgress, setUploadProgress] = useState<any>();
    const [autoUpload, setAutoUpload] = useState<boolean>(false);
    const [dataSaved, setDataSaved] = useState<boolean>(false);

    // Use React Query to fetch booth managers
    const {
      data: boothManagers,
      isLoading: boothManagerLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["boothManagers", import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID], // Use tenantId in the query key to ensure caching per tenant
      queryFn: async () => {
        const speakerDetails = await getBoothManagersList();
        return speakerDetails.map((speaker) => ({
          value: speaker._id,
          name: `${speaker.firstName} ${speaker.lastName}`,
          _id: speaker._id,
        }));
      },
      staleTime: 0,
      cacheTime: 10 * 60 * 1000, // Cache the data for 10 minutes
      retry: 2, // Retry the request up to 2 times if it fails
      refetchOnWindowFocus: false, // Avoid refetching when the window is focused
    });

    if (isError) {
      dispatch(
        showMessage({
          message: t("booth_manager_fetchError_message"),
          variant: "error",
        })
      );
    }

    useEffect(() => {
      if (boothDetails?.data) {
        setValue(
          "boothManager",
          boothDetails?.data?.boothManager
            ? boothDetails?.data?.boothManager?.id
            : ""
        );
        setValue(
          "boothManagerName",
          boothDetails?.data?.boothContact?.name
            ? boothDetails?.data?.boothContact?.name
            : ""
        );
        setValue(
          "boothManagerEmail",
          boothDetails?.data?.boothContact?.email
            ? boothDetails?.data?.boothContact?.email
            : ""
        );
        setValue(
          "boothManagerPhone",
          boothDetails?.data?.boothContact?.contact
            ? boothDetails?.data?.boothContact?.contact
            : ""
        );
        setValue(
          "boothLogo1",
          boothDetails?.data?.boothImages?.boothLogo1
            ? boothDetails?.data?.boothImages?.boothLogo1
            : ""
        );
        setValue(
          "boothLogo2",
          boothDetails?.data?.boothImages?.boothLogo2
            ? boothDetails?.data?.boothImages?.boothLogo2
            : ""
        );
        setValue(
          "boothResources",
          boothDetails?.data?.boothResources?.files
            ? boothDetails?.data?.boothResources?.files
            : []
        );
      }
    }, [boothDetails.data]);


    const internationalPhoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
    const schema = z.object({
      boothManagerName: z
        .string()
        .min(1, "booth_manager_name_required_message")
        .max(50, "booth_manager_name_max_length_message")
        .refine(
          (value) => !/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value),
          "booth_manager_name_email_invalid_message"
        )
        .refine(
          (value) => !/^(ftp|http|https):\/\/[^ "]+$/.test(value),
          "booth_manager_url_invalid_message"
        )
        .refine(
          (value) => !/^\s/.test(value),
          "booth_manager_name_leading_space_message"
        )
        .refine(
          (value) => value.trim().length > 0,
          "booth_manager_name_spaces_only_message"
        ),
      boothManagerEmail: z
        .string()
        .min(1, "booth_manager_email_required_message")
        .email("booth_manager_email_invalid_message"),
      boothLogo1: z.string().min(1, "expo_expoNameRequiredMessage"),
      boothLogo2: z.string().min(1, "expo_expoNameRequiredMessage"),
      boothManager: z
        .string()
        .nullable() // Accepts null values
        .refine((value) => value !== null && value.trim().length > 0, {
          message:
            "boothManagerRequiredMessage" || "Booth manager is required.",
        }),
      boothManagerPhone: z
        .string()
        .regex(internationalPhoneNumberPattern, {
          message: "booth_manager_phone_invalid_message",
        })
        .refine(
          (value) => value.trim().length > 0,
          "booth_manager_phone_required_message"
        ),
    });

    const {
      control,
      formState: { errors, isDirty },
      handleSubmit,
      setValue,
      getValues,
      clearErrors,
      trigger,
      watch,
    } = useForm({
      mode: "onChange",
      defaultValues,
      resolver: zodResolver(schema),
    });

    const handleWarningMessageShowing = async () => {
      if (dataSaved)
        dispatch(
          showMessage({
            message: t("booth_updated_message"),
            variant: "success",
          })
        );
      const isValid = await trigger();
      return isValid;
    };
    // Expose the function to the parent via ref
    useImperativeHandle(ref, () => ({
      handleWarningMessageShowing,
    }));

    const boothManagerWatch = watch("boothManager");
    const [localBoothResources, setLocalBoothResources] = useState(boothDetails?.data?.boothResources?.files ||[]);

    useEffect(() => {
      // Find the matching boothManager by _id
      const selectedBoothManager = boothManagers?.find(
        (manager) => manager._id === boothManagerWatch
      );

      // If a matching boothManager is found, set the name value
      if (selectedBoothManager && !boothDetails?.data) {
        setValue("boothManagerName", selectedBoothManager.name);
      }
    }, [boothManagerWatch]);

    useEffect(() => {
      if (Object.keys(errors).length > 0) {
        const firstError = Object.keys(errors)[0];
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, [errors]);

    // const handleUpdate = useDebounce(() => {
    //   dispatch(
    //     showMessage({
    //       message: t("Expo General Settings Updated Successfully"),
    //       variant: "success",
    //     })
    //   );
    //   setFileQueue({});
    //   setIsLoading((prev) => !prev);
    //   // getExpo();
    // }, 300);

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

      if (result.id === "boothLogo1") {
        setValue("boothLogo1", _result?.data);
        trigger("boothLogo1");
        dispatch(
          showMessage({ message: t("booth_logo_updated"), variant: "success" })
        );
      }

      if (result.id === "boothLogo2") {
        setValue("boothLogo2", _result?.data);
        trigger("boothLogo2");
        dispatch(
          showMessage({ message: t("booth_logo_updated"), variant: "success" })
        );
      }

      if (result.id === "boothResources") {
        const currentResources = getValues("boothResources") || [];

        // Create the updated resources list
        const updatedResources = [
          ...currentResources,
          { name: _result?.data, link: _result?.data },
        ];

        // Update the form state
        setValue("boothResources", updatedResources);

        // Update the local state for immediate UI update
        setLocalBoothResources(updatedResources);

        // Dispatch the success message
        dispatch(
          showMessage({
            message: t("booth_resources_updated"),
            variant: "success",
          })
        );
      }

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
          dispatch(
            showMessage({ message: `${errorMessage}`, variant: "error" })
          );
        }
      }
    };

    const [fileQueue, setFileQueue] = useState({});
    const [isRequestInProgress, setIsRequestInProgress] = useState(false);
    const [logo1PreviewImage, setLogo1PreviewImage] = useState("");
    const [logo2PreviewImage, setLogo2PreviewImage] = useState("");
    const handleFileSelect = (files) => {
      if (files.identifier === "boothLogo1") {
        for (let [fileKey, _file] of Object.entries(files.files)) {
          convertImageToDataURL(
            files.files[fileKey]["file"],
            setLogo1PreviewImage
          );
          break;
        }
      }

      if (files.identifier === "boothLogo2") {
        for (let [fileKey, _file] of Object.entries(files.files)) {
          convertImageToDataURL(
            files.files[fileKey]["file"],
            setLogo2PreviewImage
          );
          break;
        }
      }
      if (files.identifier === "boothResources") {
        for (let [fileKey, _file] of Object.entries(files.files)) {
          // convertImageToDataURL(
          //   files.files[fileKey]["file"],
          //   setLogo2PreviewImage
          // );
          break;
        }
      }
      setFileQueue((prev) => {
        const _prev = { ...prev };
        _prev[files.identifier] = false;
        return _prev;
      });
      // setAutoUpload(true)
    };
    const onSubmit = async (data) => {
      setIsRequestInProgress(true);
      if (Object.keys(fileQueue).length > 0) {
        setPrevData(data);
        setAutoUpload(true);
      } else {
        onSubmitProceed();
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
          onSubmitProceed();
        }
      }
    }, [fileQueue]);

    const isDataUnsaved = true; // Set this based on whether the form data is unsaved

    useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (isDataUnsaved) {
          trigger();
          event.preventDefault(); // Some browsers require this line
          event.returnValue = ""; // Chrome requires returnValue to be set
          return "Are you sure you want to leave? Your changes may not be saved.";
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      // Cleanup the event listener when the component unmounts
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, [isDataUnsaved]);

    // Warning when navigating away from the page
    const handleNavigationWarning = (event) => {
      if (
        isDirty &&
        !window.confirm("You have unsaved changes, do you want to leave?")
      ) {
        event.preventDefault();
      }
    };

    const handleDeleteBoothResources = async (index, name) => {
      dispatch(
        openDialog({
          children: (
            <OnionConfirmBox
              title={t("booth_delete_confirm_title")}
              subTitle={t("booth_delete_confirm_message")}
              onCancel={() => dispatch(closeDialog())}
              variant="warning"
              onConfirm={async () => {
                // Get the current booth resources
                const boothResources = [...localBoothResources]; // Use a copy for immutability
                // Remove the selected resource
                boothResources.splice(index, 1);
                // Update form state
                setValue("boothResources", boothResources);
                
                // Close the dialog
                dispatch(closeDialog());
                
                // Trigger any additional processing
                if (boothDetails?.data?.id) {
                  const response = await onSubmitProceed();
                  if(response) {
                    setLocalBoothResources(boothResources);
                  }
                } else {
                  setLocalBoothResources(boothResources);
                }
              }}
            />
          ),
        })
      );
    };

    useEffect(() => {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        // Display a message when the user tries to leave or reload the page
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      };

      // Add event listener for 'beforeunload'
      window.addEventListener("beforeunload", handleBeforeUnload);

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, []);

    const handleOnBlur = (fieldName) => {
      trigger(fieldName);
      onSubmitProceed();
    };

    const onSubmitProceed = async () => {
      const data: FormData = getValues();
      if (
        !data.boothLogo1 ||
        !data.boothLogo2 ||
        !data.boothManager ||
        !data.boothManagerEmail ||
        !data.boothManagerName ||
        !data.boothManagerPhone
      )
        return;
      const isValid = await trigger();
      if (!isValid) return;
      if (Object.keys(errors).length > 0) return;
      // return
      const payload: boothDetails = {
        boothManager: {
          id: data?.boothManager,
        },
        boothContact: {
          contact: data?.boothManagerPhone,
          email: data?.boothManagerEmail,
          name: data?.boothManagerName,
        },
        boothImages: {
          boothLogo1: data?.boothLogo1,
          boothLogo2: data?.boothLogo2,
        },
        boothResources: { files: data?.boothResources },
        boothCode: boothDetails?.componentName,
        expoCode: expoDetails?.expCode,
        boothOrder: indexNumber + 1,
      };

      if (!boothDetails?.data?.id) {
        const response = await addBooth(payload);
        if (response?.success) {
          boothDetails.data = response?.booth;
          setDataSaved(true);
          return true
        } else {
          setDataSaved(false);
          dispatch(
            showMessage({ message: response?.message, variant: "error" })
          );
          return false
        }
      } else {
        payload.id = boothDetails?.data?.id;
        const response = await updateBooth(payload);
        if (response?.success) {
          setDataSaved(true);
          boothDetails.data = response?.booth;
          return true
        } else {
          setDataSaved(false);
          dispatch(
            showMessage({ message: response?.message, variant: "error" })
          );
          return false
        }
      }
    };

    const handleCropCancel = (identifier) => {
      if (identifier === "boothLogo1") {
        setLogo1PreviewImage("");
      }

      if (identifier === "boothLogo2") {
        setLogo2PreviewImage("");
      }
    };

    if (isLoading) {
      return <FuseLoading />;
    }

    return (
      <div>
        <form
          name="boothForm"
          noValidate
          spellCheck={false}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* 1 */}
          <div className="mb-20">
            <Typography
              color="text.primary"
              variant=""
              className="font-semibold text-[13px] block mb-6"
            >
              {t("add_booth_manager_title")}
            </Typography>
            <Typography
              color="text.disabled"
              variant="caption"
              className="font-normal text-[11px] block mb-5 sm:max-w-[370px]"
            >
              {t("add_booth_manager_helper_text")}
            </Typography>

            <div className="py-10 ">
              <Box
                className="sm:max-w-[370px] mb-[30px]"
                sx={{
                  "& .MuiFormControl-root": {
                    width: "100%",
                  },
                }}
              >
                <Controller
                  name="boothManager"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <OnionDropdown
                      onChange={(selectedValue) => {
                        onChange(selectedValue);
                        handleOnBlur("boothManager");
                      }}
                      required
                      loading={boothManagerLoading}
                      data={boothManagers}
                      value={value}
                      label={t("booth_manager")}
                      error={!!errors?.boothManager}
                      helperText={t(errors?.boothManager?.message)}
                    />
                  )}
                />
              </Box>
            </div>

            <Typography
              color="text.primary"
              variant=""
              className="font-semibold text-[13px] block mb-6"
            >
              {t("organization_settings_title")}
            </Typography>
            <Typography
              color="text.disabled"
              variant="caption"
              className="font-normal text-[11px] block mb-5 sm:max-w-[370px]"
            >
              {t("organization_settings_helper_text")}
            </Typography>

            <div className="py-10 max-w-[368px]">
              <Controller
                name="boothManagerName"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    onBlur={() => {
                      handleOnBlur("boothManagerName");
                    }}
                    label={t("Name")}
                    required
                    type="text"
                    error={!!errors?.boothManagerName}
                    helperText={t(errors?.boothManagerName?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>

            <div className="py-10 max-w-[368px]">
              <Controller
                name="boothManagerEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    label={t("Email")}
                    required
                    onBlur={() => {
                      handleOnBlur("boothManagerName");
                    }}
                    type="email"
                    error={!!errors.boothManagerEmail}
                    helperText={t(errors?.boothManagerEmail?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>

            <div className="py-10 max-w-[368px]">
              <Controller
                name="boothManagerPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    label={t("phone")}
                    required
                    onBlur={() => {
                      handleOnBlur("boothManagerName");
                    }}
                    type="text"
                    error={!!errors.boothManagerPhone}
                    helperText={t(errors?.boothManagerPhone?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>
          </div>

          <Box sx={{ width: "100%", maxWidth: "766px", padding: "0" }}>
            {/* 2 */}
            <div className="mb-10">
              <div className="py-10">
                <Typography
                  color="text.primary"
                  className="font-semibold text-[13px] block mb-6"
                >
                  {t("logo_settings_title")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  className="font-normal text-[11px] block"
                >
                  {t("logo_settings_helper_text")}
                </Typography>
              </div>
              <div className="py-20">
                <Box sx={{ flexGrow: 1 }}>
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} sm={12} md={6}>
                      <Controller
                        name="boothLogo1"
                        control={control}
                        render={({ field }) => (
                          <FormControl
                            className="w-full"
                            error={!!errors?.boothLogo1}
                          >
                            <Box
                              sx={{
                                Height: "100%",
                                maxHeight: "254px",
                                minHeight: "254px",
                                padding: "0",
                                border: "2px dashed",
                                borderColor: !!errors?.boothLogo1
                                  ? "red"
                                  : "#D9D9D9",
                              }}
                              className="text-center rounded-6 p-0 sm:max-w-[372px]"
                              role="button"
                            >
                              <div className="p-16 flex flex-col items-center">
                                {upLoadProgress?.id === "boothLogo1" &&
                                upLoadProgress?.progress < 100 ? (
                                  <UploadProgress
                                    progress={upLoadProgress?.progress}
                                  />
                                ) : (
                                  <>
                                    {getValues("boothLogo1") ||
                                    logo1PreviewImage ? (
                                      <div className="min-h-[110px]">
                                        <img
                                          className="w-full mb-12 object-contain"
                                          style={{
                                            maxHeight: "112px",
                                            height: "100%",
                                          }}
                                          src={
                                            logo1PreviewImage
                                              ? logo1PreviewImage
                                              : expoBoothLogoImageUrl(
                                                  getValues("boothLogo1"),
                                                  expoDetails?.expTenantId
                                                )
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
                                    {t("supported_files")}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    className="font-normal text-[11px] block"
                                  >
                                    {t("max_logo_size")}
                                  </Typography>
                                </div>
                                <OnionFileUpload
                                  {...field}
                                  id="boothLogo1"
                                  loader={false}
                                  accept={"image/jpeg, image/png, image/webp"}
                                  maxFileSize={2}
                                  multiple={false}
                                  autoUpload={true}
                                  beginUpload={autoUpload}
                                  onSelect={handleFileSelect}
                                  buttonLabel={t("booth_choose_file")}
                                  buttonColor={"primary"}
                                  uploadPath={`uploads/ci/${expoDetails?.expTenantId}/booths/booth_images`}
                                  onProgress={handleProgress}
                                  onFileUploadComplete={handleUploadComplete}
                                  onSelectingDefectiveFiles={
                                    handleDefectiveFiles
                                  }
                                  cropper={true}
                                  aspectRatio={2.75 / 1}
                                  onCropCancel={handleCropCancel}
                                />
                              </div>
                            </Box>
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                      <Controller
                        name="boothLogo2"
                        control={control}
                        render={({ field }) => (
                          <FormControl
                            className="w-full"
                            error={!!errors?.boothLogo2}
                          >
                            <Box
                              sx={{
                                Height: "100%",
                                maxHeight: "254px",
                                minHeight: "254px",
                                padding: "0",
                                border: "2px dashed",
                                borderColor: !!errors?.boothLogo2
                                  ? "red"
                                  : "#D9D9D9",
                              }}
                              className="text-center rounded-6 p-0 sm:max-w-[372px]"
                              role="button"
                            >
                              <div className="p-16 flex flex-col items-center">
                                {upLoadProgress?.id === "boothLogo2" &&
                                upLoadProgress?.progress < 100 ? (
                                  <UploadProgress
                                    progress={upLoadProgress?.progress}
                                  />
                                ) : (
                                  <>
                                    {getValues("boothLogo2") ||
                                    logo2PreviewImage ? (
                                      <div className="min-h-[110px]">
                                        <img
                                          className="w-full mb-12 object-contain"
                                          style={{
                                            maxHeight: "112px",
                                            height: "100%",
                                          }}
                                          src={
                                            logo2PreviewImage
                                              ? logo2PreviewImage
                                              : expoBoothLogoImageUrl(
                                                  getValues("boothLogo2"),
                                                  expoDetails?.expTenantId
                                                )
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
                                    {t("supported_files")}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    className="font-normal text-[11px] block"
                                  >
                                    {t("max_logo_size")}
                                  </Typography>
                                </div>
                                <OnionFileUpload
                                  {...field}
                                  id="boothLogo2"
                                  loader={false}
                                  accept={"image/jpeg, image/png, image/webp"}
                                  maxFileSize={2}
                                  multiple={false}
                                  autoUpload={true}
                                  beginUpload={autoUpload}
                                  onSelect={handleFileSelect}
                                  buttonLabel={t("booth_choose_file")}
                                  buttonColor={"primary"}
                                  uploadPath={`uploads/ci/${expoDetails?.expTenantId}/booths/booth_images`}
                                  onProgress={handleProgress}
                                  onFileUploadComplete={handleUploadComplete}
                                  onSelectingDefectiveFiles={
                                    handleDefectiveFiles
                                  }
                                  cropper={true}
                                  aspectRatio={1 / 3}
                                  onCropCancel={handleCropCancel}
                                />
                              </div>
                            </Box>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </div>
            </div>

            {/* 3 */}
            <div className="mb-20">
              <Typography
                color="text.primary"
                variant=""
                className="font-semibold text-[13px] block mb-6"
              >
                {t("booth_resources_title")}
              </Typography>
              <Typography
                color="text.disabled"
                variant="caption"
                className="font-normal text-[11px] block"
              >
                {t("booth_resources_helper_text")}
              </Typography>

              <div className="py-20">
                <Controller
                  name="boothLogo1"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      className="w-full"
                      error={!!errors?.boothLogo1}
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
                          {upLoadProgress?.id === "boothLogo1" &&
                          upLoadProgress?.progress < 100 ? (
                            <UploadProgress
                              progress={upLoadProgress?.progress}
                            />
                          ) : (
                            <>
                              {false ? (
                                <div className="min-h-[110px]">
                                  <img
                                    className="w-full mb-12 object-contain"
                                    style={{
                                      maxHeight: "112px",
                                      height: "100%",
                                    }}
                                    src={""}
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
                              {t("booth_resources_allowable_file_format")}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              className="font-normal text-[11px] block"
                            >
                              {t("booth_resources_allowable_file_size")}
                            </Typography>
                          </div>
                          <OnionFileUpload
                            {...field}
                            id="boothResources"
                            loader={true}
                            accept={"any"}
                            maxFileSize={10}
                            multiple={true}
                            autoUpload={true}
                            beginUpload={autoUpload}
                            onSelect={handleFileSelect}
                            buttonLabel={t("booth_choose_file")}
                            buttonColor={"primary"}
                            uploadPath={`uploads/ci/${expoDetails?.expTenantId}/booths/booth_resources`}
                            onProgress={handleProgress}
                            onFileUploadComplete={handleUploadComplete}
                            onSelectingDefectiveFiles={handleDefectiveFiles}
                            cropper={true}
                            // aspectRatio={2.7 / 1}
                            onCropCancel={handleCropCancel}
                          />
                        </div>
                      </Box>
                    </FormControl>
                  )}
                />
              </div>
            </div>
          </Box>
          {localBoothResources.length > 0 && (
            <BoothListTable
              tenantId={expoDetails?.expTenantId}
              handleDelete={handleDeleteBoothResources}
              data={localBoothResources}
            />
          )}
        </form>
      </div>
    );
  }
);

export default BoothForm;
