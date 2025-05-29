import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Divider, IconButton, ListItemIcon, Typography } from "@mui/material";
import React from "react";
import Box from "@mui/material/Box";
import { expoBoothResourcesUrl } from "src/utils/urlHelper";
import { use } from "i18next";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";

function BoothListTable({data, handleDelete, tenantId}) {
  const {t} = useTranslation('booth')
  const dispatch = useAppDispatch();


  const downloadBoothResources = async (url_partial) => {
    const url = expoBoothResourcesUrl(url_partial, tenantId);

    // Fetch the file as a Blob
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {}
      });
      const blob = await response.blob();

      // Create a temporary link element
      const link = document.createElement("a");
      const blobUrl = window.URL.createObjectURL(blob);

      link.href = blobUrl;
      link.setAttribute("download", url_partial); // Specify the file name

      // Append link to the body (not visible) and trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Release the object URL

      dispatch(showMessage({ message: t("booth_resources_download_shortly_message"), variant: "success" }));
    } catch (error) {
      dispatch(showMessage({ message: t("booth_resources_download_error_message"), variant: "error" }));
    }
  }

  return (
    <>
      {
        data.length > 0 && (<>
        <Box
        sx={{
          border: "none",
          margin: 0,
          boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
          padding: 0,
          borderRadius: "12px",
          width: { xs: "calc(100vw - 60px)", md: "470px" },
          maxWidth: "470px",
          overflow: "auto",
        }}
      >
        <div className="min-w-[450px]"> {/* Ensure table doesn't break when content grows */}
          <div className="flex p-[30px] !pb-[6px] ps-[55px]">
            <div className="flex-1 py-2 px-4 text-[12px] font-semibold min-w-[200px]">
              {t("name")}
            </div>
            <div className="w-[60px] flex items-center justify-center"></div>
            <div className="w-[60px] flex items-center justify-center"></div>
          </div>

          {data?.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex ps-[14px] pe-20 py-[20px]">
                <div className="flex flex-1 items-center py-2 px-4">
                  <ListItemIcon className="min-w-40 -ml-2 mr-2">
                    <IconButton>
                      <FuseSvgIcon size={20} color="primary">
                        feather:file
                      </FuseSvgIcon>
                    </IconButton>
                  </ListItemIcon>

                  <Typography
                    color="text.disabled"
                    variant="caption"
                    className="font-normal text-[14px] block break-all"
                  >
                    {item?.name}
                  </Typography>
                </div>
                <div onClick={() => downloadBoothResources(item?.link)} className="w-[60px] flex items-center justify-center cursor-pointer">
                  <FuseSvgIcon size={20} color="primary">
                    feather:download
                  </FuseSvgIcon>
                </div>
                <div onClick={() => handleDelete(index, item?.name)} className="w-[60px] flex items-center justify-center cursor-pointer">
                  <FuseSvgIcon size={20} color="error">
                    feather:trash
                  </FuseSvgIcon>
                </div>
              </div>
              <Divider />
            </React.Fragment>
          ))}
        </div>
      </Box></>)
      }
    </>
  );
}

export default BoothListTable;
