import FusePageSimple from "@fuse/core/FusePageSimple";
import { blue, green } from "@mui/material/colors";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Pagination } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import exampleSearchResponse from './exampleSearchResponse';

/**
 * The classic search page.
 */
function ClassicSearchPage() {
  const [data, setData] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      // setData(exampleSearchResponse);
    }, 100);
  }, []);
  const container = {
    show: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <>
      <div className="flex w-full max-w-md flex-1 items-center  sm:max-w-256 me-6 p-2 boder-0">
        <Paper className="flex h-44 w-full items-center rounded-16 px-16 shadow">
          <Input
            placeholder="Search..."
            disableUnderline
            fullWidth
            inputProps={{
              "aria-label": "Search",
            }}
          />
          <FuseSvgIcon color="action">heroicons-outline:search</FuseSvgIcon>
        </Paper>
      </div>
    </>
  );
}

export default ClassicSearchPage;
