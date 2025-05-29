import React, { useState, useEffect } from "react";
import { boothLayoutHelper2, expoBoothLogoImageUrl } from "src/utils/urlHelper";

const BoothLayout_8 = ({ data }) => {
  const bannerCenter = data?.data?.boothImages?.boothLogo1;
  const bannerLeft = data?.data?.boothImages?.boothLogo2;
  const bannerRight = data?.data?.boothImages?.boothLogo2;
  const [boothLayout, setBoothLayout] = useState("");

  useEffect(() => {
    getBoothLayout();
  }, [data?.booth]);

  const getBoothLayout = async () => {
    const _layout = await boothLayoutHelper2(data?.booth, data?.layout);
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
              d="M 370.599 677.052 L 240.581 691.322 L 239.645 284.805 L 368.29 301.974 L 370.599 677.052 Z"
              fill="white"
            />
          </clipPath>
          <clipPath id="rightBanner">
            <path
              d="M 994.69 677.052 L 1124.71 691.322 L 1125.64 284.805 L 996.999 301.974 L 994.69 677.052 Z"
              fill="white"
            />
          </clipPath>
        </defs>
        {bannerCenter && (
          <image
            href={`${expoBoothLogoImageUrl(bannerCenter, data?.tenantId)}`}
            x="448.5"
            y="117.5"
            width="388"
            height="137"
            preserveAspectRatio="xMidYMid slice"
          />
        )}
        {bannerLeft && (
          <image
            href={`${expoBoothLogoImageUrl(bannerLeft, data?.tenantId)}`}
            x="239.645"
            y="284.805"
            width="130.954"
            height="406.517"
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#leftBanner)"
          />
        )}
        {bannerRight && (
          <image
            href={`${expoBoothLogoImageUrl(bannerRight, data?.tenantId)}`}
            x="994.69"
            y="284.805"
            width="130.95"
            height="406.517"
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#rightBanner)"
          />
        )}
      </svg>
    </div>
  );
};

export default BoothLayout_8;

const styles = {
  root: {
    width: "100%",
    height: "100%",
    // backgroundColor: '#F2F2F2',
    // position: 'relative',
  },
};
