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
  Typography,
  Box,
  useTheme,
  Avatar,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl } from "@mui/base";
import { useTranslation } from "react-i18next";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import CountryCodeSelector from "./phone-number-selector/CountryCodeSelector";
import { selectUser, setUser } from "../../../../auth/user/store/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getUserAPI, getUserDetailsByIdAPI, userProfileUpdate } from "./apis/UserAPI";
import { COUNTRIES } from "./store/countries";
import GeneralSettingsHeader from "../GeneralSettingsHeader";
import Header from "../basic-settings/Header";
import { useEffect, useMemo, useState } from "react";
import OnionPageOverlay from "app/shared-components/components/OnionPageOverlay";
import { getProfileFields } from "src/app/main/user-dashboard/api/profile-fields-api";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { setState, userUpdateSelector, } from "./ProfileSettingsSlice";
import { useAuth } from "src/app/auth/AuthRouteProvider";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getSettings, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { useProfileDispatch } from "../../user-settings/profile-field-settings/ProfileFieldSettingsSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { customFilePath, customFileUrl, defaultUserImageUrl, userImageUrl } from "src/utils/urlHelper";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { convertImageToDataURL } from "app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper";
import { useIsMobile } from "src/utils/useIsMobile";

const defaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  country: ""
};

type FormType = {
  firstName: string;
  lastName: string;
  email: string;
  country?: string;
};

const FIELD_TYPES = {
  INPUT: "input",
  SELECT: "select",
  DATE: "date",
  DATETIME: "datetime",
  PHONENUMBER: "phoneNumber",
  FILE: "file",
};

type userDetails = {
  firstName: string;
  lastName: string;
  email: string;
  userImage: string
  profileFields: any;
}

function ProfileSettingsContent() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [profileFields, setProfileFields] = useState([]);
  const [userId, setUserId] = useState('');
  const state = userUpdateSelector((state) => state.state.value)
  const user = useAppSelector(selectUser);
  const { t } = useTranslation('profileSettings');
  const { updateUser } = useAuth();
  const queryClient = new QueryClient();
  const dispatchRefresh = useProfileDispatch();
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [customFileNames, setCustomFileNames] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [autoUpload, setAutoUpload] = useState(false);
  const [fileQueue, setFileQueue] = useState({});
  const [userDetails, setUserDetails] = useState<userDetails | null>(null);
  const theme = useTheme();
  const [image, setImage] = useState("");
  const [userImagePath, setUserImagePath] = useState('');
  const [userPreviewImage, setUserPreviewImage] = useState(defaultUserImageUrl('default.webp'));
  const [userFormData, setUserFormData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState<any>();
  const [upLoadImageProgress, setUploadImageProgress] = useState<any>();
  const [imageFileErrors, setImageFileErrors] = useState({});
  const [downloadable, setDownloadable] = useState([]);
  const [isHovered, setIsHovered] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const isMobile = useIsMobile();
  const createInputFieldSchema = (field) => {
    let _schema;
    switch (field.pFValidation.type) {
      case "text":
        if (field?.pFRequired) {
          _schema = z
            .string()
            .nonempty(
              field?.pFValidation?.errorMessage ||
              `${field.pFLabel} is required`
            );
        } else {
          _schema = z.any();
        }
        break;
      case "number":
        _schema = z
          .string()
          .optional()
          .refine(
            (value) => {
              if (field?.pFRequired) {
                return value === "" ? false : isNaN(value) ? false : true;
              } else {
                return true;
              }
            },
            field?.pFValidation?.errorMessage ||
            `${field.pFLabel} must be a number`
          );
        break;
      case "email":
        _schema = z.string().refine(
          (value) => {
            try {
              if (field?.pFRequired || value) {
                const regex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
                return regex.test(value);
              } else {
                return true;
              }
            } catch (e) {
              return false;
            }
          },
          {
            message:
              field?.pFValidation?.errorMessage ||
              `${field.pFLabel} must be a valid email`,
          }
        );
        break;
      case "url":
        _schema = z.string().refine(
          (value) => {
            try {
              if (field?.pFRequired || value) {
                return new URL(value);
              } else {
                return true;
              }
            } catch (e) {
              return false;
            }
          },
          {
            message:
              field?.pFValidation?.errorMessage ||
              `${field.pFLabel} must be a valid URL`,
          }
        );
        break;
      case "custom":
        _schema = z.string().refine(
          (value) => {
            try {
              if (field?.pFRequired || value) {
                const regex = new RegExp(field?.pFValidation?.regexPattern);
                return regex.test(value);
              } else {
                return true;
              }
            } catch (e) {
              return false;
            }
          },
          {
            message:
              field?.pFValidation?.errorMessage ||
              `${field.pFLabel} is invalid`,
          }
        );
        break;
      default:
        _schema = z.any();
        break;
    }
    return _schema;
  };

  const unifyFieldName = (fieldName) => {
    return "__customfield__" + fieldName;
  };

  const getFormFieldSchema = (customFields) => {
    const dynamicFieldSchema = customFields?.reduce((acc, field) => {
      if (field.pFStatus === 1) {
        switch (field.pFType) {
          case FIELD_TYPES.INPUT:
            acc[unifyFieldName(field.pFColumName)] =
              createInputFieldSchema(field);
            break;
          case FIELD_TYPES.SELECT:
            let selectOptions = Object.keys(field.pFData);
            if (!field.pFRequired) {
              selectOptions.push("");
            }
            if (selectOptions.length > 0) {
              acc[unifyFieldName(field.pFColumName)] = z.enum(selectOptions);
            }
            break;
          case FIELD_TYPES.DATE:
            if (field.pFRequired) {
              acc[unifyFieldName(field.pFColumName)] = z.union([
                z.date(),
                z.string().transform((dateString) => new Date(dateString)),
              ]).refine((date) => {
                // Validation logic
                let isValid = false;
                switch (field?.pFData?.dateTimeSettings) {
                  case "pastDate":
                    isValid = date instanceof Date && date < new Date();
                    break;
                  case "futureDate":
                    isValid = date instanceof Date && date > new Date();
                    break;
                  default:
                    isValid = date instanceof Date;
                    break;
                }
                return isValid;
              }, {
                message: field?.pFValidation?.errorMessage || `${field.pFLabel} is invalid`,
              });
            } else {
              acc[unifyFieldName(field.pFColumName)] = z.union([
                z.date().nullable(),
                z.string().transform((dateString) => new Date(dateString)).nullable(),
              ]).refine((date) => {
                // Validation logic
                if (date === null) return true; // Allow null value
                let isValid = false;
                switch (field?.pFData?.dateTimeSettings) {
                  case "pastDate":
                    isValid = date instanceof Date && date < new Date();
                    break;
                  case "futureDate":
                    isValid = date instanceof Date && date > new Date();
                    break;
                  default:
                    isValid = date instanceof Date;
                    break;
                }
                return isValid;
              }, {
                message: field?.pFValidation?.errorMessage || `${field.pFLabel} is invalid`,
              });
            }
            break;

          case FIELD_TYPES.DATETIME:
            if (field.pFRequired) {
              acc[unifyFieldName(field.pFColumName)] = z.union([
                z.date(),
                z.string().transform((dateString) => new Date(dateString)),
              ]).refine((date) => {
                let isValid = false;
                switch (field?.pFData?.dateTimeSettings) {
                  case "pastDate":
                    isValid = date instanceof Date && date < new Date();
                    break;
                  case "futureDate":
                    isValid = date instanceof Date && date > new Date();
                    break;
                  default:
                    isValid = date instanceof Date;
                    break;
                }
                return isValid;
              }, {
                message: field?.pFValidation?.errorMessage || `${field.pFLabel} is invalid`,
              });
            } else {
              acc[unifyFieldName(field.pFColumName)] = z.union([
                z.date().nullable(),
                z.string().transform((dateString) => new Date(dateString)).nullable(),
              ]).refine((date) => {
                if (date === null) return true; // Allow null value
                let isValid = false;
                switch (field?.pFData?.dateTimeSettings) {
                  case "pastDate":
                    isValid = date instanceof Date && date < new Date();
                    break;
                  case "futureDate":
                    isValid = date instanceof Date && date > new Date();
                    break;
                  default:
                    isValid = date instanceof Date;
                    break;
                }
                return isValid;
              }, {
                message: field?.pFValidation?.errorMessage || `${field.pFLabel} is invalid`,
              });
            }
            break;

          case FIELD_TYPES.PHONENUMBER:
            if (field.pFRequired) {
              const internationalPhoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
              acc[unifyFieldName(field.pFColumName)] = z
                .string()
                .regex(internationalPhoneNumberPattern, {
                  message:
                    field?.pFValidation?.errorMessage ||
                    "Please enter a valid phone number",
                });
            } else {
              acc[unifyFieldName(field.pFColumName)] = z
                .string()
                .optional()
                .refine(
                  (value) => {
                    if (field?.pFRequired || value) {
                      return value === undefined || !isNaN(value);
                    } else {
                      return true;
                    }
                  },
                  field?.pFValidation?.errorMessage ||
                  `${field.pFLabel} must be a number`
                );
            }
            break;
          default:
            break;
        }
      }
      return acc;
    }, {});
    return z
      .object({
        firstName: z.string().min(1, "profileSettings_firstNameRequiredMessage"),
        lastName: z.string().min(1, "profileSettings_lastNameRequiredMessage"),
        country: z.string().optional(),
        email: z.string().refine(
          (value) => {
            const regex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            return regex.test(value);
          },
          {
            message: "profileSettings_emailRequiredMessage",
          }
        ),
        // ...dynamicFieldSchema,
      })
  };

  const [schema, setSchema] = useState(() => getFormFieldSchema([]));

  useEffect(() => {
    getUserDetails();
    getProfieldData();
  }, [state]);

  const getProfieldData = async () => {
    const profileFields = await getProfileFields(import.meta.env.VITE_PROFILE_FIELD_TYPE);
    if (profileFields.data.length > 0) {
      setCustomFields(profileFields.data)
    }
  }

  const { control, formState, handleSubmit, watch, reset, setValue, getValues } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: useMemo(
      () => ({
        firstName: "",
        lastName: "",
        email: "",
        country: "",
        ...customFields?.reduce((acc, field) => {
          if (field.pFStatus === 1) {
            acc[unifyFieldName(field.pFColumName)] = "";
          }
          return acc;
        }, {}),
      }),
      [customFields]
    ),
  });

  const getUserDetails = async () => {
    let response = await getUserAPI({ id: user.uuid });
    // let response = await getUserDetailsAPI({id: user.uuid});
    if (response) {
      setUserDetails(response);
      const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
      const userImagePath = settings?.userPath;
      setUserImagePath(userImagePath);
    }
  };

  useEffect(() => {
    if (userDetails !== null) {
      if (customFields.length > 0) {
        setSchema(getFormFieldSchema(customFields));
      }
      setValue("firstName", userDetails?.firstName);
      setValue("lastName", userDetails?.lastName);
      setValue("email", userDetails?.email);
      setUserPreviewImage(userDetails.userImage !== 'default.webp' ? userImageUrl(userDetails?.userImage) : defaultUserImageUrl('default.webp'))
      if (userDetails.profileFields !== null) {
        if (customFields.length > 0) {
          customFields.forEach((field) => {
            if (field !== null && field.pFStatus === 1) {
              const fieldName = unifyFieldName(field.pFColumName);
              if (field.pFColumName in userDetails.profileFields) {
                if (field.pFType === 'phoneNumber') {
                  const phoneNumber = userDetails.profileFields[field.pFColumName];
                  const contactNumber = phoneNumber.split(" ");
                  const number = contactNumber[1];
                  const countryCode = contactNumber[0];
                  setValue('country', countryCode);
                  setValue(fieldName, number);
                } else if (field.pFType === 'file') {
                  if (fieldName && userDetails.profileFields[field.pFColumName]) {
                    setDownloadable((prev) => ({
                      ...prev,
                      [fieldName]: true,
                    })); setValue(fieldName, userDetails.profileFields[field.pFColumName]);
                    setCustomFileNames((prev) => ({
                      ...prev,
                      [fieldName]: userDetails.profileFields[field.pFColumName],
                    }));
                  } else {
                    setDownloadable((prev) => ({
                      ...prev,
                      [fieldName]: false,
                    }));
                  }
                } else {
                  setValue(fieldName, userDetails.profileFields[field.pFColumName]);
                }
              }
            }
          });
        }
      }
    }
  }, [customFields, reset, userDetails]);

  const { errors } = formState;

  const handleDefectiveFiles = (files) => {
    setImageFileErrors((errors) => {
      const _errors = { ...errors };
      for (const fileId in files) {
        if (files.hasOwnProperty(fileId)) {
          const file = files[fileId];
          _errors[file.identifier] = {
            error: true,
            message: `Invalid File`,
          };
        }
      }
      return _errors;
    });

    for (const fileId in files) {
      if (files.hasOwnProperty(fileId)) {
        const file = files[fileId];
        dispatch(showMessage({ message: `${file.defects}`, variant: "error" }));
      }
    }
  };

  const handleImageDefectiveFiles = (files) => {
    setImageFileErrors((errors) => {
      const _errors = { ...errors };
      for (const fileId in files) {
        if (files.hasOwnProperty(fileId)) {
          const file = files[fileId];
          _errors[file.identifier] = {
            error: true,
            message: `Invalid File`,
          };
        }
      }
      return _errors;
    });

    for (const fileId in files) {
      if (files.hasOwnProperty(fileId)) {
        const file = files[fileId];
        const defectsMessage = Array.isArray(file.defects)
          ? file.defects.join(', ')
          : file.defects;
        dispatch(showMessage({ message: defectsMessage, variant: "error" }));
      }
    }
  };

  const handleImageProgress = (progress: {}) => {
    setUploadImageProgress(progress);
  };

  const handleProgress = (progress: {}) => {
    setUploadProgress(progress);
  }

  const handleImageUploadComplete = async (result: {
    status: string;
    message: string;
    data: any;
    id: string;
  }) => {
    const _result = await result?.data;
    setImage(_result?.data)
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[result.id] = true;
      return _prev;
    });
    setUserPreviewImage("");
  };

  const handleFileSelect = (files) => {
    setCustomFileNames((prevFileNames) => {
      const _prevFileNames = { ...prevFileNames };
      for (const [fileId, fileObject] of Object.entries(files.files)) {
        _prevFileNames[files.identifier] = fileObject?.file?.name;
      }
      return _prevFileNames;
    });
    setFileErrors((errors) => {
      const _errors = { ...errors };
      if (typeof _errors[files.identifier] !== "undefined") {
        delete _errors[files.identifier];
      }
      return _errors;
    });
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[files.identifier] = false;
      return _prev;
    });
  };

  const onSubmit = async (data: FormType) => {
    if (Object.keys(fileQueue).length > 0) {
      setAutoUpload(true);
      setUserFormData(data);
    } else {
      onSubmitProceed(data);
    }
  }

  const onSubmitProceed = async (formData: FormType) => {
    setIsLoading(true)
    try {
      let missingFileIds = [];
      // if (customFields.length > 0) {
      //   for (const _eventCustomField of customFields) {
      //     if (_eventCustomField.pFType === "file") {
      //       if (
      //         (_eventCustomField.pFStatus === 1 &&
      //           _eventCustomField.pFRequired === 1 &&
      //           typeof fileQueue[unifyFieldName(_eventCustomField.pFColumName)] ===
      //           "undefined" && downloadable[unifyFieldName(_eventCustomField.pFColumName)] !== true)
      //       ) {
      //         missingFileIds.push(unifyFieldName(_eventCustomField.pFColumName));
      //         setMissingFields(missingFields);
      //         dispatch(showMessage({ message: t('profileField_customField_missing'), variant: 'error' }));
      //       }
      //     }
      //   }
      // }
      if (missingFileIds.length > 0) {
        setFileErrors((errors) => {
          const _errors = { ...errors };
          missingFileIds.map((missingFileId) => {
            _errors[missingFileId] = {
              error: true,
              message: `Invalid File`,
            };
          });
          return _errors;
        });
      } else {
        const customFieldsPayload = {};
        for (let [fieldKey, fieldValue] of Object.entries(formData)) {
          if (fieldKey.startsWith("__customfield__")) {
            const originalFieldKey = fieldKey.replace("__customfield__", "");
            const _eventCustomField = customFields.find(
              (field) => {
                return unifyFieldName(field.pFColumName) === fieldKey
              }
            );
            if (_eventCustomField?.pFType === 'phoneNumber') {
              const countryCode = formData.country;
              customFieldsPayload[originalFieldKey] = `${countryCode} ${fieldValue}`
            } else {
              customFieldsPayload[originalFieldKey] = fieldValue;
            }
          }
        }

        if (customFields.length > 0) {
          for (let [fieldKey, fieldValue] of Object.entries(customFields)) {
            if (fieldKey.startsWith("__customfield__")) {
              customFieldsPayload[fieldKey.replace("__customfield__", "")] =
                fieldValue;
            }
          }
        }

        for (let [fieldKey, fieldValue] of Object.entries(customFileNames)) {
          if (fieldKey.startsWith("__customfield__")) {
            customFieldsPayload[fieldKey.replace("__customfield__", "")] =
              fieldValue;
          }
        }
        const filtered_customFields = Object.fromEntries(
          Object.entries(customFieldsPayload).filter(([key, value]) => value !== undefined)
        );

        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          userImage: image !== "" ? image : userDetails?.userImage,
          profileFields: {
            name: formData.firstName + " " + formData.lastName,
            email: formData.email,
            ...filtered_customFields,
          }
        }

        const response = await userProfileUpdate(user.uuid, payload);
        if (response.updateCount > 0) {
          dispatch(
            showMessage({
              message: t('profileSettings_data_update_success'),
              variant: "success",
            })
          );
          const existingData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));

          const { profileFields, ...payloadWithoutProfileFields } = payload;
          const { userImage, email, firstName, lastName } = payloadWithoutProfileFields;

          if (existingData) {
            const updatedData = {
              ...existingData,
              data: {
                ...existingData.data,
                displayName: `${firstName} ${lastName}`,
                email,
                userImage,
                userTimeZone: existingData.data.userTimeZone
              }
            };
            await LocalCache.setItem('userData', updatedData);
            dispatchRefresh(setState(!state));
          }

          setIsLoading(false);
        }
      }
      setFileQueue({});
      setAutoUpload(false);
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
      setFileQueue({});
      setAutoUpload(false);
    } finally {
      setIsLoading(false)
    }
  };

  const handleImageSelect = (files) => {
    if (files.identifier === "userProfileImage") {
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(files.files[fileKey]['file'], setUserPreviewImage);
        break;
      }
    }
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[files.identifier] = false;
      return _prev;
    });
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
        onSubmitProceed(userFormData);
      }
    }
  }, [fileQueue]);

  const renderFormFields = () => {
    return customFields
      ?.filter((field) => field.pFStatus === 1)
      .map((_customField, index) => {
        const eventCustomFieldItem = [];
        switch (_customField.pFType) {
          case FIELD_TYPES.INPUT:
            eventCustomFieldItem.push(
              <div className="mb-[30px]" key={index}>
                <Controller
                  name={unifyFieldName(_customField.pFColumName)}
                  control={control}

                  render={({ field }) => (
                    <TextField
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: "2px",
                        },
                      }}
                      {...field}
                      value={field.value || ""}
                      label={_customField.pFLabel}
                      required={_customField.pFRequired === 1}
                      type="text"
                      error={
                        typeof errors[field.name] == "object" ? true : false
                      }
                      helperText={
                        typeof errors[field.name] == "object"
                          ? errors[field.name].message
                          : _customField.pFHelperText
                      }
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </div>
            );
            break;
          case FIELD_TYPES.SELECT:
            const selectOptions = _customField.pFData
              ? Object.keys(_customField.pFData).map((key) => ({
                key,
                value: _customField.pFData[key],
              }))
              : [];
            eventCustomFieldItem.push(
              <div className="mb-[30px]" key={index}>
                <FormControl>
                  <Controller
                    name={unifyFieldName(_customField.pFColumName)}
                    control={control}
                    render={({ field }) => (
                      <>
                        <TextField
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                            },
                          }}
                          required={_customField.pFRequired === 1}
                          select
                          label={
                            _customField.pFLabel || "Choose an option"
                          }
                          error={
                            typeof errors[field.name] == "object" ? true : false
                          }
                          helperText={
                            typeof errors[field.name] == "object"
                              ? _customField?.pFValidation?.errorMessage ||
                              errors[field.name].message
                              : _customField.pFHelperText
                          }
                          {...field}
                          value={field.value || ""}
                        >
                          <MenuItem key={""} value={""}>
                            {"Choose " + _customField.pFLabel ||
                              "Choose an option"}
                          </MenuItem>
                          {selectOptions.map((item) => (
                            <MenuItem key={item.key} value={item.key}>
                              {item.value}
                            </MenuItem>
                          ))}
                        </TextField>
                      </>
                    )}
                  />
                </FormControl>
              </div>
            );
            break;
          case FIELD_TYPES.FILE:
            const acceptedFileTypes =
              _customField.pFUploadParams?.fileType.length > 1
                ? _customField.pFUploadParams.fileType.join(", ")
                : _customField.pFUploadParams.fileType[0] || "*";
            eventCustomFieldItem.push(
              <div className="mb-12" key={index}>
                <div className="py-8">
                  <Typography
                    color="text.primary"
                    variant=""
                    className="font-semibold text-[13px] block mb-6"
                  >
                    {_customField.pFLabel}{" "}
                    {_customField.pFRequired === 1 && "*"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    className="font-normal text-[11px] block"
                  >
                    {_customField.pFHelperText ||
                      t("profileField_customField_uploadFile")}
                  </Typography>
                </div>
                <div className="py-20">
                  <Box
                    className="text-center rounded-6 sm:max-w-[372px]"
                    sx={{
                      Height: "100%",
                      padding: "0",
                      border: "2px dashed",
                      borderColor:
                        typeof fileErrors[
                          unifyFieldName(_customField.pFColumName)
                        ] !== "undefined" &&
                          fileErrors[unifyFieldName(_customField.pFColumName)]
                            .error === true
                          ? theme.palette.error.main
                          : theme.palette.divider,
                    }}
                  >
                    <div className="p-16 flex items-center justify-center flex-col">
                      <div className="relative">
                        {/* First Box */}
                        <Box
                          onMouseEnter={() => {
                            const fieldKey = unifyFieldName(_customField.pFColumName);
                            if (downloadable[fieldKey]) {
                              setIsHovered((prev) => ({
                                ...prev,
                                [fieldKey]: true,
                              }));
                            }
                          }}
                          onMouseLeave={() => {
                            const fieldKey = unifyFieldName(_customField.pFColumName);
                            setIsHovered((prev) => ({
                              ...prev,
                              [fieldKey]: false,
                            }));
                          }}
                          sx={{
                            background: "#F8F6FD",
                            borderRadius: "50px",
                            width: "80px",
                            height: "80px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                          onClick={() => {
                            const fieldKey = unifyFieldName(_customField.pFColumName);
                            const fileUrl = customFileUrl(userDetails.profileFields[_customField.pFColumName]);

                            if (fileUrl) {
                              fetch(fileUrl)
                                .then(response => {
                                  if (!response.ok) throw new Error('Network response was not ok');
                                  return response.blob();
                                })
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = fileUrl.split('/').pop(); // Set filename
                                  document.body.appendChild(link);
                                  link.click();
                                  link.remove(); // Clean up the link
                                  window.URL.revokeObjectURL(url); // Release the object URL
                                })
                                .catch(error => {
                                  console.error('Error downloading file:', error);
                                });
                            } else {
                              console.error('File URL is invalid or does not exist.');
                            }
                          }}
                        >
                          {/* Conditional Icon Rendering */}
                          {downloadable[unifyFieldName(_customField.pFColumName)] ? (
                            isMobile ? (
                              // On mobile, only show the download icon
                              <FuseSvgIcon size={40} color="primary.main">
                                heroicons-outline:download
                              </FuseSvgIcon>
                            ) : (
                              // On desktop, show hover effect with conditional icons
                              <>
                                {isHovered[unifyFieldName(_customField.pFColumName)] ? (
                                  <Box
                                    sx={{
                                      background: "rgba(0, 0, 0, 0.6)",
                                      borderRadius: "50px",
                                      width: "80px",
                                      height: "80px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      cursor: "pointer",
                                      transition: "opacity 0.3s ease-in-out",
                                    }}
                                  >
                                    <FuseSvgIcon size={40} color="common.white">
                                      heroicons-outline:download
                                    </FuseSvgIcon>
                                  </Box>
                                ) : (
                                  <FuseSvgIcon size={40} color="primary.main">
                                    feather:file
                                  </FuseSvgIcon>
                                )}
                              </>
                            )
                          ) : (
                            <FuseSvgIcon
                              style={{
                                opacity: "0.2",
                              }}
                              className="text-48 mx-auto"
                              size={70}
                              color="text.disabled"
                            >
                              heroicons-outline:plus-circle
                            </FuseSvgIcon>
                          )}
                        </Box>
                      </div>

                      <div className="my-10">
                        <Typography
                          variant="caption"
                          color="primary.main"
                          className="font-semibold text-[12px] block"
                        >
                          {customFileNames &&
                            customFileNames[unifyFieldName(_customField.pFColumName)] &&
                            (customFileNames[unifyFieldName(_customField.pFColumName)].length > 45
                              ? `...${customFileNames[unifyFieldName(_customField.pFColumName)].slice(-45)}`
                              : customFileNames[unifyFieldName(_customField.pFColumName)]
                            )}
                        </Typography>
                      </div>
                      <div className="mt-0 mb-[12px]">
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          className="font-normal text-[12px] block"
                        >
                          {t("profileField_customField_supportedFile")} - {" "}
                          {acceptedFileTypes}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          className="font-normal text-[11px] block"
                        >
                          {_customField?.pFUploadParams?.maxFileSize &&
                            "File size max " +
                            _customField?.pFUploadParams?.maxFileSize +
                            " MB"}
                        </Typography>
                      </div>
                      <OnionFileUpload
                        id={unifyFieldName(_customField.pFColumName)}
                        loader={false}
                        accept={acceptedFileTypes}
                        maxFileSize={
                          _customField?.pFUploadParams?.maxFileSize || 1
                        }
                        multiple={false}
                        autoUpload={autoUpload}
                        buttonClass={"imageUpload"}
                        uploadPath={customFilePath}
                        onSelect={handleFileSelect}
                        onProgress={handleProgress}
                        onFileUploadComplete={handleUploadComplete}
                        onSelectingDefectiveFiles={handleDefectiveFiles}
                      />
                    </div>
                  </Box>
                </div >
              </div >
            );
            break;
          case FIELD_TYPES.PHONENUMBER:
            eventCustomFieldItem.push(
              <div className="mb-[30px]" key={index}>
                <Controller
                  control={control}
                  name={unifyFieldName(_customField.pFColumName)}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value || ""}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderWidth: "2px",
                        },
                      }}
                      label={_customField.pFLabel}
                      placeholder={
                        _customField.pFPlaceholder || "Contact Number"
                      }
                      required={_customField.pFRequired === 1}
                      variant="outlined"
                      fullWidth
                      error={
                        typeof errors[field.name] === "object"
                      }
                      helperText={
                        typeof errors[field.name] === "object"
                          ? errors[field.name].message
                          : _customField.pFHelperText
                      }
                      InputProps={{
                        startAdornment: (
                          <Controller
                            control={control}
                            name="country"
                            render={({ field: _field }) => (
                              <InputAdornment position="start">
                                <CountryCodeSelector {..._field} value={getValues("country")}
                                  onChange={(value) => {
                                    setValue("country", value);
                                  }} />
                              </InputAdornment>
                            )}
                          />
                        ),
                      }}
                    />
                  )}
                />
              </div>
            );
            break;
          case FIELD_TYPES.DATE:
            eventCustomFieldItem.push(
              <div className="mb-[30px]" key={index}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name={unifyFieldName(_customField.pFColumName)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        }}
                        disableFuture={_customField?.pFData?.dateTimeSettings === "pastDate"}
                        disablePast={_customField?.pFData?.dateTimeSettings === "futureDate"}
                        label={_customField.pFLabel || "Choose Date"}
                        slotProps={{
                          textField: {
                            helperText:
                              typeof errors[
                                unifyFieldName(_customField.pFColumName)
                              ] == "object"
                                ? errors[
                                  unifyFieldName(_customField.pFColumName)
                                ].message
                                : _customField.pFHelperText,
                            error:
                              !!errors[
                              unifyFieldName(_customField.pFColumName)
                              ],
                            required: _customField.pFRequired === 1,
                            variant: "outlined",
                            fullWidth: true,
                          },
                        }}
                        value={value ? (typeof value === 'string' ? new Date(value) : value) : null}
                        onChange={onChange}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            );
            break;
          case FIELD_TYPES.DATETIME:
            eventCustomFieldItem.push(
              <div className="mb-[30px]" key={index}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name={unifyFieldName(_customField.pFColumName)}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        }}
                        disableFuture={_customField?.pFData?.dateTimeSettings === "pastDate"}
                        disablePast={_customField?.pFData?.dateTimeSettings === "futureDate"}
                        label={_customField.pFLabel || "Choose an date"}
                        slotProps={{
                          textField: {
                            helperText:
                              typeof errors[
                                unifyFieldName(_customField.pFColumName)
                              ] == "object"
                                ? errors[
                                  unifyFieldName(_customField.pFColumName)
                                ].message
                                : _customField.pFHelperText,
                            error:
                              !!errors[
                              unifyFieldName(_customField.pFColumName)
                              ],
                            required: _customField.pFRequired === 1,
                            variant: "outlined",
                            fullWidth: true,
                          },
                        }}
                        value={value ? (typeof value === 'string' ? new Date(value) : value) : null}
                        onChange={onChange}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            );
            break;
          default:
            return null;
        }
        return eventCustomFieldItem;
      });
  };

  const handleCropCancel = (identifier) => {
    if (identifier === 'userProfileImage') {
      setUserPreviewImage(userImageUrl(userDetails.userImage))
    }
  }

  const handleUploadComplete = async (result: {
    status: string;
    message: string;
    data: any;
    id: string;
  }) => {
    setFileQueue((prev) => {
      setCustomFileNames((prevFileNames) => ({
        ...prevFileNames,
        [result.id]: result?.data?.data,
      }));

      const _prev = { ...prev };
      _prev[result.id] = true;
      return _prev;
    });
  };

  const getUserImage = () => {
    if (userDetails !== null) {
      if (userDetails.userImage !== 'default.webp') {
        if (userDetails?.userImage?.length > 45) {
          return `...${userDetails.userImage.slice(-45)}`;
        }
        return userDetails?.userImage;
      }
      return '';
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
        <div className="flex flex-col space-y-14 md:w-1/2 ">
          <div>
            <div className="pt-[40px]">
              <Box
                component=""
                className="text-center  rounded-6  sm:max-w-[372px]"
                sx={{
                  Height: "100%",
                  maxHeight: "254px",
                  minHeight: "254px",
                  padding: "0",
                  border: "2px dashed",
                  borderColor: "#D9D9D9",
                }}
              >
                <div className="p-8">
                  <div className="min-h-[110px] flex items-center justify-center">
                    <div className="user-preview">
                      {/* {!uploadStatus &&
                            <Box sx={{ display: 'flex' }}>
                                <CircularProgress />
                            </Box>} */}
                      <div
                        id="imagePreview"
                        style={{ backgroundImage: `url(${userPreviewImage ? userPreviewImage : userImageUrl(image)})` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-0 mb-[16px]">
                    <Typography
                      variant="caption"
                      color="primary.main"
                      className="font-semibold text-[12px] block"
                    >
                      {getUserImage()}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[12px] block"
                    >
                      {t('profileField_supportedFiles')}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[11px] block"
                    >
                      {t('profileField_maxSize')}
                    </Typography>
                  </div>
                  <Controller
                    name="userProfileImage"
                    control={control}
                    defaultValue={null}
                    render={({ field: { onChange, value } }) => (
                      < OnionFileUpload
                        id="userProfileImage"
                        loader={false}
                        accept={"image/jpeg, image/png, image/webp"}
                        maxFileSize={2}
                        multiple={false}
                        autoUpload={autoUpload}
                        buttonClass={"imageUpload"}
                        onSelect={handleImageSelect}
                        buttonLabel={t(
                          "chooseImage"
                        )}
                        buttonColor={"primary"}
                        uploadPath={userImagePath}
                        onProgress={handleImageProgress}
                        onFileUploadComplete={handleImageUploadComplete}
                        onSelectingDefectiveFiles={handleImageDefectiveFiles}
                        cropper={true}
                        aspectRatio={1 / 1}
                        onCropCancel={handleCropCancel}
                      />
                    )}
                  />

                </div>
              </Box>
            </div>
          </div>
          <Box
            className="sm:max-w-[350px] pt-20 mb-28 md:mb-52 space-y-24 pe-10 "
            component="form"
            sx={{
              overflowY: "auto",
              "& .MuiTextField-root": {
                marginBottom: 0,
                width: "100%",
              },
            }}
          >

            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <TextField
                    {...field}
                    error={!!errors.firstName}
                    helperText={t(errors?.firstName?.message)}
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
              name="lastName"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <TextField
                    {...field}
                    error={!!errors.lastName}
                    helperText={t(errors?.lastName?.message)}
                    id="outlined-basic"
                    label={t("lastName")}
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
                    disabled
                    error={!!errors.email}
                    helperText={t(errors?.email?.message)}
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
            {/* {renderFormFields()} */}
          </Box>
        </div >
        <div className="flex md:w-2/3 justify-end mt-16 ">
          <Button
            type="submit"
            className="mx-4 rounded-[10px] font-medium uppercase "
            variant="contained"
            color="primary"
            disabled={isLoading || autoUpload}
          >
            {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("common_save")}
          </Button>
        </div>
      </form >
    </OnionPageOverlay >
  );
}

export default ProfileSettingsContent;












