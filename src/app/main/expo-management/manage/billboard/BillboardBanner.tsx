import React, { useState } from "react";
import Box from "@mui/material/Box";
import { defaultLayoutImageUrl, expoBillboardLayoutImageUrl } from "src/utils/urlHelper";

function BillboardBanner(expoDetails) {
  let layoutImagePath = defaultLayoutImageUrl("billboard-banner-300.jpg", "1") + " 300w,";
  layoutImagePath += " " + defaultLayoutImageUrl("billboard-banner-768.jpg", "1") + " 768w,";
  layoutImagePath += " " + defaultLayoutImageUrl("billboard-banner-1200.jpg", "1") + " 1200w";
  return (
    <div className="relative">
      <Box
        className="flex flex-col relative"
      >

        {/* <img
          srcSet={layoutImagePath}
          sizes="(max-width: 600px) 300px, (max-width: 1200px) 768px, 1200px"
          alt="Billboard Banner"
          className="w-full h-auto"
        /> */}
        <img
          srcSet={`${expoBillboardLayoutImageUrl(expoDetails?.expoDetails?.expLayoutId, `${expoDetails?.expoDetails?.expLayoutId}.webp`)}`}
          sizes="(max-width: 600px) 300px, (max-width: 1200px) 768px, 1200px"
					alt="Booth Banner"
					className="w-full h-auto rounded"
				
        />

      </Box>
    </div>
  );
}

export default BillboardBanner;
