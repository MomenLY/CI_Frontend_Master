import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, ListItemAvatar, ListItemIcon, ListItemText, OutlinedInput, TextField, Typography } from '@mui/material';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useTranslation } from 'react-i18next';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { GetFavoriteContacts } from '../api/get-favorite-contacts';
import { MenuItem } from '@mui/material';
import { defaultUserImageUrl, userImageUrl } from 'src/utils/urlHelper';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import { AddRemoveFavoriteUser } from '../api/add-remove-favorite-suer';
import { setState, useUserDashboardSelector, userUserDashboardDispatch } from '../userDashboardSlice';
import FuseLoading from '@fuse/core/FuseLoading';
import { QrCodeAPI } from '../api/qr-code-api';
import EditProfile from './EditProfile';
import ResetPassword from './ResetPassword';
import FavoriteContacts from './FavoriteContacts';
import { Link } from "react-router-dom";
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { deleteUser } from '../api/delete-user';

interface FavoriteContactProps {
    open: boolean;
    onClose: () => void;
    userData: any;
    anchorEl: any;
    inLobby: boolean
}

interface FavoriteContact {
    _id: string;
    firstName: string;
    lastName: string;
    userImage: string;
    email: string;

}

function UserMenuList({ anchorEl, open, onClose, userData, inLobby }: FavoriteContactProps) {
    const { t } = useTranslation('profileSettings');
    const user = useAppSelector(selectUser);
    const dispatchRefresh = userUserDashboardDispatch();
    const state = useUserDashboardSelector((state) => state.state.value)
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>([]);
    const [qrCode, setQrCode] = useState();
    const [isFavouriteContact, setIsFavouriteContact] = useState(false);
    const [isEditProfile, setIsEditProfile] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const { signOut } = useAuth();
    const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });

    const handleProfile = () => {
        setIsEditProfile(true)
    }

    const handleReset = () => {
        setIsResetPassword(true)
    }

    const handleFavouriteContacts = () => {
        setIsFavouriteContact(true)
    }

    useEffect(() => {
        if (userData !== null) {
            generateQRCode();
        }
    }, [userData])

    const generateQRCode = async () => {
        try {
            if (userData) {
                const payload = {
                    uuid: userData.uuid,
                    email: userData?.data?.email,
                    type: 'profileShare'
                }
                const response = await QrCodeAPI({ data: payload });
                if (response) {
                    setQrCode(response)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleEditProfileClose = () => {
        setIsEditProfile(false)
    }

    const handleResetPasswordClose = () => {
        setIsResetPassword(false);
    }

    const handleFavouriteContactsClose = () => {
        setIsFavouriteContact(false)
    }

    const handleDelete = () => {
        dispatch(openDialog({
            children: (
                <OnionConfirmBox
                    confirmButtonLabel={t('common_delete')}
                    cancelButtonLabel={t('common_cancel')}
                    variant='warning'
                    title={t('deleteuser_confirmTitle')}
                    subTitle={t('deleteUser_confirmMessage')}
                    onCancel={() => dispatch(closeDialog())}
                    onConfirm={async () => {
                        await deleteUser(userData.uuid);
                        dispatch(closeDialog());
                        signOut();
                    }}
                />
            ),
        }));

    }

    const updateDialogPosition = () => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            // const top = rect.top + window.scrollY + rect.height + 16;
            const left = rect.left + window.scrollX + rect.width - 380;
            setDialogPosition({ left });
        }
    };

    useEffect(() => {
        // Update position initially
        updateDialogPosition();

        // Add resize event listener
        const handleResize = () => {
            updateDialogPosition();
        };

        window.addEventListener("resize", handleResize);

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [anchorEl]);

    const deleteAccount = () => {
    }

    return (
        <>
            <div className="relative">
                <Dialog
                    className={inLobby ? 'sm:left-[70px]' : ''}
                    open={open}
                    onClose={onClose}
                    disableEscapeKeyDown
                    BackdropProps={{ style: { display: "none" } }}
                    PaperProps={{
                        sx: {
                            width: { xs: "100%", sm: "380px" },
                            maxWidth: { xs: "100%", sm: "380px" },
                            Height: "100vh",
                            maxHeight: { xs: "100vh", sm: "calc(100vh - 80px)" },
                            // minHeight: { xs: "calc(100vh - 60px)", sm: "100vh" },
                            position: "absolute",
                            // org
                            top: inLobby ? {
                                xs: "0",
                                sm: "40px",
                            } : {
                                xs: "0",
                                sm: "60px",
                                md: "80px",
                            },
                            // top: dialogPosition.top + "px",
                            // top: { 
                            //   xs: "0", 
                            //   sm: `${dialogPosition.top}px` 
                            // },
                            left: dialogPosition.left + "px",
                            margin: { xs: "auto", sm: "0" },
                            borderRadius: "12px",
                            boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
                        },
                    }}
                >
                    <DialogTitle sx={{ padding: "16px 28px !important" }}
                    >
                        <Typography

                            color="text.primary"
                            className="font-semibold text-[18px]"
                        >
                            {t('profileSettings_editProfile_profile')}
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={{ position: "absolute", right: 8, top: 8, color: "black" }}
                        >
                            <FuseSvgIcon>feather:x</FuseSvgIcon>
                        </IconButton>
                    </DialogTitle>
                    <DialogContent
                        sx={{
                            padding: "20px 28px !important",
                            backgroundColor: (theme) => theme.palette.background.default,
                            position: "relative",
                            boxShadow: "none",
                        }}
                    >
                        <Box
                            onClick={() => {
                                handleProfile()
                            }}
                            sx={{
                                position: "absolute",
                                right: "20px",
                                top: "20px",
                                cursor: "pointer",
                            }}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M9.04999 2.89844H2.78889C2.31445 2.89844 1.85943 3.08691 1.52395 3.42239C1.18847 3.75787 1 4.21288 1 4.68733V17.2095C1 17.684 1.18847 18.139 1.52395 18.4745C1.85943 18.81 2.31445 18.9984 2.78889 18.9984H15.3111C15.7855 18.9984 16.2406 18.81 16.576 18.4745C16.9115 18.139 17.1 17.684 17.1 17.2095V10.9484"
                                    stroke="#6F43D6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M15.7628 1.55574C16.1186 1.1999 16.6012 1 17.1044 1C17.6076 1 18.0903 1.1999 18.4461 1.55574C18.8019 1.91157 19.0018 2.39418 19.0018 2.8974C19.0018 3.40062 18.8019 3.88324 18.4461 4.23907L9.94887 12.7363L6.37109 13.6307L7.26554 10.053L15.7628 1.55574Z"
                                    stroke="#6F43D6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Box>

                        <div className="flex items-center justify-center flex-col">
                            <Box
                                sx={{
                                    backgroundColor: "#E7E7E7",
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden", // Ensures the image does not overflow the circular box
                                    marginBottom: "16px",
                                }}
                            >
                                <img
                                    src={userData?.data?.userImage && userData.data.userImage !== 'default.webp'
                                        ? userImageUrl(userData.data.userImage)
                                        : defaultUserImageUrl('default.webp')}
                                    alt={`${userData?.data?.firstName}'s avatar`}
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        borderRadius: "50%",
                                        objectFit: "cover"
                                    }}
                                />
                            </Box>
                            <Typography
                                color="text.primary"
                                className="font-semibold text-[14px] leading-[28px] text-center"
                            >
                                {userData?.data?.displayName || ''}
                            </Typography>
                            <Typography
                                color="text.primary"
                                className="font-normal text-[11px] leading-[24px] text-center"
                            >
                                {userData?.data?.email || ''}
                            </Typography>
                        </div>
                        <Divider className="my-[10px]" orientation="horizontal" flexItem />

                        <div className="flex items-center justify-center cursor-pointer"

                            onClick={() => {
                                handleFavouriteContacts()
                            }}
                        >
                            <span className="me-10 flex">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M10 0L12.2451 6.90983H19.5106L13.6327 11.1803L15.8779 18.0902L10 13.8197L4.12215 18.0902L6.36729 11.1803L0.489435 6.90983H7.75486L10 0Z"
                                        fill="#F7CA69"
                                    />
                                </svg>
                            </span>
                            <Typography
                                color="text.primary"
                                className="font-semibold text-[14px] leading-[28px]"
                            >
                                {t('profileSettings_favoriteContacts_title')}
                            </Typography>
                        </div>
                        <Divider className="my-[10px]" orientation="horizontal" flexItem />
                        <div className="flex items-center justify-center cursor-pointer"

                            onClick={() => {
                                handleReset()
                            }}
                        >
                            <span className="me-10 flex">
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 22 22"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12.6663 7.71875C12.6663 7.71875 13.3007 7.40625 10.9997 7.40625C10.1756 7.40625 9.37001 7.65062 8.6848 8.10846C7.9996 8.5663 7.46554 9.21704 7.15018 9.9784C6.83481 10.7398 6.7523 11.5775 6.91307 12.3858C7.07384 13.194 7.47068 13.9365 8.0534 14.5192C8.63612 15.1019 9.37855 15.4988 10.1868 15.6595C10.9951 15.8203 11.8328 15.7378 12.5942 15.4224C13.3556 15.1071 14.0063 14.573 14.4641 13.8878C14.922 13.2026 15.1663 12.397 15.1663 11.5729"
                                        stroke="#6F43D6"
                                        strokeWidth="1.4"
                                        strokeMiterlimit="10"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M11 5.42578L13.0833 7.50911L11 9.59245"
                                        stroke="#6F43D6"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M11 1C5.47917 1 1 5.47917 1 11C1 16.5208 5.47917 21 11 21C16.5208 21 21 16.5208 21 11C21 5.47917 16.5208 1 11 1Z"
                                        stroke="#6F43D6"
                                        strokeWidth="1.6"
                                        strokeMiterlimit="10"
                                    />
                                </svg>
                            </span>
                            <Typography
                                color="text.primary"
                                className="font-semibold text-[14px] leading-[28px]"
                            >
                                {t('profileSettings_resetPassword_title')}
                            </Typography>
                        </div>
                        <Divider className="my-[10px]" orientation="horizontal" flexItem />
                        <div className="flex items-center justify-center cursor-pointer"
                            onClick={() => {
                                signOut();
                            }}
                        >
                            <span className="me-10 flex">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M2.22222 20C1.61111 20 1.08796 19.7824 0.652778 19.3472C0.217593 18.912 0 18.3889 0 17.7778V2.22222C0 1.61111 0.217593 1.08796 0.652778 0.652778C1.08796 0.217593 1.61111 0 2.22222 0H10V2.22222H2.22222V17.7778H10V20H2.22222ZM14.4444 15.5556L12.9167 13.9444L15.75 11.1111H6.66667V8.88889H15.75L12.9167 6.05556L14.4444 4.44444L20 10L14.4444 15.5556Z"
                                        fill="#6F43D6"
                                    />
                                </svg>
                            </span>
                            <Typography
                                color="text.primary"
                                className="font-semibold text-[14px] leading-[28px]"
                            >
                                {t('profileSettings_signOut')}
                            </Typography>
                        </div>
                        <Divider className="my-[10px]" orientation="horizontal" flexItem />
                        <div className="flex items-center justify-center flex-col">
                            <Typography
                                color="text.primary"
                                className="font-semibold text-[14px] leading-[24px] mt-5"
                            >
                                {t('profileSettings_shareYourProfile_title')}
                            </Typography>
                            <Typography
                                color="text.primary"
                                className="font-normal text-[11px] leading-[16px]"
                            >
                                {t('profileSettings_shareYourProfile_subText')}
                            </Typography>

                            <Box
                                sx={{
                                    backgroundColor: "#E7E7E7",
                                    width: "220px",
                                    height: "220px",
                                    // borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden", // Ensures the image does not overflow the circular box
                                    margin: "20px 0",
                                }}
                            >

                                <img
                                    src={qrCode} alt="QRCode"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                        </div>
                        <Divider className="my-[10px]" orientation="horizontal" flexItem />
                        <div className="flex items-center justify-center cursor-pointer"
                            onClick={() => {
                                handleDelete()
                            }}
                        >
                            <span className="me-10 flex">
                                <svg
                                    width="17"
                                    height="18"
                                    viewBox="0 0 17 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M1 4.21875H2.6H15.4"
                                        stroke="#EC4545"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M13.8094 4.2V15.4C13.8094 15.8243 13.6408 16.2313 13.3407 16.5314C13.0407 16.8314 12.6337 17 12.2094 17H4.20938C3.78503 17 3.37806 16.8314 3.078 16.5314C2.77795 16.2313 2.60938 15.8243 2.60938 15.4V4.2M5.00938 4.2V2.6C5.00938 2.17565 5.17795 1.76869 5.478 1.46863C5.77806 1.16857 6.18503 1 6.60938 1H9.80938C10.2337 1 10.6407 1.16857 10.9407 1.46863C11.2408 1.76869 11.4094 2.17565 11.4094 2.6V4.2"
                                        stroke="#EC4545"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                            <Typography
                                color="error"
                                className="font-semibold text-[16px] leading-[20px]" onClick={() => deleteAccount()}
                            >
                                {t('profileSettings_deleteAccount_title')}
                            </Typography>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>


            <EditProfile open={isEditProfile} onClose={() => handleEditProfileClose()} />
            <ResetPassword open={isResetPassword} onClose={() => handleResetPasswordClose()} />
            <FavoriteContacts open={isFavouriteContact} onClose={() => handleFavouriteContactsClose()} />
        </>
    );
}

export default UserMenuList;
