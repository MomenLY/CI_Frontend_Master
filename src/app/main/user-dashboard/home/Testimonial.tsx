// src/components/Testimonial.js
import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { defaultUserImageUrl } from "src/utils/urlHelper";

const Testimonial = ({ image, quote, name, title }) => {
  const [imgSrc, setImgSrc] = useState(image);

  return (
    <Card
      className="bg-inherit border-none !shadow-transparent"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "auto",
        boxShadow: "none",
      }}
    >
      <CardMedia
        component="img"
        sx={{ width: 120, height: 120, borderRadius: "50%", margin: 0  }}
        alt={name}
        image={imgSrc}
        onError={() => setImgSrc(defaultUserImageUrl('default.webp'))}
      />
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <CardContent className="text-center pt-10  py-0 px-0">
          <Typography variant="subtitle1" component="div" className="font-semibold mb-10">
            {name}
          </Typography>
          <Typography variant="12px" color="text.secondary" className="mb-4 block">
            {title}
          </Typography>
          <Typography variant="12px" component="p" gutterBottom>
            {quote}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
};

export default Testimonial;
