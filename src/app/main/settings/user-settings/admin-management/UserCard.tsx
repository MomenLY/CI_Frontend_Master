import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import clsx from "clsx";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import { useAppDispatch } from "app/store/hooks";
import { closeDialog, openDialog } from "@fuse/core/FuseDialog/fuseDialogSlice";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { BulkDeleteUserAPI } from "src/app/main/users/apis/Delete-User-Api";
import { useTranslation } from "react-i18next";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { updateDefaultPassword, updateStatus } from "./api/Update-Status";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SettingsApi } from "../../SettingsApi";
import OnionConfirmBox from "app/shared-components/components/OnionConfirmBox";
import OnionEmailViewer from "app/shared-components/components/OnionEmailViewer";
import OnionPhoneNumberViewer from "app/shared-components/components/OnionPhoneNumberViewer";
import { userImageUrl } from "src/utils/urlHelper";

type AdminCardType = {
  user?: User;
  onUserModify: any;
  setReload: any
};

type User = {
  id: string;
  name: string;
  email: string;
  roles: string;
  number: string;
  status: "Active" | "Inactive" | "Suspended";
  profilePic: string;
};

enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
}

const schema = z.object({
  password: z
    .string()
    .nonempty("password_required_message"),
  shouldSendEmail: z.boolean()
});

const defaultValues = {
  password: "",
  shouldSendEmail: true
};
type FormData = {
  password: string;
  shouldSendEmail: boolean
};
const ITEM_HEIGHT: number = 48;
//--------------------------------------

function UserCard({ user, onUserModify, setReload }: AdminCardType) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('adminManagement');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { control, formState, handleSubmit, setValue } = useForm({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const [resetPasswordDialog, toggleResetPasswordDialog] =
    React.useState(false);
  const [defaultPassword, setDefaultPassword] = useState("");

  const onResetPasswordConfirmation = async (status) => {
    if (defaultPassword === "") {
      const passwordData = await SettingsApi({ settingsKey: "password" });
      setDefaultPassword(passwordData.defaultPasswordSetByAdmin);
      setValue("password", passwordData.defaultPasswordSetByAdmin);
    } else {
      setValue("password", defaultPassword);
    }
    toggleResetPasswordDialog(true);
  };

  const onChangeStatusConfirmation = (status) => {
    dispatch(openDialog({
      children: (
        <OnionConfirmBox
          title={`${t(userStatuses[status].actionLabel)} ${t('adminManagement_user')}`}
          subTitle={t(userStatuses[status].confirmLabel)}
          onCancel={() => dispatch(closeDialog())}
          onConfirm={() => {
            updateStatusAPI(status);
            dispatch(closeDialog());
          }}
        />
      ),
    }));
  };

  const renderUserStatuses = () => {
    return {
      Active: {
        label: "Active",
        actionLabel: 'adminManagement_status_activate',
        callback: onChangeStatusConfirmation,
        message: `${t("activatedStatus")}`,
        show: user.status !== "Active" || user.status === "Suspended",
        theme: "bg-[#ccf3ed] text-[#00c3a5]",
        textColor: "text.primary",
        confirmLabel: 'adminManagement_ActivateConfirmText'
      },
      Inactive: {
        label: "Inactive",
        actionLabel: 'adminManagement_status_deActivate',
        callback: onChangeStatusConfirmation,
        message: `${t("deActivatedStatus")}`,
        show: user.status !== "Inactive" || user.status === "Suspended",
        theme: "bg-[#ebebeb] text-[#9b9b9b]",
        textColor: "text.disabled",
        confirmLabel: 'adminManagement_DeactivateConfirmText'
      },
      Suspended: {
        label: "Suspended",
        actionLabel: 'adminManagement_status_suspend',
        callback: onChangeStatusConfirmation,
        message: `${t("suspendedStatus")}`,
        show: user.status === "Active",
        theme: "bg-[#fee9d6] text-[#f89233]",
        confirmLabel: 'adminManagement_SuspendConfirmText'
      },
      resetPassword: {
        label: "Reset Password",
        actionLabel: 'adminManagemet_resetPassword',
        callback: onResetPasswordConfirmation,
        show: user.status === "Active",
        theme: "bg-[#fee9d6] text-[#f89233]",
      },
    };
  };

  const [userStatuses, setUserStatuses] = useState(renderUserStatuses());

  useEffect(() => {
    setUserStatuses(renderUserStatuses());
  }, [user, t]);

  const openActionItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeActionItem = () => {
    setAnchorEl(null);
  };

  const resetPasswordAPI = async (id: string, password?: string, shouldSendEmail: boolean) => {
    await updateDefaultPassword(id, password, shouldSendEmail);
    toggleResetPasswordDialog(false)
    // onUserModify(user);
    dispatch(
      showMessage({
        message: `${t("passwordResetSuccessfully")}`,
        variant: "success",
      })
    );
  };

  const updateStatusAPI = async (status: UserStatus) => {
    await updateStatus(user.id, status);
    user.status = status;
    onUserModify(user);
    dispatch(
      showMessage({
        message: `${t(userStatuses[status].message)}`,
        variant: "success",
      })
    );
  };

  //======================================================================

  const bulkDeleteUser = async (ids: string[]) => {
    try {
      const response = await BulkDeleteUserAPI(ids);
      const result = response?.statusCode;
      if (result) {
        dispatch(showMessage({ message: "User deleted", variant: "success" }));
        setReload((prev) => !prev)
      }
    } catch (error) {
      const errorMesssage = error?.response?.data?.message;
      if (errorMesssage) {
        dispatch(
          showMessage({ message: `${errorMesssage}`, variant: "error" })
        );
      }
    }
  };

  const resetUserPassword = (data: FormData) => {

    resetPasswordAPI(user.id, data.password, data.shouldSendEmail);
  };

  const deleteUser = (id) => {
    dispatch(openDialog({
      children: (
        <OnionConfirmBox
          title={t('confirmDelete')}
          subTitle={t('userDeleteHelperText')}
          onCancel={() => dispatch(closeDialog())}
          onConfirm={() => {
            bulkDeleteUser([id]);
            dispatch(closeDialog());
          }}
        />
      ),
    }));
  }

  const copyPasswordAndEmail = (password: string) => {
    const textToCopy = `Email: ${user?.email}\nPassword: ${password}`;


    navigator.clipboard.writeText(textToCopy).then(
      () => {
        dispatch(
          showMessage({
            message: "Email and password copied to clipboard",
            variant: "success",
          })
        );
      },
      (err) => {
        console.error('Could not copy text: ', err);
        dispatch(
          showMessage({
            message: "Failed to copy",
            variant: "error",
          })
        );
      }
    );
  };

  return (
    <>
      <Card
        className={`p-16 shadow-3xl mb-10 rounded-xl ${user.status === "Inactive" ? "Inactive" : ""}`}
        sx={{}}
      >
        <div className="flex justify-between items-center pb-14">
          <Stack direction="row" spacing={0}>
            <Chip
              sx={{
                height: "auto",
                "& .MuiChip-label": {
                  padding: "0",
                  lineHeight: "normal",
                },
              }}
              label={t(userStatuses[user.status].label.toLowerCase())}
              className={clsx(
                "font-bold text-10 !m-0 p-0 rounded h-20 px-6 py-5 leading-none capitalize",
                userStatuses[user.status].theme
              )}
            />
          </Stack>
          <div>
            <Dialog
              open={resetPasswordDialog}
              onClose={() => toggleResetPasswordDialog(false)}
            >
              <OnionConfirmBox
                onCancel={() => toggleResetPasswordDialog(false)}
                onConfirm={handleSubmit(resetUserPassword)}
              >
                <form
                  name="AdminPasswordReset"
                  noValidate
                  spellCheck={false}
                  className=" flex flex-col left-0 space-y-14 my-5"
                  onSubmit={handleSubmit(resetUserPassword)}
                >
                  <div className="flex flex-col space-y-5">
                    <Typography
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'pre-line',
                      }}
                      className='font-semibold'
                      variant="h6">{t('resetPassword')}</Typography>
                    <Typography variant="caption">
                      {t("resetPasswordHelperText")}
                    </Typography>
                  </div>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t("password")}
                        autoFocus
                        type="text"
                        error={!!errors.password}
                        helperText={errors?.password?.message}
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={() => copyPasswordAndEmail(field.value)}
                              edge="end"
                            >
                              <FuseSvgIcon size={20}>material-solid:content_copy</FuseSvgIcon>
                            </IconButton>
                          ),
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="shouldSendEmail"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox checked={value} onChange={onChange} />
                          }
                          label={t("emailUserAboutPasswordReset")}
                        />
                      </FormControl>
                    )}
                  />
                </form>
              </OnionConfirmBox>
            </Dialog>
            <IconButton
              aria-label="more"
              size="small"
              id="long-button"
              aria-controls={open ? "long-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="true"
              onClick={openActionItem}
            >
              <FuseSvgIcon size={18}>material-twotone:more_vert</FuseSvgIcon>
            </IconButton>
            <Menu
              id="long-menu"
              MenuListProps={{
                "aria-labelledby": "long-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={closeActionItem}
              PaperProps={{
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: "20ch",
                },
              }}
            >
              {Object.entries(userStatuses).map(
                ([statusKey, statusObject]) =>
                  statusObject.show && (
                    <MenuItem
                      key={statusKey}
                      onClick={() => {
                        setAnchorEl(null);
                        statusObject.callback(statusKey);
                      }}
                    >
                      {t(statusObject.actionLabel)}
                    </MenuItem>
                  )
              )}
            </Menu>
          </div>
        </div>
        <CardContent className="!p-0 mb-0">
          <div className="">
            <Avatar
              alt={user?.name.toUpperCase()}
              src={userImageUrl(user.profilePic)}
              className="mr-10 float-left"
            />
            <div className="flex flex-col">
              <Typography
                gutterBottom
                component="div"
                color={userStatuses[user.status].textColor}
                className={`mb-0 truncate text-[13px]`}
              >
                {user?.name}
              </Typography>
              <Typography
                gutterBottom
                component="div"
                color="text.disabled"
                className={`truncate mb-0 text-[13px]`}
              >
                <OnionEmailViewer email={user?.email} />
                {/* {user?.email} */}
              </Typography>
            </div>
          </div>

          <div className="pt-16 pb-20 space-y-10">
            <Typography
              gutterBottom
              variant="caption"
              component="div"
              color={userStatuses[user.status].textColor}
              className={`mb-0 flex whitespace-nowrap`}
            >
              {t("roles")} <span className="mx-4">:</span> <b className={`truncate block`}> {user.roles ? user.roles : "N/A"} </b>
            </Typography>
            <Typography
              gutterBottom
              variant="caption"
              component="div"
              color={userStatuses[user.status].textColor}
              className={`mb-0 flex whitespace-nowrap`}
            >
              {t("phoneNumber")} <span className="mx-4">:</span>  <b className={`truncate block`}>
                {user.number ? <OnionPhoneNumberViewer phoneNumber={user.number} /> : "N/A"}
              </b>
            </Typography>
          </div>

          <div className="flex items-center">
            <Stack direction="row" spacing={1}>
              <Button
                color="secondary"
                size="small"
                startIcon={<FuseSvgIcon size={16}>feather:edit</FuseSvgIcon>}
                component={NavLinkAdapter}
                to={`edit/${user.id}`}
                className="py-0 !-ms-6 font-semibold"
              >
                {t("common_edit")}
              </Button>
              <Button
                onClick={() => deleteUser(user.id)}
                color="error"
                size="small"
                startIcon={<FuseSvgIcon size={16}>feather:trash</FuseSvgIcon>}
                className="py-0 font-semibold"
              >
                {t("common_delete")}
              </Button>
            </Stack>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default UserCard;
