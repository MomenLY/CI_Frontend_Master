import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAuth } from "src/app/auth/AuthRouteProvider";
import { darken } from "@mui/material/styles";
import { useAppSelector } from "app/store/hooks";
import { defaultUserImageUrl, userImageUrl } from "src/utils/urlHelper";
import { useTranslation } from "react-i18next";
import EditProfile from "../home/EditProfile";
import ResetPassword from "../home/ResetPassword";
import { useUsersSelector } from "../../users/UsersSlice";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import FavoriteContacts from "../home/FavoriteContacts";
import { QrCodeAPI } from "../api/qr-code-api";
import UserMenuList from "../home/userMenuList";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";

/**
 * The user menu.
 */

type UserMenuType = {
  data?: any;
  openProfileDialog: any
  setOpenProfileDialog: any;
}


function UserMenu({ data, openProfileDialog, setOpenProfileDialog }: UserMenuType) {
  const { t } = useTranslation('');
  const { signOut } = useAuth();
  const [userMenu, setUserMenu] = useState(null);
  const [isFavouriteContact, setIsFavouriteContact] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const state = useUsersSelector((state) => state.state.value);
  const [userData, setUserData] = useState<any>();
  const [isUserMenu, setIsUserMenu] = useState(false);
  const [event, setEvent] = useState("")
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState();

  useEffect(() => {
    const getUserDetails = async () => {
      const user = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
      if (user) {
        setUser(user);
        setUserData(user);
      }
    };
    getUserDetails();
  }, [state]);

  
  const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setIsUserMenu(true);
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setIsUserMenu(false);
    setAnchorEl(null);
  };

  if (!userData) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <Button
          className="min-h-40 min-w-40 p-0  md:py-6"
          onClick={userMenuClick}
          color="inherit"
        >
          {(user && (user?.data.userImage === 'default.webp' || user?.data?.userImage === '' || user?.data?.userImage === null)) ? (
            <Avatar
              sx={{
                background: (theme) => darken(theme.palette.background.default, 0.05),
                color: (theme) => theme.palette.text.secondary
              }}
              className="md:mx-4"
            >
              {user?.data?.displayName ? user?.data?.displayName?.[0].toUpperCase() : 'U'}
            </Avatar>
          ) : (
            <Avatar
              sx={{
                background: (theme) => darken(theme.palette.background.default, 0.05),
                color: (theme) => theme.palette.text.secondary
              }}
              className="md:mx-4"
              src={userImageUrl(user.data.userImage)}
            />
          )}
        </Button>
        <UserMenuList userData={userData} anchorEl={anchorEl} open={isUserMenu} onClose={() => handleUserMenuClose()} inLobby={false}/>
      </div>
    </>
  );
}

export default UserMenu;
