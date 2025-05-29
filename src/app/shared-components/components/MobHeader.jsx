// import Breadcrumbs from "@mui/material/Breadcrumbs";
// import { Link } from "react-router-dom";
// import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import ClassicSearchPage from "app/theme-layouts/shared-components/ClassicSearchPage";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

// import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

/**
 * The DemoHeader component.
 */
function MobHeader(props) {
  const {
    leftSidebarToggle,
    // rightSidebarToggle,
    // heading,
    // searchBar,
    // sortIcon,
    // addBtn,
    // navLink,
  } = props;

  function handleClick() {}

  return (
    <div className="flex flex-col  w-full ">
      <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-start">
        <div className="flex items-start">
          <div className="md:hidden">
            {leftSidebarToggle && (
              <div className="flex shrink-0 items-center">
                <IconButton
                  onClick={leftSidebarToggle}
                  aria-label="toggle sidebar"
                >
                  <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
                </IconButton>
              </div>
            )}
          </div>

          {/* {rightSidebarToggle && (
            <div className="flex shrink-0 items-center">
              <IconButton
                onClick={rightSidebarToggle}
                aria-label="toggle sidebar"
              >
                <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
              </IconButton>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default MobHeader;
