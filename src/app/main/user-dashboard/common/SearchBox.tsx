import FusePageSimple from "@fuse/core/FusePageSimple";
import { blue, green } from "@mui/material/colors";
import Input from "@mui/material/Input";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { IconButton, Pagination } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useLocation } from "react-router";
import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

function SearchBox({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation('');
  const [searchClear, setSearchSearchClear] = useState(false);

  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, 300),
    [onSearch, searchTerm]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    debouncedSearch('');
  };

  return (
    <>
      <div className="flex w-full flex-1 items-center min-w-[250px] sm:max-w-[50%]  md:max-w-[450px] me-0 p-2 boder-0 mt-0 ">
        <Paper
          className="flex h-44 w-full items-center rounded-20 px-16 shadow-[0_0px_6px_0px_rgba(0,0,0,0.20)]"
          sx={{
            backgroundColor: "background.paper",
          }}
        >
          <FuseSvgIcon color="action" className="me-8">
            heroicons-outline:search
          </FuseSvgIcon>
          <Input
            placeholder={`${t('search')}...`}
            disableUnderline
            fullWidth
            value={searchTerm}
            onChange={handleInputChange}
            inputProps={{
              "aria-label": "Search",
            }}
          />
          {searchTerm && (
            <IconButton
              onClick={handleClearSearch}
              aria-label="clear search"
              size="small"
            >
              <FuseSvgIcon color="action" size={20}>
                heroicons-outline:x
              </FuseSvgIcon>
            </IconButton>
          )}
        </Paper>
      </div>
    </>
  );
}

export default SearchBox;
