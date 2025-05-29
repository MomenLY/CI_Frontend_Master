import React, { useState } from "react";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useNavigate, useParams } from "react-router";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_5 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
  const [boothDetails, setBoothDetails] = useState<any>();
  const { tenant_id, id } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useAnalytics();
  const billboardLeft: any = json?.billBoard?.billboardLeft?.data;
  const billboardCenter: any = json?.billBoard?.billboardCenter?.data;
  const billboardRight: any = json?.billBoard?.billboardRight?.data;
  const user = useAppSelector(selectUser);
  const boothDimensions: any = {
    booth_1: {
      id: "booth_1",
      x: 48,
      y: 507,
      width: 343,
      height: 193,
      imageX: 158.5,
      imageY: 456.078,
      imageWidth: 192.38,
      imageHeight: 69.393,
    },
    booth_2: {
      id: "booth_2",
      x: 1000.3,
      y: 507,
      width: 343,
      height: 193,
      imageX: 1015.12,
      imageY: 456.078,
      imageWidth: 192.38,
      imageHeight: 69.393,
    },
    booth_3: {
      id: "booth_3",
      x: 380,
      y: 457,
      width: 228,
      height: 128,
      imageX: 457,
      imageY: 425.078,
      imageWidth: 120.881,
      imageHeight: 43.892,
    },
    booth_4: {
      id: "booth_4",
      x: 710,
      y: 424,
      width: 228,
      height: 128,
      imageX: 788.119,
      imageY: 425.078,
      imageWidth: 120.881,
      imageHeight: 43.892,
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
              href={expoLayoutUrl("layout_5.webp")}
              width="1366"
              height="768"
            />
          </pattern>
        </defs>
        <rect width="1366" height="768" fill="url(#bg)" />
        {billboardRight && (
          <BillboardManager
            data={billboardRight}
            position={{ x: 824, y: 209 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 209 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 200 }}
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
              d="M 158.5 458.164 C 158.5 456.997 159.495 456.078 160.658 456.17 L 346.257 470.862 C 347.255 470.941 348.041 471.746 348.096 472.745 L 350.88 523.328 C 350.945 524.497 349.996 525.471 348.826 525.438 L 160.443 520.055 C 159.361 520.024 158.5 519.138 158.5 518.056 V 458.164 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_2">
            <path
              d="M 1207.5 458.164 C 1207.5 456.997 1206.51 456.078 1205.34 456.17 L 1019.74 470.862 C 1018.74 470.941 1017.96 471.746 1017.9 472.745 L 1015.12 523.328 C 1015.05 524.497 1016 525.471 1017.17 525.438 L 1205.56 520.055 C 1206.64 520.024 1207.5 519.138 1207.5 518.056 V 458.164 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_3">
            <path
              d="M 457 427.164 C 457 425.997 457.995 425.078 459.159 425.171 L 574.372 434.356 C 575.37 434.435 576.155 435.241 576.21 436.24 L 577.881 466.828 C 577.945 467.996 576.997 468.97 575.827 468.936 L 458.942 465.572 C 457.861 465.541 457 464.655 457 463.573 V 427.164 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_4">
            <path
              d="M 909 427.164 C 909 425.997 908.005 425.078 906.841 425.171 L 791.629 434.356 C 790.63 434.435 789.845 435.241 789.79 436.24 L 788.119 466.828 C 788.055 467.996 789.004 468.97 790.173 468.936 L 907.058 465.572 C 908.139 465.541 909 464.655 909 463.573 V 427.164 Z"
              fill="white"
            />
          </clipPath>
        </defs>
        <>
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
        </>
      </svg>
    </div>
  );
};

export default Layout_5;
