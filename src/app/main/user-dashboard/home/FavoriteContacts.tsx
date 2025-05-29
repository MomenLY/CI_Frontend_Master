import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, ListItemAvatar, ListItemIcon, OutlinedInput, TextField, Typography } from '@mui/material';
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
import OnionNotFound from 'app/shared-components/components/OnionNotFound';

interface FavoriteContactProps {
  open: boolean;
  onClose: () => void;
}

interface FavoriteContact {
  _id: string;
  firstName: string;
  lastName: string;
  userImage: string;
  email: string;
}

function FavoriteContacts({ open, onClose }: FavoriteContactProps) {
  const { t } = useTranslation('favoriteContacts');
  const user = useAppSelector(selectUser);
  const dispatchRefresh = userUserDashboardDispatch();
  const state = useUserDashboardSelector((state) => state.state.value)
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>([]);

  useEffect(() => {
    getFavoriteContacts();
  }, [state]);

  const getFavoriteContacts = async () => {
    const favContacts = await GetFavoriteContacts(user.uuid);
    setFavoriteContacts(favContacts.favoriteUsers);
  }

  const handleUnfavoriteUser = (id: string) => {
    dispatch(
      openDialog({
        children: (
          <OnionConfirmBox
            confirmButtonLabel={t("favContact_unfavoriteUser_confirmation")}
            cancelButtonLabel={t("common_cancel")}
            variant="warning"
            title={t(
              "favContact_unFavoriteUser_confirmTitle"
            )}
            subTitle={t(
              "favContact_unFavoriteUser_confirmMessage"
            )}
            onCancel={() => dispatch(closeDialog())}
            onConfirm={() => {
              makeUserUnfavorite(id)
              dispatch(closeDialog());
            }}
          />
        ),
      })
    );
  };

  const makeUserUnfavorite = async (id: string) => {
    try {
      const payload = {
        favoriteUserId: id,
        type: 'remove'
      }
      const response = await AddRemoveFavoriteUser(payload);
      if (response.statusCode === 201) {
        setIsLoading(false)
        dispatchRefresh(setState(!state));
        dispatch(showMessage({ message: `${response.message}`, variant: 'success' }));
      } else {
        dispatch(showMessage({ message: t('favContacts_unfavoriteUser_errorMessage'), variant: 'error' }));
      }
    } catch (error) {
      console.error('Error while unfavoriting user:', error);
      dispatch(showMessage({ message: t('favContacts_unfavoriteUser_genericError'), variant: 'error' }));
    }
  }


  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "456px",
          height: "80vh",

        },
      }}
    >
      <DialogTitle>
        <div className="mb-0 pe-20">
          <Typography
            color="text.primary"
            className="font-semibold text-[18px] block mb-8 truncate"
          >
            {t('favContacts_heading')}
          </Typography>
        </div>

        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <FuseSvgIcon className="text-48" size={24} color="action">
            feather:x
          </FuseSvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "16px !important",
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <div className="mt-0 mb-0 w-full ">
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { marginBottom: 2, width: "100%" },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              {favoriteContacts && favoriteContacts.map((favoriteContact) => {
                const imageUrl = favoriteContact.userImage === '' || favoriteContact.userImage === 'default.webp' || favoriteContact.userImage === null
                  ? defaultUserImageUrl('default.webp')
                  : userImageUrl(favoriteContact.userImage);
                return (
                  <MenuItem key={favoriteContact._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <ListItemIcon className="min-w-60 my-8">
                      <img
                        src={imageUrl}
                        alt={favoriteContact.firstName}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    </ListItemIcon>
                    <div style={{ marginLeft: "8px", flex: 1 }}>
                      <span style={{ display: "block", fontWeight: "bold" }}>
                        {favoriteContact.firstName}
                      </span>
                      <span style={{ display: "block", fontSize: "small", color: "gray" }}>
                        {favoriteContact.email}
                      </span>
                    </div>
                    {/* Star icon consistently aligned in a column */}
                    <ListItemIcon style={{ minWidth: "40px", textAlign: "right" }}>
                      <FuseSvgIcon
                        style={{ color: '#FFC107', cursor: "pointer" }}
                        onClick={() => handleUnfavoriteUser(favoriteContact._id)}
                      >
                        heroicons-solid:star
                      </FuseSvgIcon>
                    </ListItemIcon>
                  </MenuItem>
                );
              })}
              {favoriteContacts.length === 0 && <OnionNotFound message={t('favoriteContacts_notfound_message')} />}
            </div>
          </Box>
        </div>
      </DialogContent >
      <DialogActions
        sx={{
          padding: "20px !important",
        }}
      >
      </DialogActions>
    </Dialog >
  );
}

export default FavoriteContacts;
