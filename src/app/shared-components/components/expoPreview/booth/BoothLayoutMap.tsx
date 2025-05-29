import React from "react";
import BoothLayout_1 from "./boothLayoutAdminSide/BoothLayout_1";
import BoothLayout_2 from "./boothLayoutAdminSide/BoothLayout_2";
import BoothLayout_3 from "./boothLayoutAdminSide/BoothLayout_3";
import BoothLayout_4 from "./boothLayoutAdminSide/BoothLayout_4";
import BoothLayout_5 from "./boothLayoutAdminSide/BoothLayout_5";
import BoothLayout_6 from "./boothLayoutAdminSide/BoothLayout_6";
import BoothLayout_7 from "./boothLayoutAdminSide/BoothLayout_7";
import BoothLayout_8 from "./boothLayoutAdminSide/BoothLayout_8";
import UserBoothLayout_1 from './boothLayoutUserSide/BoothLayout_user_1';
import UserBoothLayout_2 from "./boothLayoutUserSide/BoothLayout_user_2";
import UserBoothLayout_3 from "./boothLayoutUserSide/BoothLayout_user_3";
import UserBoothLayout_4 from "./boothLayoutUserSide/BoothLayout_user_4";
import UserBoothLayout_5 from "./boothLayoutUserSide/BoothLayout_user_5";
import UserBoothLayout_6 from "./boothLayoutUserSide/BoothLayout_user_6";
import UserBoothLayout_7 from "./boothLayoutUserSide/BoothLayout_user_7";
import UserBoothLayout_8 from "./boothLayoutUserSide/BoothLayout_user_8";
import { useParams } from "react-router";

type LayoutMap = {
  [key: string]: React.FC<{ data: any }>;
};

const layoutMap: LayoutMap = {
  layout_1: UserBoothLayout_1,
  layout_2: BoothLayout_2,
  layout_3: UserBoothLayout_3,
  layout_4: BoothLayout_4,
  layout_5: BoothLayout_5,
  layout_6: BoothLayout_6,
  layout_7: BoothLayout_7,
  layout_8: BoothLayout_8,
};

const BoothLayoutManager = ({ data }) => {
  const {tenant_id} = useParams()
  const layoutMap: LayoutMap = {
    layout_1: tenant_id ? UserBoothLayout_1 : BoothLayout_1,
    layout_2: tenant_id ? UserBoothLayout_2 : BoothLayout_2,
    layout_3: tenant_id ? UserBoothLayout_3 : BoothLayout_3,
    layout_4: tenant_id ? UserBoothLayout_4 : BoothLayout_4,
    layout_5: tenant_id ? UserBoothLayout_5 : BoothLayout_5,
    layout_6: tenant_id ? UserBoothLayout_6 : BoothLayout_6,
    layout_7: tenant_id ? UserBoothLayout_7 : BoothLayout_7,
    layout_8: tenant_id ? UserBoothLayout_8 : BoothLayout_8,
  };
  const LayoutComponent = layoutMap[data?.layout] || null;

  // BoothLayouts component that renders the correct layout component with data prop
  const BoothLayouts = () =>
    LayoutComponent ? <LayoutComponent data={data} /> : null;

  return <BoothLayouts />;
};

export default BoothLayoutManager;
