import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import { getModuleAccessRules } from "src/utils/aclLibrary";
import AttendeesTable from "./AttendeesTable";
import AttendeesSidebarContent from "./AttendeesSidebarContent";
import AttendeesHeader from "./AttendeesHeader";
import { useTranslation } from "react-i18next";
import { Button } from "@mui/material";
import LocalCache from "src/utils/localCache";
import { getAttendeeCountAPI } from "./apis/Get-AttendeeCount-Api";
import { seatLimit } from "src/utils/seatLimit";

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

function Attendees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("attendees");
  const [userRules, setUserRules] = useState({});
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [isSeatFull, setIsSeatFull] = useState<boolean | true>(false);
  useEffect(() => {
    const init = async () => {
      const userRules = await getModuleAccessRules("users");
      setUserRules(userRules.access);
      const isSeatsFull = await seatLimit(routeParams.id);
      setIsSeatFull(isSeatsFull);
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
    <>
      {isSeatFull && (
        <div className='unpublish'>
          <h5 className='mt-8 ms-16'>{t('attendeeCount_maxSeat_mismatch_alert')}</h5>
        </div>
      )}
      <Root
        header={
          <div className="p-[26px] pb-[15px]">
            <AttendeesHeader
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
            <AttendeesTable
              keyword={keyword}
              setKeyword={setKeyword}
              triggerDownload={triggerDownload}
              setTriggerDownload={setTriggerDownload}
              refresh={refresh}
            />
          </div>
        }
        rightSidebarContent={<AttendeesSidebarContent />}
        rightSidebarOpen={rightSidebarOpen}
        rightSidebarOnClose={() => {
          setRightSidebarOpen(false);
          navigate(-1);
        }}
        rightSidebarWidth={1536}
        rightSidebarVariant="persistent"
      />
    </>
  );
}

export default Attendees;