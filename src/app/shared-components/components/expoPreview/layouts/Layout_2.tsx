import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_2 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
  const [boothDetails, setBoothDetails] = useState<any>();
  const { tenant_id, id } = useParams()
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { trackEvent } = useAnalytics();
  const billboardLeft: any = json?.billBoard?.billboardLeft?.data;
  const billboardCenter: any = json?.billBoard?.billboardCenter?.data;
  const billboardRight: any = json?.billBoard?.billboardRight?.data;

  const boothDimensions: any = {
    booth_1: {
      id: "booth_1",
      x: 100,
      y: 482,
      width: 313,
      height: 182,
      imageX: 178,
      imageY: 471,
      imageWidth: 158,
      imageHeight: 49,
    },
    booth_2: {
      id: "booth_2",
      x: 527,
      y: 397,
      width: 312,
      height: 181,
      imageX: 604,
      imageY: 385,
      imageWidth: 158,
      imageHeight: 49,
    },
    booth_3: {
      id: "booth_3",
      x: 950,
      y: 482,
      width: 313,
      height: 182,
      imageX: 1030,
      imageY: 471,
      imageWidth: 158,
      imageHeight: 49,
    },
    booth_4: {
      id: "booth_4",
      x: 209,
      y: 355,
      width: 253,
      height: 147,
      imageX: 257,
      imageY: 317,
      imageWidth: 158,
      imageHeight: 49,
    },
    booth_5: {
      id: "booth_5",
      x: 890,
      y: 335,
      width: 253,
      height: 147,
      imageX: 951,
      imageY: 317,
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
    <div style={{ width: "100%", height: "100%" }}>
      <svg width="100%" height="100%" viewBox="0 0 1366 768">
        <defs>
          <pattern
            id="bg"
            patternUnits="userSpaceOnUse"
            width="1366"
            height="768"
          >
            <image
              href={`${expoLayoutUrl("layout_2.webp")}`}
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
            tenant={tenant_id || expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 137 }}
            size={{ width: 212, height: 120 }}
            tenant={tenant_id || expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 128 }}
            size={{ width: 242, height: 138 }}
            tenant={tenant_id || expo?.expTenantId}
          />
        )}

        <defs>
          {/* Define clip paths for each banner and booth */}
          <clipPath id="bannerCenter">
            <path d="M 562 130 C 562 128.895 562.895 128 564 128 H 802 C 803.105 128 804 128.895 804 130 V 264 C 804 265.105 803.105 266 802 266 H 564 C 562.895 266 562 265.105 562 264 V 130 Z" />
          </clipPath>
          <clipPath id="bannerLeft">
            <path d="M 330 139 C 330 137.895 330.895 137 332 137 H 540 C 541.105 137 542 137.895 542 139 V 255 C 542 256.105 541.105 257 540 257 H 332 C 330.895 257 330 256.105 330 255 V 139 Z" />
          </clipPath>
          <clipPath id="bannerRight">
            <path d="M 824 139 C 824 137.895 824.895 137 826 137 H 1034 C 1035.1 137 1036 137.895 1036 139 V 255 C 1036 256.105 1035.1 257 1034 257 H 826 C 824.895 257 824 256.105 824 255 V 139 Z" />
          </clipPath>
          <clipPath id="booth_1">
            <path d="M 178 473 C 178 471.895 178.895 471 180 471 H 334 C 335.105 471 336 471.895 336 473 V 518 C 336 519.105 335.105 520 334 520 H 180 C 178.895 520 178 519.105 178 518 V 473 Z" />
          </clipPath>
          <clipPath id="booth_2">
            <path d="M 604 387 C 604 385.895 604.895 385 606 385 H 760 C 761.105 385 762 385.895 762 387 V 432 C 762 433.105 761.105 434 760 434 H 606 C 604.895 434 604 433.105 604 432 V 387 Z" />
          </clipPath>
          <clipPath id="booth_3">
            <path d="M 1188 473 C 1188 471.895 1187.1 471 1186 471 H 1032 C 1030.9 471 1030 471.895 1030 473 V 518 C 1030 519.105 1030.9 520 1032 520 H 1186 C 1187.1 520 1188 519.105 1188 518 V 473 Z" />
          </clipPath>
          <clipPath id="booth_4">
            <path d="M 257 319 C 257 317.895 257.895 317 259 317 H 413 C 414.105 317 415 317.895 415 319 V 364 C 415 365.105 414.105 366 413 366 H 259 C 257.895 366 257 365.105 257 364 V 319 Z" />
          </clipPath>
          <clipPath id="booth_5">
            <path d="M 1109 319 C 1109 317.895 1108.1 317 1107 317 H 953 C 951.895 317 951 317.895 951 319 V 364 C 951 365.105 951.895 366 953 366 H 1107 C 1108.1 366 1109 365.105 1109 364 V 319 Z" />
          </clipPath>
        </defs>

        {/* Map over booth data */}
        {json?.booth.map((boothObj, index) => {
          const [boothKey] = Object.keys(boothObj);
          const booth = boothObj[boothKey];
          const dimensions = boothDimensions[boothKey];

          if (!dimensions || !booth?.data) return null;

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
                href={expoBoothLogoImageUrl(
                  booth?.data?.boothImages?.boothLogo1,
                  expo?.expTenantId
                )}
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

export default Layout_2;
