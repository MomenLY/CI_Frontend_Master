import React, { useEffect, useState } from "react";
import LocalCache from "src/utils/localCache";
import { generateChatToken } from "../../api/generate-chat-token";
import { userImageUrl } from "src/utils/urlHelper";

const BoothChat = ({ expo, booth_manager_id, booth_id }) => {
  const [iframeSrc, setIframeSrc] = useState("");
  useEffect(() => {
    (async () => {
      let userDetails = await LocalCache.getItem("userData");
      const payload = {
        expName: booth_id,
        email: userDetails?.data?.email,
        show_announcement: false,
        show_group: false,
        booth_manager_id: booth_manager_id,
        image:
          userDetails?.data?.userImage === "default.webp" ||
          !userDetails?.data?.userImage
            ? ""
            : userImageUrl(userDetails?.data?.userImage),
      };
      const { data } = await generateChatToken(payload);
      const newSrc = import.meta.env.VITE_CHAT_URL + `/?token=${data}`;
      setIframeSrc(newSrc);
    })();
  }, []);
  return (
    <div className="p-0 h-full flex">
      <iframe
        src={iframeSrc}
        title="Event Details"
        width="100%"
        height="100%"
        style={{
          border: "none",
          height: "100%",
        }}
        className="responsive-iframe h-full"
      ></iframe>
    </div>
  );
};

export default BoothChat;
