import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { getTenantId } from "src/utils/tenantHelper";
import {
  expoBoothLogoImageUrl,
  userBoothLayoutImageUrl,
} from "src/utils/urlHelper";

const UserBoothLayout_1 = ({ data }) => {
  const bannerCenter = data?.data?.boothImages?.boothLogo1;
  const bannerLeft = data?.data?.boothImages?.boothLogo2;
  const bannerRight = data?.data?.boothImages?.boothLogo2;
  const [boothLayout, setBoothLayout] = useState("");
  const routeParams = useParams();
  const tenant_id = getTenantId(routeParams) 

  useEffect(() => {
    getBoothLayout();
  }, [data?.booth]);

  const getBoothLayout = async () => {
    const _layout = await userBoothLayoutImageUrl(data?.booth, data?.layout);
    if (_layout !== null) {
      setBoothLayout(_layout);
    } else {
      // setBoothLayout(require('../../../../assets/ci/layouts/booths/L6B1.webp'));
    }
  };

  return (
    <div style={styles.root}>
      <svg width="100%" height="100%" viewBox="0 0 1366 768">
        <defs>
          <pattern
            id="bg"
            patternUnits="userSpaceOnUse"
            width="1366"
            height="768"
          >
            <image href={boothLayout} width="1366" height="768" />
          </pattern>
        </defs>
        <rect width="1366" height="768" fill="url(#bg)" />
        <defs>
          <clipPath id="centerBanner">
            <path
              d="M 562 30 C 562 28.8954 562.895 28 564 28 H 802 C 803.105 28 804 28.8954 804 30 V 164 C 804 165.105 803.105 166 802 166 H 564 C 562.895 166 562 165.105 562 164 V 30 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="leftBanner">
            <path
              d="M 219.599 678.052 L 89.5808 692.322 L 88.6447 284.805 L 217.29 301.974 L 219.599 678.052 Z"
              fill="white"
            />
          </clipPath>

          <clipPath id="rightBanner">
            <path
              d="M 843.69 678.052 L 973.708 692.322 L 974.645 284.805 L 845.999 301.974 L 843.69 678.052 Z"
              fill="white"
            />
          </clipPath>
        </defs>
        {bannerCenter && (
          <image
            href={`${expoBoothLogoImageUrl(bannerCenter, tenant_id)}`}
            x="297.5"
            y="117.5"
            width="388"
            height="137"
            preserveAspectRatio="xMidYMid slice"
          />
        )}
        {bannerLeft && (
          <image
            href={`${expoBoothLogoImageUrl(bannerLeft, tenant_id)}`}
            x="88.6447"
            y="284.805"
            width="130.9543"
            height="407.517"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#leftBanner)"
          />
        )}
        {bannerRight && (
          <image
            href={`${expoBoothLogoImageUrl(bannerRight, tenant_id)}`}
            x="843.69"
            y="284.805"
            width="130.955"
            height="407.517"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#rightBanner)"
          />
        )}
      </svg>
    </div>
  );
};

export default UserBoothLayout_1;

const styles = {
  root: {
    width: "100%",
    height: "100%",
    // backgroundColor: '#F2F2F2',
    // position: 'relative',
  },
};
