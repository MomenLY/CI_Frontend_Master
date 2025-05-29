import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useTranslation } from "react-i18next";

type AddressType = {
  venue?: string;
  address?: string;
}

function Address({venue, address}: AddressType) {
  const {t} = useTranslation('user-dashboard')
    
  return (

    <>
    <Box component="div" sx={{ padding: { xs: "10px 0 ", md: "20px 0" } }}>
            <Typography
              color="text.primary"
              className="font-semibold text-[18px] lg:text-[20px] block mb-28 line-clamp-1"
            >
             {t("uD_Venue_text")}
            </Typography>

            <div className="pb-10 flex ">
              <FuseSvgIcon className="text-48 me-16" size={20} color="text.primary">
                feather:map-pin
              </FuseSvgIcon>
              <div>
                <Typography
                  color="text.primary"
                  className="font-semibold text-[16px] lg:text-[18px] block mb-8"
                >
                  {venue}
                </Typography>
                <Typography
                  color="text.primary"
                  className="font-medium text-[16px] lg:text-[18px] block"
                >
                  {address}
                </Typography>
              </div>
            </div>
          </Box>
    </>
  );

}

export default Address;
