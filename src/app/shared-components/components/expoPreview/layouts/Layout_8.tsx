import React, { useState } from "react";
import { expoBoothLogoImageUrl, expoLayoutUrl } from "src/utils/urlHelper";
import BillboardManager from "../billBoard/BillboardManager";
import BoothLayoutManager from "../booth/BoothLayoutMap";
import { useNavigate, useParams } from "react-router";
import { useAnalytics } from "app/shared-components/AnalyticsProvider";
import { useAppSelector } from "app/store/hooks";
import { selectUser } from "src/app/auth/user/store/userSlice";

const Layout_8 = ({ json, expo, showEachBooth, setShowEachBooth }) => {
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
      x: 41,
      y: 494.52,
      width: 289.5,
      height: 227.5,
      imageX: 75.0638,
      imageY: 443.172,
      imageWidth: 182.8472,
      imageHeight: 83.583,
    },
    booth_2: {
      id: "booth_2",
      x: 1013,
      y: 491,
      width: 315,
      height: 239,
      imageX: 1108.09,
      imageY: 443.172,
      imageWidth: 182.85,
      imageHeight: 83.583,
    },
    booth_3: {
      id: "booth_3",
      x: 208,
      y: 355,
      width: 233,
      height: 168,
      imageX: 253.063,
      imageY: 341.079,
      imageWidth: 142.899,
      imageHeight: 65.809,
    },
    booth_4: {
      id: "booth_4",
      x: 910,
      y: 355,
      width: 233,
      height: 168,
      imageX: 970.088,
      imageY: 341.173,
      imageWidth: 142.852,
      imageHeight: 65.58,
    },
    booth_5: {
      id: "booth_5",
      x: 358,
      y: 272,
      width: 137,
      height: 102,
      imageX: 381.742,
      imageY: 242.137,
      imageWidth: 102.453,
      imageHeight: 39.299,
    },
    booth_6: {
      id: "booth_6",
      x: 910,
      y: 272,
      width: 137,
      height: 102,
      imageX: 881.989,
      imageY: 242.137,
      imageWidth: 102.269,
      imageHeight: 37.033,
    },
    booth_7: {
      id: "booth_7",
      x: 436,
      y: 209,
      width: 110,
      height: 59,
      imageX: 442.631,
      imageY: 187.863,
      imageWidth: 58.868,
      imageHeight: 22.785,
    },
    booth_8: {
      id: "booth_8",
      x: 830,
      y: 209,
      width: 110,
      height: 59,
      imageX: 864.518,
      imageY: 187.863,
      imageWidth: 58.851,
      imageHeight: 22.789,
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
              href={`${expoLayoutUrl("layout_8.webp")}`}
              width="1366"
              height="768"
            />
          </pattern>
        </defs>
        <rect width="1366" height="768" fill="url(#bg)" />

        {billboardRight && (
          <BillboardManager
            data={billboardRight}
            position={{ x: 824, y: 47 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardLeft && (
          <BillboardManager
            data={billboardLeft}
            position={{ x: 330, y: 47 }}
            size={{ width: 212, height: 120 }}
            tenant={expo?.expTenantId}
          />
        )}
        {billboardCenter && (
          <BillboardManager
            data={billboardCenter}
            position={{ x: 562, y: 38 }}
            size={{ width: 242, height: 138 }}
            tenant={expo?.expTenantId}
          />
        )}

        <defs>
          <clipPath id="bannerCenter">
            <path
              d="M 562 30 C 562 28.8954 562.895 28 564 28 H 802 C 803.105 28 804 28.8954 804 30 V 164 C 804 165.105 803.105 166 802 166 H 564 C 562.895 166 562 165.105 562 164 V 30 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="bannerLeft">
            <path
              d="M 330 39 C 330 37.8954 330.895 37 332 37 H 540 C 541.105 37 542 37.8954 542 39 V 155 C 542 156.105 541.105 157 540 157 H 332 C 330.895 157 330 156.105 330 155 V 39 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="bannerRight">
            <path
              d="M 824 39 C 824 37.8954 824.895 37 826 37 H 1034 C 1035.1 37 1036 37.8954 1036 39 V 155 C 1036 156.105 1035.1 157 1034 157 H 826 C 824.895 157 824 156.105 824 155 V 39 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_1">
            <path
              d="M 75.143 459.973 C 75.0638 458.88 75.8793 457.927 76.9717 457.836 L 252.935 443.172 C 254.063 443.078 255.045 443.939 255.099 445.07 L 257.911 504.137 C 257.961 505.186 257.191 506.095 256.148 506.219 L 82.0779 526.755 C 80.9458 526.888 79.9312 526.05 79.8488 524.913 L 75.143 459.973 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_3">
            <path
              d="M 253.142 354.757 C 253.063 353.665 253.878 352.712 254.97 352.621 L 391.589 341.173 C 392.718 341.079 393.7 341.94 393.754 343.072 L 395.912 388.639 C 395.962 389.687 395.192 390.596 394.15 390.719 L 258.987 406.753 C 257.854 406.888 256.839 406.049 256.757 404.911 L 253.142 354.757 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_5">
            <path
              d="M 381.774 244.192 C 381.742 243.066 382.647 242.137 383.773 242.137 L 482.012 242.141 C 483.112 242.141 484.005 243.029 484.011 244.13 L 484.195 277.16 C 484.201 278.25 483.332 279.145 482.242 279.17 L 384.806 281.436 C 383.705 281.462 382.791 280.593 382.76 279.492 L 381.774 244.192 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_7">
            <path
              d="M 443.079 189.83 C 443.104 188.735 444.006 187.863 445.101 187.876 L 499.472 188.486 C 500.591 188.499 501.482 189.428 501.448 190.547 L 500.895 208.652 C 500.862 209.736 499.971 210.596 498.887 210.591 L 444.647 210.342 C 443.528 210.337 442.631 209.415 442.657 208.297 L 443.079 189.83 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_8">
            <path
              d="M 922.921 189.83 C 922.896 188.735 921.994 187.863 920.899 187.876 L 866.528 188.486 C 865.409 188.499 864.518 189.428 864.552 190.547 L 865.105 208.652 C 865.138 209.736 866.029 210.596 867.113 210.591 L 921.353 210.342 C 922.472 210.337 923.369 209.415 923.343 208.297 L 922.921 189.83 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_6">
            <path
              d="M 984.226 244.192 C 984.258 243.066 983.353 242.137 982.227 242.137 L 883.988 242.141 C 882.888 242.141 881.995 243.029 881.989 244.13 L 881.805 277.16 C 881.799 278.25 882.668 279.145 883.758 279.17 L 981.194 281.436 C 982.295 281.462 983.209 280.593 983.24 279.492 L 984.226 244.192 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_4">
            <path
              d="M 1112.86 354.757 C 1112.94 353.665 1112.12 352.712 1111.03 352.621 L 974.411 341.173 C 973.282 341.079 972.3 341.94 972.246 343.072 L 970.088 388.639 C 970.038 389.687 970.808 390.596 971.85 390.719 L 1107.01 406.753 C 1108.15 406.888 1109.16 406.049 1109.24 404.911 L 1112.86 354.757 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="booth_2">
            <path
              d="M 1290.86 459.973 C 1290.94 458.88 1290.12 457.927 1289.03 457.836 L 1113.07 443.172 C 1111.94 443.078 1110.96 443.939 1110.9 445.07 L 1108.09 504.137 C 1108.04 505.186 1108.81 506.095 1109.85 506.219 L 1283.92 526.755 C 1285.05 526.888 1286.07 526.05 1286.15 524.913 L 1290.86 459.973 Z"
              fill="white"
            />
          </clipPath>

          {/* Additional clipPaths for booths */}
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

export default Layout_8;
