import { Path } from "glob";
import React, { useState } from "react";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useNavigate, useParams } from "react-router";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_3 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
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
      x: 75,
      y: 487,
      width: 315,
      height: 239,
      imageX: 79.143,
      imageY: 439.171,
      imageWidth: 182.768,
      imageHeight: 83.583,
    },
    booth_2: {
      id: "booth_2",
      x: 1009,
      y: 487,
      width: 315,
      height: 239,
      imageX: 1104.09,
      imageY: 439.171,
      imageWidth: 182.77,
      imageHeight: 83.583,
    },
    booth_3: {
      id: "booth_3",
      x: 273,
      y: 413,
      width: 233,
      height: 168,
      imageX: 318.142,
      imageY: 399.171,
      imageWidth: 142.77,
      imageHeight: 65.58,
    },
    booth_4: {
      id: "booth_4",
      x: 893,
      y: 413,
      width: 253,
      height: 147,
      imageX: 905.088,
      imageY: 399.171,
      imageWidth: 142.772,
      imageHeight: 65.58,
    },
    booth_5: {
      id: "booth_5",
      x: 456,
      y: 386.75,
      width: 129,
      height: 96,
      imageX: 478.39,
      imageY: 359.07,
      imageWidth: 96.436,
      imageHeight: 37.002,
    },
    booth_6: {
      id: "booth_6",
      x: 810,
      y: 386.75,
      width: 129,
      height: 96,
      imageX: 791.174,
      imageY: 359.07,
      imageWidth: 96.436,
      imageHeight: 37.002,
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
              href={`${expoLayoutUrl("layout_3.webp")}`}
              width="1366"
              height="768"
            />
          </pattern>
        </defs>
        <rect width="1366" height="768" fill="url(#bg)" />

        {billboardRight && (
          <BillboardManager
            data={billboardRight}
            position={{ x: 824, y: 179 }}
            size={{ width: 210, height: 116 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 179 }}
            size={{ width: 210, height: 116 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 170 }}
            size={{ width: 240, height: 134 }}
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
          <clipPath id="booth_4">
            <path
              d="M 1047.86 412.755 C 1047.94 411.663 1047.12 410.71 1046.03 410.619 L 909.411 399.171 C 908.282 399.077 907.3 399.938 907.246 401.07 L 905.088 446.637 C 905.039 447.685 905.808 448.594 906.85 448.718 L 1042.01 464.751 C 1043.15 464.886 1044.16 464.047 1044.24 462.909 L 1047.86 412.755 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_5">
            <path
              d="M 478.39 361.126 C 478.358 360 479.263 359.07 480.389 359.07 L 572.655 359.074 C 573.755 359.074 574.648 359.963 574.655 361.063 L 574.826 391.933 C 574.832 393.024 573.963 393.919 572.873 393.944 L 481.358 396.072 C 480.257 396.098 479.343 395.229 479.312 394.129 L 478.39 361.126 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_6">
            <path
              d="M 887.61 361.126 C 887.642 360 886.737 359.07 885.611 359.07 L 793.345 359.074 C 792.245 359.074 791.352 359.963 791.345 361.063 L 791.174 391.933 C 791.168 393.024 792.037 393.919 793.127 393.944 L 884.642 396.072 C 885.743 396.098 886.657 395.229 886.688 394.129 L 887.61 361.126 Z"
              fill="white"
            />
          </clipPath>
        </defs>

        <>
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
                  href={`${expoBoothLogoImageUrl(booth?.data?.boothImages?.boothLogo1, expo?.expTenantId)}`}
                  x={dimensions.imageX}
                  y={dimensions.imageY}
                  width={dimensions.imageWidth}
                  height={dimensions.imageHeight}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ cursor: "pointer" }}
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

export default Layout_3;
