import React, { useState, useRef } from "react";
// import './ImageUpload.css';
import { Box } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Typography from "@mui/material/Typography";

const ImageUpload = () => {
  const [image, setImage] = useState(
    "https://static.dezeen.com/uploads/2021/10/grimshaw-sustainability-pavilion-dubai-expo_dezeen_2364_col_5-852x501.jpg"
  );
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Box className="text-center m-auto">
        <Box className="avatar-upload m-auto mb-20" >
          <div className="avatar-edit">
            <input
              type="file"
              id="imageUpload"
              accept=".png, .jpg, .jpeg"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <label
              htmlFor="imageUpload"
              onClick={() => fileInputRef.current.click()}
            >
              <FuseSvgIcon className="text-48" size={20} color="paper">
                heroicons-outline:camera
              </FuseSvgIcon>
            </label>
          </div>
          <div className="avatar-preview">
            <div
              id="imagePreview"
              style={{ backgroundImage: `url(${image})` }}
            ></div>
          </div>
        </Box>

        <Typography
          color="text.primary"
          variant=""
          className="font-medium text-[12px] block mb-8 opacity-50"
        >
          Supported Files- JPG, JPEG, PNG
        </Typography>
        <Typography
          color="text.primary"
          variant=""
          className="font-regular text-[11px] block mb-0 opacity-50"
        >
          (File size min 300X300)
        </Typography>
      </Box>
    </>
  );
};

export default ImageUpload;
