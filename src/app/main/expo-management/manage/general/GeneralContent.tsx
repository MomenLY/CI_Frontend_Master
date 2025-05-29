import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
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


  return (
    <Root
      content={
        <div className="w-full h-full container flex flex-col">
         <General/>
        </div>
      }
      rightSidebarWidth={360}
      rightSidebarVariant="temporary"
    />
  );
}

export default GeneralContent;
