import React, { useState } from "react";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useNavigate, useParams } from "react-router";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_4 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
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
      x: 82,
      y: 500.922,
      width: 288.703,
      height: 219.048,
      imageX: 82.143,
      imageY: 457.171,
      imageWidth: 167.768,
      imageHeight: 76.584,
    },
    booth_2: {
      id: "booth_2",
      x: 1029.3,
      y: 500.922,
      width: 288.703,
      height: 219.048,
      imageX: 1116.09,
      imageY: 457.171,
      imageWidth: 167.77,
      imageHeight: 76.584,
    },
    booth_3: {
      id: "booth_3",
      x: 249,
      y: 424,
      width: 214,
      height: 154,
      imageX: 290.14,
      imageY: 411.171,
      imageWidth: 130.773,
      imageHeight: 60.576,
    },
    booth_4: {
      id: "booth_4",
      x: 581,
      y: 424,
      width: 204,
      height: 140,
      imageX: 624,
      imageY: 381,
      imageWidth: 117,
      imageHeight: 51,
    },
    booth_5: {
      id: "booth_5",
      x: 900,
      y: 424,
      width: 214,
      height: 154,
      imageX: 945.087,
      imageY: 411.171,
      imageWidth: 130.773,
      imageHeight: 60.576,
    },
    booth_6: {
      id: "booth_6",
      x: 425,
      y: 390,
      width: 119,
      height: 89,
      imageX: 446.298,
      imageY: 365.344,
      imageWidth: 88.38,
      imageHeight: 33.909,
    },
    booth_7: {
      id: "booth_7",
      x: 810,
      y: 390,
      width: 119,
      height: 89,
      imageX: 831.322,
      imageY: 365.344,
      imageWidth: 88.38,
      imageHeight: 33.909,
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
            width={1366}
            height={768}
          >
            <image
              href={expoLayoutUrl("layout_4.webp")}
              width={1366}
              height={768}
            />
          </pattern>
        </defs>
        <rect width={1366} height={768} fill="url(#bg)" />
        {billboardRight && (
          <BillboardManager
            data={billboardRight}
            position={{ x: 824, y: 211 }}
            size={{ width: 210, height: 116 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 211 }}
            size={{ width: 210, height: 116 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 202 }}
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
          <clipPath id="booth_1">
            <path
              d="M 82.143 472.723 C 82.0637 471.63 82.8794 470.676 83.972 470.585 L 245.181 457.171 C 246.309 457.077 247.29 457.938 247.344 459.069 L 249.911 512.886 C 249.961 513.935 249.191 514.845 248.147 514.968 L 88.6673 533.755 C 87.5354 533.888 86.5211 533.05 86.4386 531.913 L 82.143 472.723 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_2">
            <path
              d="M 1283.86 472.723 C 1283.94 471.63 1283.12 470.676 1282.03 470.585 L 1120.82 457.171 C 1119.69 457.077 1118.71 457.938 1118.66 459.069 L 1116.09 512.886 C 1116.04 513.935 1116.81 514.845 1117.85 514.968 L 1277.33 533.755 C 1278.46 533.888 1279.48 533.05 1279.56 531.913 L 1283.86 472.723 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_3">
            <path
              d="M 290.14 423.858 C 290.062 422.767 290.876 421.815 291.967 421.723 L 416.783 411.171 C 417.913 411.076 418.896 411.938 418.95 413.07 L 420.913 454.888 C 420.962 455.935 420.194 456.843 419.152 456.968 L 295.662 471.747 C 294.528 471.883 293.511 471.043 293.43 469.904 L 290.14 423.858 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_4">
            <path
              d="M 624 381 C 624 379.895 624.895 379 626 379 H 741 C 742.105 379 743 379.895 743 381 V 432 C 743 433.105 742.105 434 741 434 H 626 C 624.895 434 624 433.105 624 432 V 381 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_5">
            <path
              d="M 1075.86 423.858 C 1075.94 422.767 1075.12 421.815 1074.03 421.723 L 949.216 411.171 C 948.087 411.076 947.103 411.938 947.05 413.07 L 945.087 454.888 C 945.038 455.935 945.806 456.843 946.847 456.968 L 1070.34 471.747 C 1071.47 471.883 1072.49 471.043 1072.57 469.904 L 1075.86 423.858 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_6">
            <path
              d="M 446.298 367.4 C 446.266 366.274 447.17 365.344 448.297 365.344 L 532.522 365.347 C 533.623 365.347 534.516 366.236 534.522 367.336 L 534.678 395.299 C 534.684 396.39 533.815 397.285 532.724 397.31 L 449.179 399.253 C 448.079 399.278 447.164 398.41 447.134 397.309 L 446.298 367.4 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_7">
            <path
              d="M 919.702 367.4 C 919.734 366.274 918.829 365.344 917.703 365.344 L 833.477 365.347 C 832.377 365.347 831.484 366.236 831.477 367.336 L 831.322 395.299 C 831.316 396.39 832.185 397.285 833.275 397.31 L 916.82 399.253 C 917.921 399.278 918.835 398.41 918.866 397.309 L 919.702 367.4 Z"
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

export default Layout_4;
