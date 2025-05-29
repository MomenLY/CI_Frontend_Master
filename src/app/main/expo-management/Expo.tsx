import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import ExpoList from "./ExpoList";
import MainHeader from "app/shared-components/components/MainHeader";
import ExpoSidebarContent from "./ExpoSidbarContent";
import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSettings, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import FuseLoading from "@fuse/core/FuseLoading";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
}));

function Expo() {
  const { t } = useTranslation('expoManagement');
  const navigation = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    checkRole();
  }, [])

  const checkRole = async () => {
    const userDetails = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    // const boothManagerRoleId = settings?.boothManagerRoleId;
    const boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
    const speakerRoleId = settings?.speakerRoleId;
    if (userDetails.roleId === boothManagerRoleId || userDetails.roleId === speakerRoleId) {      
      navigate('/dashboard');
    }
  }

  useEffect(() => {
    setRightSidebarOpen(Boolean(location.pathname.includes('/edit') || location.pathname.includes('/new')));
  }, [routeParams]);

  return (
    <Root
      header={
        <div className="pt-[30px] p-[20px] pb-[15px] min-h-full flex flex-auto flex-col w-full ">
          <OnionCustomHeader
            label={t('expo_subHeading')}
            buttonUrl="new"
            heading={t('expo_heading')}
            searchKeyword={keyword} setSearchKeyword={setKeyword}
          />
        </div>
      }
      content={
        <div className="px-[20px] pt-[10px] pb-[52px] min-h-full flex flex-auto flex-col w-full ">
          <ExpoList keyword={keyword} setKeyword={setKeyword} />
        </div>
      }
      rightSidebarContent={<ExpoSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigation('/admin/expo-management');
      }
      }
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"

    />
  );
}

export default Expo;