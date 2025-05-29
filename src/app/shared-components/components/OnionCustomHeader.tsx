import OnionSearch from "./OnionSearch";
import { Button, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import React from "react";

interface CustomButton {
  key: string;
  component: React.ReactNode;
}
type CustomHeaderType = {
  button?: boolean;
  search?: boolean;
  searchKeyword?: string;
  setSearchKeyword?: (data: string) => void;
  searchLabel?: string;
  buttonLabel?: string;
  label: string;
  buttonUrl?: string;
  buttonIcon?: string;
  enableButtonIcon?: boolean;
  heading?: string;
  target?: "" | "_blank";
  customButtons?: CustomButton[];
  isButtonDisabled?: boolean
};

function OnionCustomHeader({
  button = true,
  search = true,
  searchKeyword,
  setSearchKeyword,
  searchLabel,
  buttonLabel,
  label,
  buttonUrl,
  buttonIcon,
  enableButtonIcon = true,
  heading,
  target,
  customButtons = [],
  isButtonDisabled = false
}: CustomHeaderType) {
  const { t } = useTranslation();

  const openInNewTab = (url) => {
    window.open(url, "_blank").focus();
  };

  return (
    <div className="flex flex-col  w-full ">
      {heading && (
        <Typography
          component="p"
          color="text.disabled"
          variant="body2"
          className="font-medium mb-8"
        >
          {heading}
        </Typography>
      )}
      <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-start justify-between">
        <div className="flex items-center">
          <motion.span
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.2 } }}
          >
            <Typography
              color="text.primary"
              component="h2"
              className="text-3xl md:text-4xl font-[700] leading-[40px] md:leading-[60px]"
            >
              {label}
            </Typography>
          </motion.span>
        </div>
        <div className="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8">
          {search && (
            <OnionSearch
              searchLabel={searchLabel ? searchLabel : t("common_search")}
              keyword={searchKeyword}
              setKeyword={setSearchKeyword}
            />
          )}
          {customButtons.map((button) => (
            <div key={button.key}>{button.component}</div>
          ))}
          <div className="">
            <motion.span
              initial={{ y: -20 }}
              animate={{ y: 0, transition: { delay: 0.2 } }}
            >
              {button && (
                <Button
                  className="mx-4 rounded-[10px] font-medium uppercase"
                  variant="contained"
                  color="primary"
                  disabled={isButtonDisabled}
                  {...(target && target === "_blank"
                    ? {
                      onClick: () => openInNewTab(buttonUrl),
                    }
                    : {
                      component: NavLinkAdapter,
                      to: buttonUrl ? buttonUrl : "new",
                    })}
                >
                  {enableButtonIcon && (
                    <FuseSvgIcon size={20}>
                      {buttonIcon ? buttonIcon : "heroicons-outline:plus"}
                    </FuseSvgIcon>
                  )}
                  <span className="sm:flex mx-4 ">
                    {buttonLabel ? buttonLabel : t("common_add")}
                  </span>
                </Button>
              )}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnionCustomHeader;
