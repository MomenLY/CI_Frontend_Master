import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { getModuleAccessRules } from "src/utils/aclLibrary";
import ReportsTable from "./BoothReportTable";
import ReportsSidebarContent from "./BoothReportSidebarContent";
import ReportsHeader from "./BoothReportHeader";
import { useTranslation } from "react-i18next";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 0,
    // borderStyle: 'solid',
    // borderColor: theme.palette.divider
  },
  "& .FusePageSimple-content": {},
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function Booth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("attendees");
  const [userRules, setUserRules] = useState({});
  const [triggerDownload, setTriggerDownload] = useState(false);
  useEffect(() => {
    const init = async () => {
      const userRules = await getModuleAccessRules("users");
      setUserRules(userRules.access);
    };
    init();
  }, []);

  useEffect(() => {
    setRightSidebarOpen(
      location.pathname.includes("/edit") || location.pathname.includes("/new")
    );
  }, [routeParams]);

  const handleDownload = () => {
    setTriggerDownload(true);
  };

  const [refresh, toggleRefresh] = useState(false);
  const handleRefresh = () => {
    toggleRefresh(!refresh);
  }
  return (
    <Root
      header={
        <div className="p-[26px] pb-[15px]">
          <ReportsHeader
            keyword={keyword}
            setKeyword={setKeyword}
            rules={userRules}
            expoId={routeParams.id}
            onDownload={handleDownload}
            onRefresh={handleRefresh}
          />
        </div>
      }
      content={
        <div className="w-full h-full container flex flex-col pt-[10px] p-[26px]">
          <ReportsTable
            keyword={keyword}
            setKeyword={setKeyword}
            triggerDownload={triggerDownload}
            setTriggerDownload={setTriggerDownload}
            refresh={refresh}
          />
        </div>
      }
      rightSidebarContent={<ReportsSidebarContent />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigate(-1);
      }}
      rightSidebarWidth={1536}
      rightSidebarVariant="persistent"
    />
  );
}

export default Booth;