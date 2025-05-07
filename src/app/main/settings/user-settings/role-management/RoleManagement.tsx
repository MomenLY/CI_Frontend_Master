import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import RoleHeader from "./RoleHeader";
import RoleTable from "./RoleTable";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import RoleManagementSidebar from "./RoleManagementSiderbar";
import { GlobalStyles } from "@mui/material";
import { getModuleAccessRules } from "src/utils/aclLibrary";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function RoleManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [userRules, setUserRules] = useState({});

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  useEffect(() => {
    const init = async () => {
      const roleRules = await getModuleAccessRules('role');
      setUserRules(roleRules.access);
    }
    init();
  }, []);

  return (
    <Root
      header={<RoleHeader keyword={keyword} setKeyword={setKeyword} rules={userRules} />}
      content={
        <div className="w-full h-full container flex flex-col p-16 md:p-24">
          <RoleTable keyword={keyword} setKeyword={setKeyword} rules={userRules} />
        </div>
      }
      rightSidebarContent={<RoleManagementSidebar />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigate('/admin/settings/user-settings/role-management');
      }
      }
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default RoleManagement;
