import React from "react";
import Layout_1 from "../layouts/Layout_1";
import Layout_2 from "../layouts/Layout_2";
import Layout_3 from "../layouts/Layout_3";
import Layout_4 from "../layouts/Layout_4";
import Layout_5 from "../layouts/Layout_5";
import Layout_6 from "../layouts/Layout_6";
import Layout_7 from "../layouts/Layout_7";
import Layout_8 from "../layouts/Layout_8";

const LayoutMapping = ({ expo, expoJson, showEachBooth, setShowEachBooth }) => {
  const layoutMap = {
    layout_1: Layout_1,
    layout_2: Layout_2,
    layout_3: Layout_3,
    layout_4: Layout_4,
    layout_5: Layout_5,
    layout_6: Layout_6,
    layout_7: Layout_7,
    layout_8: Layout_8,
  };

  // Usage in your JSX
  const LayoutComponent = layoutMap[expo?.expLayoutId];

  return (
    <>
      {LayoutComponent && (
        <LayoutComponent
          json={expoJson}
          expo={expo}
          showEachBooth={showEachBooth}
          setShowEachBooth={setShowEachBooth}
        />
      )}
    </>
  );
};

export default LayoutMapping;
