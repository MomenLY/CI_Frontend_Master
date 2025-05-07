import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { GlobalStyles } from "@mui/material";
import { getModuleAccessRules } from "src/utils/aclLibrary";
import General from "./General";


const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function GeneralContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams();
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);


  useEffect(() => {
    setRightSidebarOpen(Boolean(routeParams.id));
  }, [routeParams]);

  useEffect(() => {
    const init = async () => {
      const roleRules = await getModuleAccessRules('role');
    //   setUserRules(roleRules.access);
    }
    init();
  }, []);

  return (
    <Root
    //   header={<RegistationHeader />}
      content={
        <div className="w-full h-full container flex flex-col p-16 md:p-24">
         <General/>
        </div>
      }
    //   rightSidebarContent={<RegistrationSidebar />}
    //   rightSidebarOpen={rightSidebarOpen}
    //   rightSidebarOnClose={() => {
    //     setRightSidebarOpen(false);
    //     navigate('/expo-management/manage/hall');
    //   }
    //   }
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default GeneralContent;
