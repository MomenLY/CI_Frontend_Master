import { Box, Container, Grid, Typography, Link } from "@mui/material";
import FooterImg1 from "/assets/images/footer-img-1.png";
import FooterImg2 from "/assets/images/footer-img-2.png";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useTranslation } from "react-i18next";

const listItem1 = ["Milan", "Bologna", "Florence", "Rome", "Turin"];
const listItem2 = ["Genoa", "Cagliari", "Palermo", "Venice"];

type FooterType = {
  linkedinLink?: string;
  facebookLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  cities?: boolean;
  logo?: string;
}

function Footer({
  linkedinLink,
  facebookLink,
  instagramLink,
  youtubeLink,
  cities = true,
  logo
}: FooterType) {
  const { t } = useTranslation("user-dashboard");
  return (
    <>
      <Box component="footer" className="mt-20">
        {/* <Box
          sx={{
            padding: { xs: "40px 0 20px 0", lg: "60px 0 40px 0" },
            mt: "auto",
            backgroundColor: "#000",
          }}
        >
          <Container className="max-w-[1160px] w-full px-20 lg:px-0 m-auto ">
            <Grid container spacing={2} className="flex items-center">
              <Grid item xs={12} md={6} textAlign="left" className="!pt-0">
          

                {cities && <Box className="pt-[20px] md:pt-[20px] pb-[24px]">
                  <ul className="flex flex-wrap items-center gap-[3px] p-0 mx-0 mt-0 mb-10 list-none">
                    {listItem1.map((item, index) => (
                      <li key={index}>
                        <Link
                          // href="#"
                          variant="body2"
                          className={`!no-underline text-[14px] md:text-[16px] ps-16  relative before:content-['•'] before:leading-[5px] before:text-[#808080] before:text-[12px] before:pr-2 before:absolute before:left-[4px] before:top-1/2 before:transform before:-translate-y-1/2 ${index === 0 ? "before:content-none !ps-0" : ""
                            }`}
                          sx={{ color: "#808080 !important" }}
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <ul className="flex flex-wrap items-center gap-[3px] p-0 mx-0 mt-0 mb-10 list-none">
                    {listItem2.map((item, index) => (
                      <li key={index}>
                        <Link
                          // href="#"
                          variant="body2"
                          className={`!no-underline text-[14px] md:text-[16px] ps-16  relative before:content-['•'] before:leading-[5px] before:text-[#808080] before:text-[12px] before:pr-2 before:absolute before:left-[4px] before:top-1/2 before:transform before:-translate-y-1/2 ${index === 0 ? "before:content-none !ps-0" : ""
                            }`}
                          sx={{ color: "#808080 !important" }}
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Box>}

                <ul className="p-0 flex gap-[16px] m-0 list-none">
                  {linkedinLink &&
                    <li>
                      <Link
                        variant="body2"
                        sx={{
                          border: "1px solid #333333",
                          backgroundColor: "transparent",
                          padding: "8px",
                          borderRadius: "50px",
                          width: "36px",
                          height: "36px",
                          lineHeight: "0 !important",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer"
                        }}
                        onClick={() => { window.open(linkedinLink, '_blank', 'noopener,noreferrer') }}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 19 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.2998 5.70312C14.8111 5.70312 16.2604 6.30347 17.3291 7.3721C18.3977 8.44073 18.998 9.8901 18.998 11.4014V18.0493H15.1992V11.4014C15.1992 10.8976 14.9991 10.4145 14.6429 10.0583C14.2867 9.70207 13.8036 9.50195 13.2998 9.50195C12.796 9.50195 12.3129 9.70207 11.9567 10.0583C11.6005 10.4145 11.4004 10.8976 11.4004 11.4014V18.0493H7.60156V11.4014C7.60156 9.8901 8.20191 8.44073 9.27054 7.3721C10.3392 6.30347 11.7885 5.70313 13.2998 5.70312Z"
                            fill="white"
                          />
                          <path
                            d="M3.79883 6.64844H0V18.0449H3.79883V6.64844Z"
                            fill="white"
                          />
                          <path
                            d="M1.89941 3.79883C2.94843 3.79883 3.79883 2.94843 3.79883 1.89941C3.79883 0.850397 2.94843 0 1.89941 0C0.850396 0 0 0.850397 0 1.89941C0 2.94843 0.850396 3.79883 1.89941 3.79883Z"
                            fill="white"
                          />
                        </svg>
                      </Link>
                    </li>}
                  {facebookLink && <li>
                    <Link
                      variant="body2"
                      sx={{
                        border: "1px solid #333333",
                        backgroundColor: "transparent",
                        padding: "10px",
                        borderRadius: "50px",
                        width: "36px",
                        height: "36px",
                        lineHeight: "0 !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                      onClick={() => { window.open(facebookLink, '_blank', 'noopener,noreferrer') }}
                    >
                      <svg
                        width="12"
                        height="20"
                        viewBox="0 0 10 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.9 0H7.2C6.00653 0 4.86193 0.474106 4.01802 1.31802C3.17411 2.16193 2.7 3.30653 2.7 4.5V7.2H0V10.8H2.7V18H6.3V10.8H9L9.9 7.2H6.3V4.5C6.3 4.2613 6.39482 4.03239 6.5636 3.8636C6.73239 3.69482 6.96131 3.6 7.2 3.6H9.9V0Z"
                          fill="white"
                        />
                      </svg>
                    </Link>
                  </li>}
                  {instagramLink && <li>
                    <Link
                      variant="body2"
                      sx={{
                        border: "1px solid #333333",
                        backgroundColor: "transparent",
                        padding: "8px",
                        borderRadius: "50px",
                        width: "36px",
                        height: "36px",
                        lineHeight: "0 !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                      onClick={() => { window.open(instagramLink, '_blank', 'noopener,noreferrer') }}
                    >
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5 1H5.5C3.01472 1 1 3.01472 1 5.5V14.5C1 16.9853 3.01472 19 5.5 19H14.5C16.9853 19 19 16.9853 19 14.5V5.5C19 3.01472 16.9853 1 14.5 1Z"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.5986 9.43132C13.7096 10.1803 13.5817 10.9453 13.2329 11.6174C12.8842 12.2896 12.3324 12.8346 11.656 13.175C10.9797 13.5155 10.2132 13.634 9.46557 13.5137C8.71798 13.3934 8.02735 13.0404 7.49192 12.505C6.95649 11.9695 6.60352 11.2789 6.48323 10.5313C6.36293 9.78372 6.48142 9.01722 6.82186 8.34085C7.16229 7.66449 7.70733 7.11268 8.37945 6.76394C9.05157 6.41519 9.81654 6.28725 10.5656 6.39832C11.3296 6.51161 12.0369 6.86764 12.5831 7.41379C13.1292 7.95995 13.4853 8.66729 13.5986 9.43132Z"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.9531 5.04688H14.9631"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </li>}
                  {youtubeLink && <li>
                    <Link
                      variant="body2"
                      sx={{
                        border: "1px solid #333333",
                        backgroundColor: "transparent",
                        padding: "6px",
                        borderRadius: "50px",
                        width: "36px",
                        height: "36px",
                        lineHeight: "0 !important",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      }}
                      onClick={() => { window.open(youtubeLink, '_blank', 'noopener,noreferrer') }}
                    >
                      <svg
                        width="25"
                        height="19"
                        viewBox="0 0 22 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.5813 3.19989C20.4733 2.76846 20.2534 2.37318 19.9438 2.05395C19.6341 1.73473 19.2457 1.50287 18.8178 1.3818C17.2542 1 11 1 11 1C11 1 4.74578 1 3.18222 1.41816C2.75429 1.53923 2.36588 1.77109 2.05623 2.09031C1.74659 2.40954 1.52666 2.80482 1.41868 3.23625C1.13253 4.82303 0.992553 6.43273 1.00052 8.04509C0.99032 9.66959 1.1303 11.2916 1.41868 12.8903C1.53773 13.3083 1.76258 13.6886 2.0715 13.9943C2.38043 14.3 2.76299 14.5209 3.18222 14.6357C4.74578 15.0538 11 15.0538 11 15.0538C11 15.0538 17.2542 15.0538 18.8178 14.6357C19.2457 14.5146 19.6341 14.2827 19.9438 13.9635C20.2534 13.6443 20.4733 13.249 20.5813 12.8176C20.8653 11.2427 21.0052 9.64531 20.9995 8.04509C21.0097 6.42059 20.8697 4.79862 20.5813 3.19989Z"
                          fill="white"
                          stroke="white"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.95312 11.0155L14.1801 8.04289L8.95312 5.07031V11.0155Z"
                          fill="black"
                          stroke="black"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </li>}
                </ul>
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                textAlign="right"
                className="flex items-center md:justify-end !pt-0"
              >
                <img
                  className="me-20 max-h-[70px] md:max-h-[100px]"
                  src={FooterImg1}
                  alt=""
                />
                <img
                  className="max-h-[70px] md:max-h-[100px]"
                  src={FooterImg2}
                  alt=""
                />
              </Grid>
            </Grid>
          </Container>
        </Box> */}

        <Box
          sx={{
            padding: { xs: "15px 0", md: "24px 0" },
            mt: "0",
            backgroundColor: "#171717",
          }}
        >
          <Container className="max-w-[1160px] w-full px-20 lg:px-0 m-auto ">
            <Grid
              container
            >
              <Grid
                item
                xs={12}
                md={6}
                className="!p-0 text-center md:text-left"
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#818181 !important" }}
                >
                  {new Date().getFullYear()} © {t("uD_clientName_text")}
                </Typography>
              </Grid>
              {/* <Grid item xs={12} md={6} className="!p-0">
                <ul className="flex items-center justify-center md:justify-end gap-5 m-0 list-none">
                  <li>
                    <Link
                      className="hover:cursor-pointer"
                      variant="body2"
                      sx={{ color: "#818181 !important" }}
                      onClick={() => { window.open('https://congressiinternazionali.it/termini-e-condizioni/', '_blank', 'noopener,noreferrer') }}
                    >
                      {t("uD_termAndConditions")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="hover:cursor-pointer"
                      variant="body2"
                      sx={{ color: "#818181 !important " }}
                      onClick={() => { window.open('https://congressiinternazionali.it/en/privacy-policy/', '_blank', 'noopener,noreferrer') }}
                    >
                      {t("uD_privacyAndPolices")}
                    </Link>
                  </li>
                </ul>
              </Grid> */}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default Footer;