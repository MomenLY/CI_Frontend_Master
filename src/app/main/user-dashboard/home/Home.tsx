import React, { useEffect, useState } from "react";
import HomeBanner from "./HomeBanner";
import { Box, Container } from "@mui/material";
import HomeList from "./HomeList";
import { useLocation } from "react-router";
import ExpoCode from "./ExpoCode";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSettings } from "app/shared-components/cache/cacheCallbacks";
import { useTranslation } from "react-i18next";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon/FuseSvgIcon";

function Home() {
  const location = useLocation();
  const _queryParams = new URLSearchParams(location.search);
  const _newTenantId = _queryParams.get('t');
  const [tenantId, setTenantId] = useState(_newTenantId || null);
  const [showMessage, setShowMessage] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newTenantId = queryParams.get('t');
    getUserData();
    if (newTenantId !== tenantId) {
      setTenantId(newTenantId);
    }
  }, [location.search]);

  const getUserData = async () => {
    const user = await LocalCache.getItem(cacheIndex.userData);
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    let boothManagerRoleId = import.meta.env.VITE_BOOTH_MANAGER_ROLE_ID;
    let speakerRoleId = settings?.speakerRoleId;
    if (user) {
      if (user.roleId === boothManagerRoleId || user.roleId === speakerRoleId) {
        setShowMessage(true)
      } else {
        setShowMessage(false)
      }
    } else {
      setShowMessage(false)
    }
  }

  return (
    <>
      <Box
        className="pt-[70px] md:pt-[90px]">
        {showMessage && <div className="unpublish mt-0 flex justify-center items-center">
          <FuseSvgIcon className="text-48 me-6" size={24} color="white">
            material-outline:info
          </FuseSvgIcon>
          <h5 className='ms-16 text-white text-center'>{t('gettingEmail_text')}</h5>
        </div>}
        <div className="max-w-[1160px] w-full px-20 lg:px-0 m-auto mt-0 ">
          {/* Home banner */}
          {/* <HomeBanner
            title={t('uD_Banner_text')}
            fancyTitle={t('uD_Event')}
          /> */}
          <div>
            {/* <HomeList tenantId={tenantId} /> */}
            <ExpoCode />
          </div>
        </div>
      </Box>
    </>
  );
}

export default Home;
