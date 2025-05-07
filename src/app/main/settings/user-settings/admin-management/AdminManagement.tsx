import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminManagementSidebar from "./AdminManagementSidebar";
import UserCard from "./UserCard";
import { motion } from "framer-motion";
import { getAdmins } from "./api/Get-All-Admins";
import { debounce } from "lodash";
import { BulkDeleteUserAPI } from "src/app/main/users/apis/Delete-User-Api";
import AdminManagementContent from "./AdminManagementContent";

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function AdminManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const _keyword = searchParams?.get("keyword");
  const [keyword, setKeyword] = useState(_keyword || "");
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);


  return (
    <Root
      header={<AdminHeader keyword={keyword} setKeyword={setKeyword} />}
      content={<AdminManagementContent keyword={keyword} />}
      rightSidebarContent={<AdminManagementSidebar />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigate("/admin/settings/user-settings/admin-management");
      }}
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default AdminManagement;
