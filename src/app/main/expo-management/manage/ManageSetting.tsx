import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import { useEffect, useState } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import FuseSuspense from "@fuse/core/FuseSuspense";
import InnerSidebar from "./InnerSidebar";
import MobHeader from "app/shared-components/components/MobHeader";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import FuseLoading from "@fuse/core/FuseLoading";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";


const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    // borderBottomWidth: 1,
    // borderStyle: 'solid',
    // borderColor: theme.palette.divider
    border: 0,
  },
  "& .FusePageSimple-toolbar": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

/**
 * The SimpleWithSidebarsNormalScroll page.
 */
function ManageSetting() {
  const routeParams = useParams();
  const navigate = useNavigate();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const location = useLocation();
  const [expo, setExpo] = useState(null)
  const { id } = location.state || {};
  const [isExpoPresent, setIsExpoPresent] = useState(false);
  const [showError, setShowError] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('expoManagement');


  useEffect(() => {
    setRightSidebarOpen(
      location.pathname.includes("/edit") || location.pathname.includes("/new")
    );
    // if (
    //   !location.pathname.includes("/edit") &&
    //   !location.pathname.includes("/new")
    // ) {
    validateExpo(routeParams.id);
    // }
  }, [routeParams]);

  const validateExpo = async (id) => {
    // get only req field
    try {
      let expoDetails = await LocalCache.getItem(
        cacheIndex.expoDetails + "_" + id,
        getSingleExpoAPI.bind(this, id)
      );
      if (expoDetails === null || expoDetails.data.expo === null) {
        expoDetails = await getSingleExpoAPI(id);
        await LocalCache.setItem('expoDetails' + "_" + id, expoDetails);
      }
      if (expoDetails?.data?.expo?.expCode) {
        setIsExpoPresent(true);
        setExpo(expoDetails.data.expo);
      } else {
        dispatch(showMessage({ message: `${t('expo_not_found')}`, variant: 'error' }))
        navigate('/admin/expo-management')
        setIsExpoPresent(false);
        setShowError(true);
      }
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  const navigationData = [
    {
      id: '1',
      title: t('expo_subMenu_manage'),
      type: 'group',
      children: [
        {
          id: '1.1',
          title: t('expo_subMenu_agenda'),
          type: 'item',
          icon: 'material-outline:view_agenda',
          url: 'agenda',

        },
        {
          id: '1.2',
          title: t('expo_subMenu_hall'),
          type: 'item',
          icon: 'material-outline:other_houses',
          url: 'hall',
        },
        {
          id: '1.3',
          title: t('expo_subMenu_billboard'),
          type: 'item',
          icon: 'material-outline:campaign',
          url: 'billboard',
          disabled: expo?.expType === 'Offline' ? true : false,
        },
        {
          id: '1.4',
          title: t('expo_subMenu_booth'),
          type: 'item',
          icon: 'material-outline:storefront',
          url: 'booth',
          disabled: expo?.expType === 'Offline' ? true : false,
        },
        {
          id: '1.5',
          title: t('expo_subMenu_schedule'),
          type: 'item',
          icon: 'material-outline:event_available',
          url: 'schedule',
        },
        {
          id: '1.6',
          title: t('expo_subMenu_general'),
          type: 'item',
          icon: 'heroicons-outline:plus-circle',
          url: 'general',
        },
        {
          id: '1.7',
          title: t('expo_subMenu_registration'),
          type: 'item',
          icon: 'material-outline:app_registration',
          url: 'registration',
        },
        {
          id: '1.8',
          title: t('expo_subMenu_attendees'),
          type: 'item',
          icon: 'material-outline:group',
          url: 'attendees'
        }
      ]
    },
    {
      id: '2',
      title: t('expo_report'),
      type: 'group',
      children: [
        {
          id: '2.1',
          title: t('expo_subMenu_billboard'),
          type: 'item',
          icon: 'material-outline:feed',
          url: 'billboard-report',
          disabled: expo?.expType === 'Offline' ? true : false,
        },
        {
          id: '2.2',
          title: t('expo_subMenu_booth'),
          type: 'item',
          icon: 'material-outline:feed',
          url: 'booth-report',
          disabled: expo?.expType === 'Offline' ? true : false,
        },
      ]
    }
  ];

  return (
    <Root
      header={
        <MobHeader
          leftSidebarToggle={() => {
            setLeftSidebarOpen(!leftSidebarOpen);
          }}
        />
      }
      content={
        <div className="min-h-full flex flex-auto flex-col w-full ">
          {isExpoPresent ? (
            <FuseSuspense>
              <Outlet />
            </FuseSuspense>
          ) : (
            <FuseLoading />
          )}
          {/* {
						showError && <OnionNotFound message="No Expo Found"/>
					} */}
        </div>
      }
      leftSidebarOpen={leftSidebarOpen}
      leftSidebarOnClose={() => {
        setLeftSidebarOpen(false);
      }}
      leftSidebarContent={<InnerSidebar navigationData={navigationData} />}
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default ManageSetting;