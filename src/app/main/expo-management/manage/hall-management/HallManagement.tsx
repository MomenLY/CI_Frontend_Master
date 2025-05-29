import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { GlobalStyles } from "@mui/material";
import { getModuleAccessRules } from "src/utils/aclLibrary";
import HallTable from "./HallTable";
import HallHeader from "./HallHeader";
import HallManagementSidebar from "./HallManagementSiderbar";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function HallManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [userRules, setUserRules] = useState({});

  useEffect(() => {
    setRightSidebarOpen(location.pathname.includes('/edit-hall') ||location.pathname.includes('/new'));
  }, [routeParams]);


  // useEffect(() => {
  //   const init = async () => {
  //     const roleRules = await getModuleAccessRules("role");
  //     setUserRules(roleRules.access);
  //   };
  //   init();
  // }, []);

  return (
    <Root
      header={
      <div className="p-[26px] pb-[15px]">
      <HallHeader keyword={keyword} setKeyword={setKeyword}  />
      </div>
      }
      content={
        <div className="w-full h-full container flex flex-col pt-[10px] p-[26px]">
          <HallTable
            keyword={keyword}
            setKeyword={setKeyword}
            rules={userRules}
          />
        </div>
      }
      rightSidebarContent={<HallManagementSidebar />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigate(-1);
      }}
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default HallManagement;
