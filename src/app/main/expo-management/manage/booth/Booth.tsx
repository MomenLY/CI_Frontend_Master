import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { styled } from "@mui/material/styles";
import FusePageSimple from "@fuse/core/FusePageSimple";
import BoothContent from "./BoothContent";
import { useTranslation } from "react-i18next";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 0,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
  },
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
}));

function Booth() {
  const { t } = useTranslation("booth");

  const routeParams = useParams();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setLeftSidebarOpen(!isMobile);
    setRightSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  return (
    <Root
      content={
        <div className="flex flex-col w-full align-middle">
          <div className="w-full h-[61px] bg-[#FB5050] mt-0 flex gap-0 pl-[26px] p-2.5 text-white font-medium items-center">
            <span className="py-auto" size="large">
              <FuseSvgIcon>material-outline:info</FuseSvgIcon>
            </span>
            <h5 className="m-0 ms-16 py-auto">
              {t("booth_auto_saving_warning_message")}
            </h5>
          </div>
          <div className="p-[26px] pb-[15px]">
            <OnionCustomHeader
              search={false}
              label={t("booth_listing_title")}
              button={false}
            />
          </div>

          <div className=" pb-[26px]">
            <BoothContent />
          </div>
        </div>
      }
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => setRightSidebarOpen(false)}
      rightSidebarWidth={500}
      rightSidebarVariant="temporary"
      scroll={isMobile ? "normal" : "content"}
    />
  );
}

export default Booth;
