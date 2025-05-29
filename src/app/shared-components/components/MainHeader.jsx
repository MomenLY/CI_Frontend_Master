import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link } from "react-router-dom";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ClassicSearchPage from "app/theme-layouts/shared-components/ClassicSearchPage";
// import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
// import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

/**
 * The DemoHeader component.
 */
function MainHeader(props) {

  const {
    rightSidebarToggle,
    heading,
    searchBar,
    sortIcon,
    addBtn,
    navLink,
    buttonclick,
  } = props;

  function handleClick() {}

  return (
    <div className="flex flex-col  w-full ">
      <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between">
        <div className="flex items-center">
          <Typography
          color="text.primary"
            component="h2"
            className="text-3xl md:text-4xl font-[700] leading-[40px] md:leading-[60px]"
          >
            {heading}
          </Typography>
          {rightSidebarToggle && (
            <div className="flex shrink-0 items-center">
              <IconButton
                onClick={rightSidebarToggle}
                aria-label="toggle sidebar"
              >
                <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
              </IconButton>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8">
          {searchBar !== false && <ClassicSearchPage />}
          <div className="">
            {sortIcon !== false && (
              <Button
                className="whitespace-nowrap p-0 min-w-40 max-w-40 me-6"
                sx={{
                  backgroundColor: "background.default",
                }}
                variant="contained"
              >
                <FuseSvgIcon size={20}>
                  material-twotone:filter_list
                </FuseSvgIcon>
              </Button>
            )}

            {addBtn !== false && (
              <Button
                className="mx-4 rounded-[10px] font-medium uppercase "
                variant="contained"
                color="primary"
                to="add"
                onClick={buttonclick}
                component={navLink}
              >
                <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
                <span className="sm:flex mx-4 ">Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainHeader;
