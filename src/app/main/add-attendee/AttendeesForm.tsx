import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import ImageDetails from "app/shared-components/components/ImageDetails";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import LocalCache from "src/utils/localCache";
import {
  customFilePath,
  defaultExpoImageUrl,
  expoImageUrl,
} from "src/utils/urlHelper";
import { z } from "zod";
import _ from "lodash";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { getProfileFields } from "./apis/Get-Profile-Fields";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import CountryCodeSelector from "../settings/general-settings/profile-settings/phone-number-selector/CountryCodeSelector";
import {
  LocalizationProvider,
  DatePicker,
  DateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AddAttendee } from "./apis/Add-Attendee";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useTheme } from "@mui/material/styles";
import { selectUser } from "src/app/auth/user/store/userSlice";
import AddAttendeeSuccess from "./AddAttendeeSuccess";
import { resetSessionRedirectUrl } from "@fuse/core/FuseAuthorization/sessionRedirectUrl";
import { getCurrency } from "src/utils/currency";
import { getAttendeeCountAPI } from "../expo-management/manage/attendees/apis/Get-AttendeeCount-Api";
import { seatLimit } from "src/utils/seatLimit";
import { getTimeZoneSettings } from "src/utils/getSettings";
import { forReport } from "src/utils/dateformatter";

type Expos = {
  id: string;
  expName: string;
  expCreator: string;
  expDescription: string;
  expEndDate: string;
  expStartDate: string;
  expImage: string;
  expPrice: number;
  expCode: string;
  expMaxSeats: number;
  expTenantId: string;
  expIsSeatsUnlimited: boolean;
  expIsPaid: boolean;
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  paymentStatus: string;
  countryCode: string;
  paymentMode: string;
  price: number;
  transactionRemark: string;
};

type commonDataType = {
  name: string;
  value: string;
};

const FIELD_TYPES = {
  INPUT: "input",
  SELECT: "select",
  DATE: "date",
  DATETIME: "datetime",
  PHONENUMBER: "phoneNumber",
  FILE: "file",
};
function AttendeesForm() {
  const routeParams = useParams();
  const [expos, setExpos] = useState<Expos | null>(null);
  const { t } = useTranslation("attendees");
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [autoUpload, setAutoUpload] = useState(false);
  const [fileQueue, setFileQueue] = useState({});
  const [attendeeData, setAttendeeData] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileErrors, setFileErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [customFileNames, setCustomFileNames] = useState({});
  const theme = useTheme();
  const user = useAppSelector(selectUser);
  const [attendeeDetails, setAttendeeDetails] = useState<FormData | null>(null);
  const [attendeeAddingSuccess, setAttendeeAddingSuccess] = useState(false);
  const [currency, setCurrency] = useState('')
  const [attendeeCount, setAttendeeCount] = useState<number | 0>(0);
  const [expoMaxSeat, setExpoMaxSeat] = useState();
  const [isSeatFull, setIsSeatFull] = useState<boolean | true>(false);
  const [timeZone1, setTimeZone1] = useState("");

  const [availableSeats, setAvailableSeats] = useState<number>(0); // Ensuring state is a number
  const [isSeatsUnlimited, setIsSeatsUnlimited] = useState(false);
  const paymentMode: commonDataType[] = [
    { name: t("attendee_addAttendee_cash"), value: "cash" },
    { name: t("attendee_addAttendee_card"), value: "card" },
    { name: t("attendee_addAttendee_free"), value: "free" },
  ];

  const createInputFieldSchema = (field) => {
    let _schema;
    switch (field.pFValidation.type) {
      case "text":
        if (field?.pFRequired) {
          _schema = z
            .string()
            .nonempty(
              field?.pFValidation?.errorMessage ||
              `${field.pFLabel} ${'isRequired'}`
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
            `${field.pFLabel} ${t(`mustBeANumber`)}`
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
              `attendee_emailInvalidFormat`,
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
              `${field.pFLabel} ${`${t('validURL')}`}`,
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
              `${field.pFLabel} ${t('isInvalid')}`,
          }
        );
        break;
      default:
        _schema = z.any(); // Fallback for unhandled types
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
              acc[unifyFieldName(field.pFColumName)] = z.enum(selectOptions, {
                errorMap: () => ({ message: `${field.pFLabel} ${t('isRequired')}` }),
              });
            } else {
              acc[unifyFieldName(field.pFColumName)] = z.string().min(1, `${field.pFLabel} ${t('isRequired')}`);
            }
            break;
          case FIELD_TYPES.DATE:
            if (field.pFRequired) {
              acc[unifyFieldName(field.pFColumName)] = z
                .date({ message: `${field.pFLabel} ${t('isRequired')}` }) // Shows error when empty
                .refine(
                  (date) => {
                    if (!date) return false; // Ensure the date is provided
                    let isValid = false;
                    switch (field?.pFData?.dateTimeSettings) {
                      case "pastDate":
                        isValid = date < new Date();
                        break;
                      case "futureDate":
                        isValid = date > new Date();
                        break;
                      default:
                        isValid = date instanceof Date;
                        break;
                    }
                    return isValid;
                  },
                  {
                    message: field?.pFValidation?.errorMessage || `${field.pFLabel} ${t('isInvalid')}`,
                  }
                );
            } else {
              acc[unifyFieldName(field.pFColumName)] = z
                .date({ message: `${field.pFLabel} ${t('isRequired')}` })
                .nullable()
                .refine(
                  (date) => {
                    if (date === null) return true; // Allow null for non-required fields
                    let isValid = false;
                    switch (field?.pFData?.dateTimeSettings) {
                      case "pastDate":
                        isValid = date < new Date();
                        break;
                      case "futureDate":
                        isValid = date > new Date();
                        break;
                      default:
                        isValid = date instanceof Date;
                        break;
                    }
                    return isValid;
                  },
                  {
                    message: field?.pFValidation?.errorMessage || `${field.pFLabel} ${t('isInvalid')}`,
                  }
                );
            }

            break;
          case FIELD_TYPES.DATETIME:
            if (field.pFRequired) {
              acc[unifyFieldName(field.pFColumName)] = z.any({ message: `${field.pFLabel} ${t('isRequired')}` }).refine(
                (date) => {
                  try {
                    let isValid = false;
                    switch (field?.pFData?.dateTimeSettings) {
                      case "pastDate":
                        isValid = date && date < new Date();
                        break;
                      case "futureDate":
                        isValid = date > new Date();
                        break;
                      default:
                        isValid = date instanceof Date;
                        break;
                    }
                    return isValid;
                  } catch (e) {
                    return false;
                  }
                },
                {
                  message:
                    field?.pFValidation?.errorMessage ||
                    `${field.pFLabel} ${t('isInvalid')}`,
                }
              );
            } else {
              acc[unifyFieldName(field.pFColumName)] = z.any().nullable().refine(
                (date) => {
                  if (date !== null) {
                    try {
                      let isValid = false;
                      switch (field?.pFData?.dateTimeSettings) {
                        case "pastDate":
                          isValid = date && date < new Date();
                          break;
                        case "futureDate":
                          isValid = date > new Date();
                          break;
                        default:
                          isValid = date instanceof Date;
                          break;
                      }
                      return isValid;
                    } catch (e) {
                      return false;
                    }
                  } else {
                    return true;
                  }
                },
                {
                  message:
                    field?.pFValidation?.errorMessage ||
                    `${field.pFLabeautoUploadl} ${t('isInvalid')}`,
                }
              );
            }
            break;
          case FIELD_TYPES.PHONENUMBER:
            if (field.pFRequired) {
              const internationalPhoneNumberPattern = /^\+?[1-9]\d{1,14}$/;
              acc[unifyFieldName(field.pFColumName)] = z
                .string().min(1, `${t('phone_number_required')}`)
                .regex(internationalPhoneNumberPattern, {
                  message:
                    field?.pFValidation?.errorMessage || `${t('valid_phone_number_message')}`,
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
                  `${field.pFLabel} ${t('mustBeANumber')}`
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
        firstName: z.string().min(1, 'attendee_firstNameRequiredMessage'),
        lastName: z.string().min(1, 'attendee_lastNameRequiredMessage'),
        email: z.string().email('attendee_emailInvalidFormat'),
        countryCode: z
          .string()
          .optional(),
        price: z.coerce.number().optional(),
        paymentMode: z
          .string(),
        transactionRemark: z
          .string()
          .transform((val) => val.trim()),
        ...dynamicFieldSchema,
      }).refine((data) => {
        // If expo is paid, both price and paymentMode should be required
        if (expos.expIsPaid && data.paymentMode !== "free") {
          return data.paymentMode && data.price !== undefined;
        }
        return true; // If not paid, allow any values
      }, {
        message: t('attendee_paymentRequiredMessage'),
        path: ["paymentMode"], // Attach error to `paymentMode`
      })
      .refine((data) => {
        if (expos.expIsPaid && data.paymentMode !== "free") {
          return (data.price !== undefined && data.price !== null && data.price !== 0);
        }
        return true;
      }, {
        message: t('attendee_priceRequiredMessage'),
        path: ["price"], // Attach error to `price`
      })
      .refine(
        (data) => {
          if (data.paymentMode != "" && data.paymentMode !== "free") {
            if (data.price <= 0) {
              return false;
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
        {
          message: 'attendee_zero_validation',
          path: ["price"],
        }
      ).refine(
        (data) => {
          if (data.price !== expos.expPrice) {
            return !!data.transactionRemark?.trim();
          }
          return true;
        },
        {
          message: 'transactionRemark_price_validation_message',
          path: ["transactionRemark"],
        }
      ).refine((data) => {
        if (data.paymentMode === 'free') {
          return true;
        }
        return true;
      }, {
        message: 'transactionRemark_paymentMode_validation_message',
        path: ["transactionRemark"]
      });
  };

  const [schema, setSchema] = useState(() => getFormFieldSchema([]));

  useEffect(() => {
    loadDependencies();
    resetSessionRedirectUrl();
    fetchCurrency();
    getInitialDetails();
    getLocation();
  }, []);

  const getLocation = async () => {
    const timeZone = await getTimeZoneSettings();
    setTimeZone1(timeZone);
  }

  const getInitialDetails = async () => {
    if (expos !== undefined || expos !== null) {
      const isSeatsFull = await seatLimit(routeParams.id);
      const attendeeCount = await getAttendeeCountAPI(routeParams.id);
      if (attendeeCount.count) {
        setAttendeeCount(attendeeCount.count);
      }
      setIsSeatFull(isSeatsFull);
      return isSeatsFull
    }
  }

  useEffect(() => {
    if (expos && expos.expMaxSeats !== null && expos.expMaxSeats !== undefined && expos.expIsSeatsUnlimited !== undefined) {
      if (expos.expIsSeatsUnlimited) {
        setIsSeatsUnlimited(true);
      } else {
        const availableSeatsCount = expos.expMaxSeats - Number(attendeeCount || 0);
        setAvailableSeats(availableSeatsCount);
      }
    }
  }, [expos, attendeeCount, attendeeAddingSuccess]);

  useEffect(() => {
    if (attendeeAddingSuccess) {
      getInitialDetails();
    }
  }, [attendeeAddingSuccess])

  const fetchCurrency = async () => {
    const currency = await getCurrency();
    setCurrency(currency)
  }

  const loadDependencies = async () => {
    let expoDetails = await LocalCache.getItem(
      cacheIndex.expoDetails + "_" + routeParams.id,
      getSingleExpoAPI.bind(this, routeParams.id)
    );
    if (expoDetails.data) {
      if (expoDetails.data.expo.length == 0) {
        dispatch(
          showMessage({
            message: t('unauthorized_entry'),
            variant: "warning",
          })
        );
        navigate("/");
      } else {
        const tenantId = await localStorage.getItem('tenant_id');
        if (tenantId !== expoDetails.data.expo.expTenantId) {
          dispatch(
            showMessage({
              message: t('unauthorized_entry'),
              variant: "warning",
            })
          );
          navigate("/");
        }
      }
      const expos = expoDetails.data.expo;
      setExpos(expos);
    }
    let eventCustomFields = await getProfileFields(routeParams.id);
    eventCustomFields = eventCustomFields?.data;
    if (eventCustomFields.length > 0) {
      eventCustomFields = eventCustomFields.sort((a, b) => a.pFOrder - b.pFOrder);
    }
    setCustomFields(eventCustomFields);
  };

  const { control, formState, handleSubmit, watch, reset, setValue, clearErrors, setError } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: useMemo(
      () => ({
        firstName: "",
        lastName: "",
        email: "",
        countryCode: '+39',
        paymentStatus: "",
        paymentMode: "",
        price: 0,
        transactionRemark: "",
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
  const price = watch("price");
  const _paymentMode = watch("paymentMode");

  useEffect(() => {
    if (_paymentMode === "free") {
      setValue("price", 0);
    }
  }, [_paymentMode, setValue]);

  useEffect(() => {
    const transactionRemark = watch("transactionRemark");

    if (_paymentMode === 'free') {
      clearErrors("transactionRemark"); // No error if free
      return;
    }

    if (Number(price) === expos?.expPrice) {
      clearErrors("transactionRemark");
    } else if (
      Number(price) !== expos?.expPrice &&
      price !== "" &&
      price !== null &&
      price !== 0 &&
      !transactionRemark?.trim()
    ) {
      setError("transactionRemark", {
        type: "manual",
        message: t("transactionRemark_price_validation_message"),
      });
    } else {
      clearErrors("transactionRemark");
    }
  }, [price, _paymentMode]);


  useEffect(() => {
    if (!attendeeAddingSuccess) {
      setAttendeeDetails(null);
      setAttendeeData(null);
      setFileQueue({});
      setFileErrors({});
      setAutoUpload(false)
      setCustomFileNames({})
      reset();
    }
  }, [attendeeAddingSuccess]);


  const { errors } = formState;

  useEffect(() => {
    setSchema(getFormFieldSchema(customFields));
    if (customFields?.length > 0) {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        countryCode: "+39",
        paymentStatus: "",
        paymentMode: "",
        price: 0,
        transactionRemark: "",
        ...customFields.reduce((acc, field) => {
          if (field.pFStatus === 1) {
            switch (field.pFType) {
              case FIELD_TYPES.DATE:
                acc[unifyFieldName(field.pFColumName)] = null;
                break;
              case FIELD_TYPES.DATETIME:
                acc[unifyFieldName(field.pFColumName)] = null;
                break;
              default:
                acc[unifyFieldName(field.pFColumName)] = "";
                break;
            }
          }
          return acc;
        }, {}),
      });
    }
  }, [customFields, reset]);

  const handleDefectiveFiles = (files) => {
    setFileErrors((errors) => {
      const _errors = { ...errors };
      for (const fileId in files) {
        if (files.hasOwnProperty(fileId)) {
          const file = files[fileId];
          _errors[file.identifier] = {
            error: true,
            message: `${t('file_validation')}`,
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

  const handleProgress = (progress: {}) => { };

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const _isSeatFull = await getInitialDetails();
    if (_isSeatFull) {
      dispatch(
        showMessage({
          message: t('attendeeCount_maxSeat_mismatch_alert'),
          variant: "warning",
        })
      );
    } else {
      let missingFileIds = [];
      for (const _eventCustomField of customFields) {
        if (_eventCustomField.pFType === "file") {
          if (
            _eventCustomField.pFStatus === 1 &&
            _eventCustomField.pFRequired === 1 &&
            typeof fileQueue[unifyFieldName(_eventCustomField.pFColumName)] ===
            "undefined"
          ) {
            missingFileIds.push({
              columnName: unifyFieldName(_eventCustomField.pFColumName),
              errorMessage: _eventCustomField.pFValidation.errorMessage
            });
          }
        }
      }
      if (missingFileIds.length > 0) {
        setFileErrors((errors) => {
          const _errors = { ...errors };
          missingFileIds.map((missingFileId) => {
            _errors[missingFileId.columnName] = {
              error: true,
              message: `${missingFileId.errorMessage}`,
            };
          });
          return _errors;
        });
        setIsLoading(false);
        return;
      } else {
        const customFieldsPayload = {};
        for (let [fieldKey, fieldValue] of Object.entries(data)) {
          const fieldConfig = customFields.find(
            (f) => `__customfield__${f.pFColumName}` === fieldKey
          );

          if (fieldConfig) {
            if (fieldConfig.pFType === 'phoneNumber') {
              customFieldsPayload[fieldKey.replace("__customfield__", "")] = data.countryCode + " " + fieldValue;
            } else if (fieldConfig.pFType === "date" || fieldConfig.pFType === "datetime") {
              customFieldsPayload[fieldKey.replace("__customfield__", "")] =
                fieldValue ? forReport(fieldValue, timeZone1, fieldConfig.pFType) : null;
            } else {
              customFieldsPayload[fieldKey.replace("__customfield__", "")] = fieldValue;
            }
          }
        }

        for (let [fieldKey, fieldValue] of Object.entries(customFileNames)) {
          if (fieldKey.startsWith("__customfield__")) {
            customFieldsPayload[fieldKey.replace("__customfield__", "")] = fieldValue;
          }
        }

        const payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          custom: {
            name: data.firstName + " " + data.lastName,
            email: data.email,
            ...customFieldsPayload,
          },
          payment: {
            price: expos.expPrice !== 0 ? (data.paymentMode === "free" || !data.price ? 0 : data.price) : 0,
            transactionRemark: expos.expPrice !== 0 ? data.transactionRemark : '',
            paymentStatus: expos.expPrice !== 0 ? data.paymentStatus : 'completed',
            paymentMode: expos.expPrice !== 0 ? data.paymentMode : 'free',
          },
        };
        setAttendeeDetails({
          firstName: data?.firstName,
          lastName: data?.lastName,
          email: data?.email,
          countryCode: data?.countryCode,
          paymentStatus: data?.paymentStatus,
          paymentMode: data?.paymentMode,
          price: data?.price,
          transactionRemark: data?.transactionRemark,
        })
        if (Object.keys(fileQueue).length > 0) {
          setAutoUpload(true);
          setAttendeeData(payload);
        } else {
          onSubmitProceed(payload);
        }
      }
    }
  };

  const onSubmitProceed = async (payload) => {
    setIsLoading(true);
    const _token = localStorage.getItem("jwt_access_token");
    if (!_token || user.role !== "admin") {
      navigate("/");
    }
    try {
      const response = await AddAttendee(payload, routeParams.id);
      if (response.statusCode === 201) {
        setAttendeeAddingSuccess(true);
      } else {
        dispatch(
          showMessage({
            message: response.message,
            variant: "error",
          })
        );
        setIsLoading((prev) => !prev);
      }
      setFileQueue({});
      setAutoUpload(false);
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err?.response?.data?.message;
      if (errorMessage) {
        dispatch(
          showMessage({
            message: errorMessage || "Server error",
            variant: "error",
          })
        );
      }
      setFileQueue({});
      setAutoUpload(false);
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
        onSubmitProceed(attendeeData);
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
                <FormControl fullWidth>
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
                      t("addAttendee_profileField_uploadCSV")}
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
                    {fileErrors[unifyFieldName(_customField.pFColumName)] &&
                      fileErrors[unifyFieldName(_customField.pFColumName)].error && (
                        <Typography color="error" variant="caption" className="mt-2 text-center">
                          {fileErrors[unifyFieldName(_customField.pFColumName)].message}
                        </Typography>
                      )}
                    <div className="p-16">
                      <div className="min-h-[75px] ">
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
                      </div>
                      <div className="mt-0 mb-[25px]">
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          className="font-normal text-[12px] block"
                        >
                          {t("addAttendee_profileField_supportedFile")} -{" "}
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
                          <Typography
                            variant="caption"
                            color="primary.main"
                            className="font-semibold text-[12px] block"
                          >
                            {customFileNames &&
                              customFileNames[
                              unifyFieldName(_customField.pFColumName)
                              ]}
                          </Typography>
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
                </div>
              </div>
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
                        typeof errors[field.name] == "object" ? true : false
                      }
                      helperText={
                        typeof errors[field.name] == "object"
                          ? errors[field.name].message
                          : _customField.pFHelperText
                      }
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
                        value={value || null}
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
                        value={value || null}
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

  return (
    <div className="mb-[28px]">
      {((expos !== null)) && (
        <ImageDetails
          availableSeats={availableSeats}
          fromAddAttendee={true}
          expName={expos.expName}
          creator={expos.expCreator}
          description={expos.expDescription}
          startDate={expos.expStartDate}
          endDate={expos.expEndDate}
          image={expos.expImage === "default.webp"
            ? defaultExpoImageUrl(expos.expImage)
            : expoImageUrl(expos.expImage)}
          expCode={expos?.expCode}
          expPrice={expos?.expPrice}
          isSeatsUnlimited={isSeatsUnlimited}
        />
      )}
      {
        !attendeeAddingSuccess ? (<form
          name="attendeeForm"
          noValidate
          spellCheck={false}
          className="my-[28px] max-w-[368px]"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="">
            <div className="mb-[28px]">
              <Typography
                color="text.primary"
                variant=""
                className="font-semibold text-[18px] leading-[27px] block mb-4"
              >
                {t("addAttendee_basicDetailsHeading")}
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t("addAttendee_basicDetailsText")}
              </Typography>
            </div>
            <div className="mb-[30px]">
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    autoFocus
                    label={t("attendee_addForm_firstName")}
                    required
                    type="text"
                    error={!!errors.firstName}
                    helperText={t(errors?.firstName?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="mb-[30px]">
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    label={t("attendee_addForm_lastName")}
                    required
                    type="text"
                    error={!!errors.lastName}
                    helperText={t(errors?.lastName?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>
            <div className="mb-[30px]">
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderWidth: "2px",
                      },
                    }}
                    {...field}
                    label={t("attendee_addForm_email")}
                    required
                    type="email"
                    error={!!errors.email}
                    helperText={t(errors?.email?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </div>
            {renderFormFields()}
            {(expos && expos.expPrice !== 0) &&
              <div className="mb-[30px]">
                <div className="mb-[28px]">
                  <Typography
                    color="text.primary"
                    variant=""
                    className="font-semibold text-[18px] leading-[27px] block mb-4"
                  >
                    {t("addAttendee_paymentDetailsHeading")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    className="font-normal text-[11px] block"
                  >
                    {t("addAttendee_paymentDetailsText")}
                  </Typography>
                </div>

                <Box
                  className="flex items-center mb-[28px]"
                  component="div"
                  sx={{
                    boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2)",
                    margin: "0px",
                    padding: "20px",
                    borderRadius: "12px",
                    "& .MuiTextField-root": {
                      marginBottom: 2,
                      width: "100%",
                    },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <div className="flex-1 me-10">
                    <Typography
                      color="text.primary"
                      variant="caption"
                      component="div"
                      className="font-semibold text-[18px] leading-[27px]  mb-4 line-clamp-1"
                    >
                      {t('add_attendee_expoPrice')}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      component="div"
                      className="font-normal text-[11px] mb-0 line-clamp-1"
                    >
                      {t('add_attendee_actualPriceStatement')}
                    </Typography>
                  </div>
                  <Typography
                    color="primary.main"
                    variant="body1" // Corrected variant
                    className="font-semibold text-[18px] leading-[27px] block mb-0"
                  >
                    {`${expos && expos.expPrice === 0 ? t('attendee_addAttendee_free') : `${currency} ` + expos?.expPrice + " /-"}`}
                  </Typography>
                </Box>
                <div className="mb-[30px]">
                  <Controller
                    name="paymentMode"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.paymentMode}>
                        <InputLabel id="attendee_paymentMode">
                          {t("attendee_paymentMode")}
                        </InputLabel>
                        <Select
                          labelId="paymentMode-label"
                          id="paymentMode"
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                            },
                          }}
                          {...field}
                          label={t("attendee_paymentMode")}
                        >
                          <MenuItem value="">Select</MenuItem>
                          {paymentMode.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.paymentMode && (
                          <FormHelperText>
                            {t(errors?.paymentMode?.message)}
                          </FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </div>
                {
                  <div
                    className={
                      "mb-[30px] " + (_paymentMode === "free" && "hidden")
                    }
                  >
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderWidth: "2px",
                            },
                          }}
                          {...field}
                          label={t("attendee_addForm_price")}
                          required
                          type="number"
                          error={!!errors.price}
                          helperText={t(errors?.price?.message)}
                          variant="outlined"
                          fullWidth
                          inputProps={{
                            step: 0.01,
                            min: 0,
                          }}
                        />
                      )}
                    />
                  </div>
                }
                <div className="mb-[30px]">
                  <Controller
                    name="transactionRemark"
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
                        label={t("attendee_addForm_transactionRemark")}
                        placeholder={t('add_attendee_pleaseTypeHere')}
                        type="attendee_addForm_transactionRemark"
                        error={!!errors.transactionRemark}
                        helperText={t(errors?.transactionRemark?.message)}
                        variant="outlined"
                        multiline
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
            }
          </div>
          <div>
            <Button
              className="min-w-[88px] min-h-[41px] font-medium rounded-lg uppercase"
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading || Number(attendeeCount) >= Number(expoMaxSeat)}
              sx={{
                borderColor: "primary.main",
                backgroundColor: "primary.main",
                color: "background.paper",
                "&:hover": {
                  border: "1px solid",
                  borderColor: "primary.main",
                  backgroundColor: "primary.main",
                  color: "background.paper",
                  opacity: "0.8",
                },
              }}
            >
              {t("common_save")}
            </Button>
          </div>
        </form>) : (
          attendeeDetails && <AddAttendeeSuccess setIsLoading={setIsLoading} setAutoUpload={setAutoUpload} setAttendeeAddingSuccess={setAttendeeAddingSuccess} userDetails={attendeeDetails} />
        )
      }
    </div>
  );
}

export default AttendeesForm;
