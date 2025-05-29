import { DialogContent, Box, Typography } from "@mui/material";
import Plyr from "plyr-react";
import { useState, useEffect } from "react";

const VideoPopup = ({ schedule }) => {
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [provider, setProvider] = useState(null);

  const determineProvider = (link) => {
    if (link.includes("youtube.com") || link.includes("youtube")) {
      return "youtube";
    } else if (link.includes("vimeo.com") || link.includes("vimeo")) {
      return "vimeo";
    } else {
      return null;
    }
  };

  useEffect(() => {
    if (schedule?.schStreamingLink) {
      const provider = determineProvider(schedule.schStreamingLink);
      if (provider) {
        setIsValidUrl(true);
        setProvider(provider);
      } else {
        setIsValidUrl(false);
        setProvider(null);
      }
    } else {
      setIsValidUrl(false);
      setProvider(null);
    }
  }, [schedule?.schStreamingLink]);

  return (
    <>
      <DialogContent
        sx={{
          padding: { xs: "0 !important", sm: "20px 15px !important" },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            boxShadow: "0px 1px 10px 0px",
            borderRadius: "12px",
            overflow: "hidden",
            width: "100%",
            minHeight: "240px",
            aspectRatio: "16/9",
            background: "#000",
            display: !(isValidUrl && provider) ? "flex" : undefined,
            justifyContent: !(isValidUrl && provider) ? "center" : undefined,
            alignItems: !(isValidUrl && provider) ? "center" : undefined,
          }}
        >
          {isValidUrl && provider ? (
            <Plyr
              source={{
                type: "video",
                sources: [
                  {
                    src: schedule?.schStreamingLink,
                    provider,
                  },
                ],
              }}
              options={{
                controls: [
                  "play-large",
                  "play",
                  "progress",
                  "current-time",
                  "mute",
                  "volume",
                  "settings",
                  "fullscreen",
                ],
                settings: ["quality", "speed"],
                autoplay: false,
                youtube: {
                  noCookie: true,
                  rel: 0,
                  modestbranding: 1,
                },
                vimeo: {
                  byline: false,
                  portrait: false,
                  title: false,
                  speed: true,
                },
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: "16px",
                textAlign: "center",
                padding: "20px",
                color: "common.white",
              }}
            >
              Invalid video URL
            </Typography>
          )}
        </Box>

        <div className="pt-[20px] px-[10px] pb-0">
          <Typography
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: 3,
            }}
            variant="h3"
            className="text-[16px] leading-[24px] md:text-[20px] md:leading-[28px] font-600 mb-[0] line-clamp-3"
          >
            {schedule?.event}
          </Typography>
        </div>
      </DialogContent>
    </>
  );
};

export default VideoPopup;
