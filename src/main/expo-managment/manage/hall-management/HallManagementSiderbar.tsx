import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import IconButton from "@mui/material/IconButton";
import { Outlet } from "react-router-dom";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

function HallManagementSidebar() {
  return (
    <div className="flex flex-col flex-auto">
      <Outlet />
    </div>
  );
}

export default HallManagementSidebar;
