import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ciLogo from "/assets/images/ci-logo.svg";
import LanguageSwitcher from "app/theme-layouts/shared-components/LanguageSwitcher";
import NavigationSearch from "app/theme-layouts/shared-components/navigation/NavigationSearch";
import Container from "@mui/material/Container";
import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";
import UserMenu from "./UserMenu";
import { logoImageUrl } from "src/utils/urlHelper";
import { useNavigate, useParams } from "react-router";
import { getTenantId } from "src/utils/tenantHelper";
import { useAuth } from "src/app/auth/AuthRouteProvider";
import { getSettings } from "src/utils/settingsLibrary";
import { identifier } from "stylis";



const drawerWidth = 240;


function Header(props) {
  const { window } = props;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState<any>([]);
  const [logoSrc, setLogoSrc] = React.useState('');
  const { t } = useTranslation('user-dashboard');
  const routeParams = useParams();
  const { signOut } = useAuth();
  const [openProfileDialog, setOpenProfileDialog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('home')

  let tenantId = getTenantId(routeParams);
  if (tenantId === undefined) {
    const _queryParams = new URLSearchParams(location.search);
    tenantId = _queryParams.get('t');
  }

  useEffect(() => {
    const init = async () => {
      if (tenantId !== null) {
        const basicData = await getSettings('basic', tenantId);
        if (basicData) {
          const imgSrc = logoImageUrl(basicData?.settings?.logo, tenantId);
          if (imgSrc && imgSrc !== '') {
            setLogoSrc(imgSrc);
          }
        }
      }
    };

    init();
  }, [tenantId]);

  useEffect(() => {
    getInitialDetails();
    //checkRole();
  }, []);

  // const checkRole = async () => {
  //   const userDetails = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
  //   const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
  //   // const boothManagerRoleId = settings?.boothManagerRoleId;
  //   const boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
  //   const speakerRoleId = settings?.speakerRoleId;
  //   if (userDetails.roleId === boothManagerRoleId || userDetails.roleId === speakerRoleId) {
      
  //   }
  // }

  const getInitialDetails = async () => {
    try {
      const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
      if (userData) {
        setIsLoggedIn(true);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching initial details:', error);
    }
  };
  const uD_menu_home_text = t('uD_menu_home_text');
  const uD_menu_events_text = t('uD_menu_events_text');
  const uD_menu_login_text = t('uD_menu_login_text');
  const uD_menu_logout_text = t('uD_menu_logout_text');
  const uD_menu_registered_events_text = t('uD_menu_registered_events_text');

  const navItems = [
    {
      menu: uD_menu_home_text,
      link: tenantId ? `/?t=${tenantId}` : "/",
      identifier: 'home'
    }
    // ...(
    //   isLoggedIn ? [{
    //     menu: uD_menu_registered_events_text,
    //     link: "/dashboard/registered-events",
    //     identifier: '/dashboard/registered-events'
    //   }] : []
    // )
  ];

  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      setActiveTab('Home');
    } else {
      setActiveTab(path || '');
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };
  const handleProfileClick = () => {
    setOpenProfileDialog(true);
    setMobileOpen(false); // Close the drawer when opening the dialog
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center", padding: 2 }}>
      {/* <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography> */}
      {logoSrc && <img className="max-w-[180px] justify-self-center" src={logoSrc} alt="Logo" />}
      {/* <Divider /> */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.menu} disablePadding>
            {

              <ListItemButton
                sx={{ textAlign: "center", color: activeTab === item?.identifier ? "primary.main" : "text.disabled" }}
              >
                <ListItemText primary={item.menu} onClick={() => {
                  navigate(item.link)
                }} />
              </ListItemButton>
            }

          </ListItem>
        ))}
      </List>


      {(!isLoggedIn) ?
        <Button onClick={() => { navigate('/sign-in') }} sx={{ borderRadius: '4px', borderColor: "primary.main", backgroundColor: "transparent", color: "primary.main", }} variant="outlined" size="medium">{uD_menu_login_text}</Button> :
        <Button onClick={() => signOut()} sx={{ borderRadius: '4px', borderColor: "primary.main", backgroundColor: "transparent", color: "primary.main", }} variant="outlined" size="medium">{t('uD_menu_logout_text')}</Button>
      }
    </Box>
  );

  //   const container = window !== undefined ? () => window().document.body : undefined;
  function checkImageExists(url, callback) {
    const img = new Image();
    img.onload = () => callback(true); // Image exists
    img.onerror = () => callback(false); // Image doesn't exist
    img.src = url; // Start loading the image
  }

  useEffect(() => {
    if (logoSrc) {
      checkImageExists(logoSrc, (exists) => {
        if (!exists) {
          setLogoSrc('');
        }
      });
    }
  }, [logoSrc]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        sx={{ backgroundColor: "common.white", boxShadow: "none" }}
      >
        <Container className="max-w-[1160px] w-full px-20 lg:px-0 m-auto">
          <Toolbar className=" m-auto h-[70px] md:h-[90px] !p-0">
            {/* <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                >
                MUI11
            </Typography> */}
            <Box onClick={() => { navigate((tenantId !== undefined && tenantId != null ? ("/?t=" + tenantId) : "/")) }} sx={{ flexGrow: 1, display: { xs: "block", sm: "block" } }}>
              {/* <img className="max-w-[160px] md:max-w-[180px] lg:max-w-[205px]"  */}
              {
                logoSrc && (
                  <div className="text-center">
                    <img className="max-h-[40px] max-w-[300px] cursor-pointer"
                      src={`${logoSrc}?v=${new Date().getTime()}`} alt="Logo"
                    // onError={() => setLogoSrc(defaultLogoImageUrl('default.webp'))}
                    />
                  </div>
                )
              }
            </Box>

            <Box className="p-20" sx={{ display: { xs: "block", sm: "none" } }}>
              <LanguageSwitcher />
            </Box>

            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: "primary.main", display: { sm: "none" },
                '&:hover': {
                  backgroundColor: "primary.main",
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: "none", sm: "flex" } }}>
              {navItems.map((item) => (

                <Button key={item.menu}
                  onClick={() => {
                    navigate(item.link)
                  }}
                  sx={{
                    color: activeTab === item.identifier ? 'primary.main' : "text.disabled", backgroundColor: 'transparent',
                    fontSize: "16px",
                    margin: "0 8px",
                    '&:hover': {
                      // backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,.04)'
                      backgroundColor: 'transparent',
                      color: "primary.main",
                    },
                    '&.active': {
                      // backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,.04)'
                      backgroundColor: 'transparent',
                      color: "primary.main",
                      fontWeight: 'bold',
                    },
                  }}>
                  {item.menu}
                </Button>
              ))}
              <div className="flex h-full items-center overflow-x-auto space-x-16">
                {/* <NavigationSearch />
                <NotificationPanelToggleButton /> */}
                <LanguageSwitcher />
                {(!isLoggedIn) ? (
                  <Button
                    onClick={() => { navigate('/sign-in') }}
                    sx={{
                      borderRadius: '4px',
                      borderWidth: "2px",
                      borderColor: "primary.main",
                      backgroundColor: "transparent",
                      color: "primary.main"
                    }}
                    variant="outlined"
                    size="medium"
                  >
                    {uD_menu_login_text}
                  </Button>
                ) : (
                  <UserMenu setOpenProfileDialog={setOpenProfileDialog} openProfileDialog={openProfileDialog} data={user?.data} />
                )})
              </div>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <nav>
        <Drawer
          //   container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}



export default Header;
