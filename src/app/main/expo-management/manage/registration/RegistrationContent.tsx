import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import Registration from "./Registration";
import RegistrationSidebar from "./RegistrationSidebar";


const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {},
  "& .FusePageSimple-content": {
    backgroundColor: theme.palette.background.paper,
  },
  "& .FusePageSimple-sidebarHeader": {},
  "& .FusePageSimple-sidebarContent": {},
}));

function RegistrationContent() {

  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const routeParams = useParams();

  useEffect(() => {
    setRightSidebarOpen(location.pathname.includes('/edit') ||location.pathname.includes('/new'));
  }, [routeParams]);



  return (
    <Root
    //   header={<RegistationHeader />}
      content={
        <div className="w-full h-full container flex flex-col ">
         <Registration/>
        </div>
      }
      rightSidebarContent={<RegistrationSidebar />}
      rightSidebarOpen={rightSidebarOpen}
      rightSidebarOnClose={() => {
        setRightSidebarOpen(false);
        navigate(-1);
      }
      }
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default RegistrationContent;
