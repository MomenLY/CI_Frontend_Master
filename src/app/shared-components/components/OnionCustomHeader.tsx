import OnionSearch from "./OnionSearch";
import { Button, Typography } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";

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
}: CustomHeaderType) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col  w-full ">
        <div className='flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between'>
            <div className="flex items-center">
                <motion.span
                    initial={{ x: -20 }}
                    animate={{ x: 0, transition: { delay: 0.2 } }}
                >
                    <Typography
                        component="h2"
                        className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[40px] md:leading-[60px]"
                    >{label}</Typography>
                </motion.span>
            </div>
            <div className='flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8'>
                {search && <OnionSearch searchLabel={searchLabel ? searchLabel : t('search')} keyword={searchKeyword} setKeyword={setSearchKeyword} />}
                <div className=''>
                    <motion.span
                        initial={{ y: -20 }}
                        animate={{ y: 0, transition: { delay: 0.2 } }}
                    >
                        {button && <Button
                            className="mx-4 rounded-[10px] font-medium uppercase"
                            variant="contained"
                            color="secondary"
                            component={NavLinkAdapter}
                            to={buttonUrl ? buttonUrl : "new"}
                        >
                            {enableButtonIcon && <FuseSvgIcon size={20}>{buttonIcon ? buttonIcon : 'heroicons-outline:plus'}</FuseSvgIcon>}
                            <span className="sm:flex mx-4 ">{buttonLabel ? buttonLabel : t('Add')}</span>
                        </Button>}
                    </motion.span>
                </div>
            </div>
        </div>
    </div>
    // ------------------------------
    // <div className="flex flex-col  w-full ">
    //   <div className="flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between">
    //     <div className="flex items-center">
    //       <Typography
    //         component="h2"
    //         className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[40px] md:leading-[60px]"
    //       >
    //         {heading}
    //       </Typography>
    //       {rightSidebarToggle && (
    //         <div className="flex shrink-0 items-center">
    //           <IconButton
    //             onClick={rightSidebarToggle}
    //             aria-label="toggle sidebar"
    //           >
    //             <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
    //           </IconButton>
    //         </div>
    //       )}
    //     </div>
    //     <div className="flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8">
    //       {searchBar !== false && <ClassicSearchPage />}
    //       <div className="">
    //         {sortIcon !== false && (
    //           <Button
    //             className="whitespace-nowrap p-0 min-w-40 max-w-40 me-6"
    //             sx={{
    //               backgroundColor: "background.default",
    //             }}
    //             variant="contained"
    //           >
    //             <FuseSvgIcon size={20}>
    //               material-twotone:filter_list
    //             </FuseSvgIcon>
    //           </Button>
    //         )}

    //         {addBtn !== false && (
    //           <Button
    //             className="mx-4 rounded-[10px] font-medium uppercase "
    //             variant="contained"
    //             color="primary"
    //             to="add"
    //             component={navLink}
    //           >
    //             <FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
    //             <span className="sm:flex mx-4 ">Add</span>
    //           </Button>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

export default OnionCustomHeader;
