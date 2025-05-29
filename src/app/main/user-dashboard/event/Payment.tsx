import { useEffect, useMemo, useState } from "react";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import LocalCache from "src/utils/localCache";
import { useNavigate, useParams } from "react-router";
import { getEvent } from "../api/event-details-api";
import {
    Box,
    Button,
    FormControl,
    InputAdornment,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import axios from "app/store/axiosService";
import { v4 as uuidv4 } from 'uuid';
import { getProfileFields } from "../api/profile-fields-api";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useTheme } from "@mui/material/styles";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { customFilePath } from "src/utils/urlHelper";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import {
    LocalizationProvider,
    DatePicker,
    DateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CountryCodeSelector from "../../settings/general-settings/profile-settings/phone-number-selector/CountryCodeSelector";
import HorizontalLinearStepper1 from "./HorizontalLinearStepper1";
import { getTenantSlug } from "src/utils/tenantHelper";
import { checkUserExpoRegStatus } from "../api/check-user-expo-reg-status";
import FuseLoading from "@fuse/core/FuseLoading";
import { getSettings, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { forReport } from "src/utils/dateformatter";
import { getTimeZoneSettings } from "src/utils/getSettings";

const BUTTON_TEXT = {
    "PROCEED_TO_PAY": 'payment_button',
    "CONTINUE": 'continue_button'
}

const FIELD_TYPES = {
    INPUT: "input",
    SELECT: "select",
    DATE: "date",
    DATETIME: "datetime",
    PHONENUMBER: "phoneNumber",
    FILE: "file",
};

type FormData = {
    name: string;
    email: string;
    countryCode: string;
}
function Payment() {
    const routeParams = useParams();
    const [expoDetails, setExpoDetails] = useState(null);
    const [userDetails, setUserDetails] = useState("");
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [autoUpload, setAutoUpload] = useState(false);
    const { t } = useTranslation("attendees");
    const [buttonText, setButtonText] = useState('payment_button');
    const [fileErrors, setFileErrors] = useState({});
    const theme = useTheme();
    const [customFileNames, setCustomFileNames] = useState({});
    const [fileQueue, setFileQueue] = useState({});
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [attendeeData, setAttendeeData] = useState(null);
    const navigate = useNavigate();
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [userData, setUserData] = useState();
    const [speakerRoleId, setSpeakerRoleId] = useState();
    const [boothManagerRoleId, setBoothManagerRoleId] = useState();
    const [timeZone1, setTimeZone1] = useState("");


    useEffect(() => {
        fetchandCheckRole();
        getLocation();
    }, [])

    const getLocation = async () => {
        const timeZone = await getTimeZoneSettings();
        setTimeZone1(timeZone);
    }

    const fetchandCheckRole = async () => {
        const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
        // let boothManagerRoleId = settings?.boothManagerRoleId;
        let speakerRoleId = settings?.speakerRoleId;
        setSpeakerRoleId(speakerRoleId);
        let boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
        setBoothManagerRoleId(boothManagerRoleId);
        const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null))
        if (userData) {
            setUserData(userData);
        }
    }

    useEffect(() => {
        const getEventAndRegistrationDetails = async (id) => {
            try {
                // Fetch event and registration details concurrently
                const [eventDetails, expoRegistrationStatus] = await Promise.all([
                    getEvent(id),
                    checkUserExpoRegStatus(id)
                ]);

                // Set event details
                setExpoDetails(eventDetails?.expo);

                // Set button text based on payment status
                setButtonText(eventDetails?.expo?.expIsPaid ? BUTTON_TEXT.PROCEED_TO_PAY : BUTTON_TEXT.CONTINUE);

                // Check if user is already registered
                if (expoRegistrationStatus?.expoCheckUserRegistrationStatus) {
                    navigate(`/${getTenantSlug(routeParams)}/events/${id}`);
                    return dispatch(showMessage({ message: t('expo_already_purchased'), variant: 'error' }));
                }

                // Check if event is full
                if (eventDetails?.expo?.expIsSeatsUnlimited == false) {
                    if (expoRegistrationStatus?.expoAttendees >= eventDetails?.expo?.expMaxSeats && eventDetails?.expo?.expMaxSeats !== 0) {
                        navigate(`/${getTenantSlug(routeParams)}/events/${id}`);
                        return dispatch(showMessage({ message: t('expo_full_message'), variant: 'error' }));
                    }
                }

                // if (userData.roleId === boothManagerRoleId || userData.roleId === speakerRoleId) {
                //     navigate(`/${getTenantSlug(routeParams)}/events/${id}`);
                // }

                // Fetch user and custom field details
                const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
                setUserDetails(userData);

                let eventCustomFields = await getProfileFields("expo_" + eventDetails?.expo?.id);
                eventCustomFields = eventCustomFields?.data?.sort((a, b) => a.pFOrder - b.pFOrder);
                setCustomFields(eventCustomFields);
                setPageLoading(false);
            } catch (error) {
                console.error('Error fetching details:', error);
                navigate(`/${getTenantSlug(routeParams)}/events/${id}`)
            }
        };

        // Call the combined function when routeParams.id changes
        getEventAndRegistrationDetails(routeParams.id);
    }, [routeParams.id]);


    const unifyFieldName = (fieldName) => {
        return "__customfield__" + fieldName;
    };

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
                                let fixedPattern = field?.pFValidation?.regexPattern.replace(/\\\\/g, "\\");

                                const regex = new RegExp(fixedPattern);
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
                _schema = z.any(); // Fallback for unhandled types
                break;
        }
        return _schema;
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
                            acc[unifyFieldName(field.pFColumName)] = z.date().refine(
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
                                        `${field.pFLabel} is invalid`,
                                }
                            );
                        } else {
                            acc[unifyFieldName(field.pFColumName)] = z.date().nullable().refine(
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
                                        `${field.pFLabel} is invalid`,
                                }
                            );
                        }
                        break;
                    case FIELD_TYPES.DATETIME:
                        if (field.pFRequired) {
                            acc[unifyFieldName(field.pFColumName)] = z.any().refine(
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
                                        `${field.pFLabel} is invalid`,
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
                                        `${field.pFLabel} is invalid`,
                                }
                            );
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
                countryCode: z.string().optional(),
                ...dynamicFieldSchema,
            });
    };

    const [schema, setSchema] = useState(() => getFormFieldSchema([]));

    const { control, formState, handleSubmit, watch, reset } = useForm({
        mode: "onChange",
        resolver: zodResolver(schema),
        defaultValues: useMemo(
            () => ({
                name: "",
                email: "",
                countryCode: '+39',
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

    const { errors } = formState;

    useEffect(() => {
        setSchema(getFormFieldSchema(customFields));
        if (customFields?.length > 0) {
            reset({
                name: "",
                email: "",
                countryCode: "+39",
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
                [result.id]: result.data.data,
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

    const onSubmit = async (data: FormData) => {
        let missingFileIds = [];
        for (const _eventCustomField of customFields) {
            if (_eventCustomField.pFType === "file") {
                if (
                    _eventCustomField.pFStatus === 1 &&
                    _eventCustomField.pFRequired === 1 &&
                    typeof fileQueue[unifyFieldName(_eventCustomField.pFColumName)] ===
                    "undefined"
                ) {
                    missingFileIds.push(unifyFieldName(_eventCustomField.pFColumName));
                }
            }
        }
        if (missingFileIds.length > 0) {
            setFileErrors((errors) => {
                const _errors = { ...errors };
                missingFileIds.map((missingFileId) => {
                    _errors[missingFileId] = {
                        error: true,
                        message: t('file_error'),
                    };
                });
                return _errors;
            });
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
                    customFieldsPayload[fieldKey.replace("__customfield__", "")] =
                        fieldValue;
                }
            }

            let _attendeeData = userDetails?.data;
            let attendeeFullName = _attendeeData.displayName.split(" ");
            let lastName = attendeeFullName.pop();
            let firstName = attendeeFullName.join(" ");
            let email = _attendeeData.email;

            const payload = {
                name: firstName + " " + lastName,
                email: email,
                countryCode: data.countryCode,
                ...customFieldsPayload,
            };
            if (Object.keys(fileQueue).length > 0) {
                setAutoUpload(true);
                setAttendeeData(payload);
            } else {
                onSubmitProceed(payload);
            }
        }
    };

    const onSubmitProceed = async (payload) => {
        setIsLoading(true);
        const _token = localStorage.getItem("jwt_access_token");

        if (!_token) {
            navigate("/sign-in");
        }
        try {
            let expoId = expoDetails.id;
            let user = JSON.stringify(payload);
            let isWeb = true;
            const orderResponse = await axios.post('/checkout', { expoId, user, isWeb });
            if (orderResponse.data.statusCode == 201) {
                window.location.href = orderResponse.data.data;
            } else {
                setFileQueue({});
                setAutoUpload(false);
                throw new Error('Failed to create order');
            }

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

    const handleCheckout = async () => {
        if (expoDetails && userDetails) {
            try {
                const orderDetails = JSON.stringify({
                    "expoId": expoDetails.id,
                    "expoName": expoDetails.expName
                });

                const orderResponse = await axios.post('/order', {
                    "eoOrderId": "ORD" + uuidv4(),
                    "eoUserId": userDetails["uuid"],
                    "eoItemDetails": orderDetails,
                    "eoOrderStatus": "paymentProgress",
                    "eoTransactionId": "",
                    "eoPaymentResponse": "{}",
                    "eoLog": ["Payment Started"],
                    "eoPaymentMode": "card"
                });
                if (orderResponse.data.statusCode == 201 && orderResponse.data["data"].eoOrderId) {
                    if (expoDetails.expIsPaid) {
                        const response = await axios.post('/stripe/create-checkout-session', {
                            price: expoDetails.expPrice, // Price in USD
                            successUrl: 'https://' + window.location.host + `/${getTenantSlug(routeParams)}/events/` + expoDetails.expCode + '/payment-success?expid=' + expoDetails.id + '&orderid=' + orderResponse.data["data"].eoOrderId,
                            cancelUrl: 'https://' + window.location.host + `/${getTenantSlug(routeParams)}/events/` + expoDetails.expCode + '/payment-cancel',
                            expo: expoDetails,
                            user: userDetails,
                            orderId: orderResponse.data["data"].eoOrderId
                        });

                        const session = response.data;
                        if (session?.data?.url) {
                            window.location.href = session?.data?.url;
                        } else {
                            console.error('Failed to create Stripe session:', session);
                        }
                    } else {
                        window.location.href = 'https://' + window.location.host + `/${getTenantSlug(routeParams)}/events/` + expoDetails.expCode + '/payment-success?expid=' + expoDetails.id + '&orderid=' + orderResponse.data["data"].eoOrderId + '&type=free';
                    }

                } else {
                    console.error('Failed to create order:', orderResponse);
                }
            } catch (error) {
                console.error('Error creating Stripe session:', error);
            }
        }
    };

    return (
        <>
            {pageLoading ? <FuseLoading /> : (<form
                className="h-full"
                noValidate
                spellCheck={false}
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
            >
                <Box
                    className="p-0 md:p-60 "
                    sx={{
                        minHeight: "100%",
                        display: "flex",
                        flexDirection: "column",
                        flex: "1",
                    }}
                >
                    <Box
                        className="relative w-full max-w-[598px] mx-auto py-[40px] px-[20px]  md:py-[60px] md:px-[50px]"
                        sx={{
                            backgroundColor: "background.paper",
                            minHeight: "100%",
                            display: "flex",
                            flexDirection: "column",
                            flex: "1",
                            borderRadius: "12px",
                            overflowY: "scroll",
                            overflowX: "hidden",
                            maxHeight: { xs: "calc(100vh - 60px)", md: "calc(100vh - 120px)" },
                        }}
                    >
                        <Typography
                            color="text.primary"
                            component="h2"
                            className="text-[26px] leading-[36px] md:text-[32px] md:leading-[42px] font-semibold text-center mb-20"
                        >
                            {t('payment_header')}
                        </Typography>

                        <div className="py-[28px]">
                            <HorizontalLinearStepper1 step={0} />
                        </div>

                        <Box className="p-20 max-w-[368px] mx-auto">

                            <div className="pb-[28px] text-center">
                                <Typography
                                    color="text.primary"
                                    className="font-semibold text-[18px] leading-[24px] block mb-4"
                                >
                                    {t('payment_subHeader')}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    className="font-normal text-[11px] leading-[16px]  block"
                                >
                                    {t('payment_reg_info')}
                                </Typography>
                            </div>

                            <div className="mb-[30px]">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            sx={{
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderWidth: "2px",
                                                },
                                            }}
                                            {...field}
                                            required
                                            value={userDetails?.data?.displayName || ""}
                                            disabled
                                            type="text"
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
                                            required
                                            value={userDetails?.data?.email || ""}
                                            disabled
                                            type="email"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                />
                            </div>
                            {renderFormFields()}
                        </Box>



                        <Box
                            className=" z-99 fixed right-0 left-0 bottom-0 text-right shadow-[0_-1px_1px_0px_rgba(0,0,0,0.10)] "
                            sx={{
                                backgroundColor: "background.paper",
                                maxWidth: "598px",
                                margin: "auto",
                                bottom: "60px",
                                borderBottomRightRadius: "8px",
                                borderBottomLeftRadius: "8px",
                            }}
                        >
                            <div className="p-24">


                                <Button
                                    className="min-w-[110px] min-h-[42px] rounded-lg"
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isLoading || autoUpload}
                                    sx={{
                                        // borderWidth: 2,
                                        borderColor: 'primary.main',
                                        border: "2px solid",
                                        "&:hover": {
                                            border: "2px solid",
                                            borderColor: 'primary.main',
                                            backgroundColor: "primary.main",
                                            color: "background.paper",
                                        },
                                    }}

                                >
                                    {t(buttonText)}
                                </Button>
                            </div>
                        </Box>
                    </Box>
                </Box>

            </form>)}

        </>
    );
}

export default Payment;
