import React, { useState } from "react";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useNavigate, useParams } from "react-router";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_7 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
  const [boothDetails, setBoothDetails] = useState<any>();
  const { tenant_id, id } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useAnalytics();
  const billboardLeft: any = json?.billBoard?.billboardLeft?.data;
  const billboardCenter: any = json?.billBoard?.billboardCenter?.data;
  const billboardRight: any = json?.billBoard?.billboardRight?.data;
  const user = useAppSelector(selectUser)
  const boothDimensions: any = {
    booth_1: {
      id: "booth_1",
      x: 48,
      y: 405,
      width: 420,
      height: 235,
      imageX: 221.5,
      imageY: 398.518,
      imageWidth: 158,
      imageHeight: 57.862,
    },
    booth_2: {
      id: "booth_2",
      x: 981,
      y: 405,
      width: 420,
      height: 235,
      imageX: 981,
      imageY: 398.518,
      imageWidth: 158,
      imageHeight: 57.862,
    },
    booth_3: {
      id: "booth_3",
      x: 508,
      y: 314,
      width: 345,
      height: 198,
      imageX: 604,
      imageY: 308,
      imageWidth: 158,
      imageHeight: 49,
    },
  };

  function handleBoothPress(arg0: { layout: string; booth: any; data: any }) {
    setShowEachBooth(true);
    setBoothDetails({ ...arg0, tenantId: expo?.expTenantId });

    if (tenant_id) {
      navigate(`/${tenant_id}/events/join/${id}/booth/${arg0.data.id}`);
      trackEvent(id, 'Booth', {
        details: {
          "boothId": arg0.data.id,
          "boothName": arg0.data.boothCode,
          "boothManager": {
            "_id": arg0.data.boothManager.id,
            "name": arg0.data.boothContact.name,
            "email": arg0.data.boothContact.email
          },
          "email": user.data.email,
          "name": user.data.displayName
        }
      });
    }
  }

  if (showEachBooth) return <BoothLayoutManager data={boothDetails} />;

  return (
    <div style={{}}>
      <svg width="100%" height="100%" viewBox="0 0 1366 768">
        <defs>
          <pattern
            id="bg"
            patternUnits="userSpaceOnUse"
            width="1366"
            height="768"
          >
            <image
              href={expoLayoutUrl("layout_7.webp")}
              width="1366"
              height="768"
            />
          </pattern>
        </defs>
        <rect width="1366" height="768" fill="url(#bg)" />

        {billboardRight && (
          <BillboardManager
            data={billboardRight}
            position={{ x: 824, y: 137 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 137 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 128 }}
            size={{ width: 242, height: 138 }}
            tenant={expo?.expTenantId}
          />
        )}

        <defs>
          <clipPath id="bannerCenter">
            <path
              d="M 562 130 C 562 128.895 562.895 128 564 128 H 802 C 803.105 128 804 128.895 804 130 V 264 C 804 265.105 803.105 266 802 266 H 564 C 562.895 266 562 265.105 562 264 V 130 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="bannerLeft">
            <path
              d="M 330 139 C 330 137.895 330.895 137 332 137 H 540 C 541.105 137 542 137.895 542 139 V 255 C 542 256.105 541.105 257 540 257 H 332 C 330.895 257 330 256.105 330 255 V 139 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="bannerRight">
            <path
              d="M 824 139 C 824 137.895 824.895 137 826 137 H 1034 C 1035.1 137 1036 137.895 1036 139 V 255 C 1036 256.105 1035.1 257 1034 257 H 826 C 824.895 257 824 256.105 824 255 V 139 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_1">
            <path
              d="M 221.5 403.463 C 221.5 402.373 222.372 401.484 223.462 401.463 L 377.462 398.539 C 378.581 398.518 379.5 399.42 379.5 400.539 V 445.611 C 379.5 446.672 378.672 447.548 377.614 447.608 L 223.614 456.38 C 222.466 456.446 221.5 455.533 221.5 454.384 V 403.463 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_2">
            <path
              d="M 1139 403.463 C 1139 402.373 1138.13 401.484 1137.04 401.463 L 983.038 398.539 C 981.919 398.518 981 399.42 981 400.539 V 445.611 C 981 446.672 981.828 447.548 982.886 447.608 L 1136.89 456.38 C 1138.03 456.446 1139 455.533 1139 454.384 V 403.463 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_3">
            <path
              d="M 604 310 C 604 308.895 604.895 308 606 308 H 760 C 761.105 308 762 308.895 762 310 V 355 C 762 356.105 761.105 357 760 357 H 606 C 604.895 357 604 356.105 604 355 V 310 Z"
              fill="white"
            />
          </clipPath>
        </defs>

        {json?.booth.map((boothObj, index) => {
          const [boothKey] = Object.keys(boothObj);
          const booth = boothObj[boothKey];
          const dimensions = boothDimensions[boothKey];

          if (!dimensions) return null; // Skip if dimensions are not found
          if (!booth?.data) return null;

          return (
            <React.Fragment key={boothKey}>
              <rect
                x={dimensions.x}
                y={dimensions.y}
                width={dimensions.width}
                height={dimensions.height}
                fill="transparent"
                onClick={() =>
                  handleBoothPress({
                    layout: expo?.expLayoutId,
                    booth: dimensions.id,
                    data: booth?.data,
                  })
                }
              />
              <image
                href={`${expoBoothLogoImageUrl(booth?.data?.boothImages?.boothLogo1, expo?.expTenantId)}`}
                x={dimensions.imageX}
                y={dimensions.imageY}
                width={dimensions.imageWidth}
                height={dimensions.imageHeight}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#${boothKey})`}
                onClick={() =>
                  handleBoothPress({
                    layout: expo?.expLayoutId,
                    booth: dimensions.id,
                    data: booth?.data,
                  })
                }
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default Layout_7;
