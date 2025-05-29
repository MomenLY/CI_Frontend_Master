import Billboard from "./Billboard";
import { useTranslation } from "react-i18next";
import useCircularPlayback from "@fuse/hooks/useCircularPlayback";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useParams } from "react-router";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { getUserSession } from "app/shared-components/cache/cacheCallbacks";

const BillboardManager = ({
  data,
  position,
  size,
  tenant,
}) => {
  const { currentFile, currentIndex, totalFiles }: any = useCircularPlayback(data);
  const dispatch = useAppDispatch();
  const { t } = useTranslation('billboard');
  const { trackEvent } = useAnalytics();
  const routeParams = useParams();
  const expoId = routeParams.id;
  const user = useAppSelector(selectUser);

  const handleBannerPress = async (billboardData: any | undefined) => {
    if (billboardData?.billboardLink) {
      const billboardEntries = Object.entries(data.files).map(([key, value]) => ({
        billboardId: key,
        billboardValue: value,
      }));
      const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));
      window.open(billboardData?.billboardLink, '_blank', 'noopener,noreferrer');
      trackEvent(expoId, 'Billboard', {
        details: {
          "billboardId": billboardEntries[0].billboardId,
          "billboardAdName": billboardEntries[0].billboardValue?.billboardResources,
          "billboardName": billboardData?.billboardLayout,
          "email": user.data.email,
          "name": user.data.displayName
        }
      });
    } else {
      // dispatch(showMessage({ message: `No links provided`, variant: "info" }));
    }
  };

  return (
    <>
      {true && (
        <Billboard
          billboardData={currentFile}
          position={position}
          size={size}
          onPress={() => handleBannerPress(currentFile)}
          tenant={tenant}
        />
      )}
    </>
  );
};

export default BillboardManager