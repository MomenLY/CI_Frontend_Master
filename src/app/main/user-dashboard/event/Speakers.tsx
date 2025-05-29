import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import Testimonial from "../home/Testimonial";
import { defaultUserImageUrl, speakerImageUrl, userImageUrl } from "src/utils/urlHelper";
import { useTranslation } from "react-i18next";

type SpeakersType = {
  speakers?: any[];
  tenantName?: string;
}

function Speakers({ speakers, tenantName }: SpeakersType) {
  const { t } = useTranslation('user-dashboard');
  return (

    <>

      <Box component="div" sx={{ padding: { xs: "10px 0 ", md: "" } }}>
        <Typography
          color="text"
          className="font-bold text-[20px] block mb-28"
        >
          {t('uD_Speakers')}
        </Typography>

        <Grid container spacing={2}>
          {speakers.length > 0 && speakers.map((speaker, index) => (
            <Grid item xs={6} sm={3} md={3} key={"speaker_" + index} >
              <Testimonial
                key={index}
                image={speaker.userImage ? speakerImageUrl(speaker.userImage, tenantName) : defaultUserImageUrl('default.webp')}
                quote={speaker.organisation}
                name={speaker.firstName + " " + speaker.lastName}
                title={speaker.designation}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}

export default Speakers;
