import { useState, useEffect } from "react";
import { expoBillboardResoucesUrl } from "src/utils/urlHelper";

const Billboard = ({
  billboardData,
  position,
  size,
  onPress,
  tenant
}) => {
  const [visible, setVisible] = useState(false);
  const cleanedTenant = tenant.replace(/^tenant-/, '');
  const resourceUrl = expoBillboardResoucesUrl(billboardData?.billboardResources, cleanedTenant);

  const isVideo = billboardData?.billboardResources?.endsWith(".mp4");
  const isImage =
    billboardData?.billboardResources?.endsWith(".jpeg") ||
    billboardData?.billboardResources?.endsWith(".png") ||
    billboardData?.billboardResources?.endsWith(".jpg") ||
    billboardData?.billboardResources?.endsWith(".webp");

  useEffect(() => {
    // Reset visibility to apply fade effect on resource change
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, [resourceUrl]);

  return (
    <>
      {isImage && (
        <image
          style={{ background: "#000",}}
          href={resourceUrl}
          x={position.x}
          y={position.y}
          width={size.width}
          height={size.height}
          preserveAspectRatio="xMidYMid slice"
          className={`fade-in ${visible ? "fade-in-visible" : ""}`}
        />
      )}
      {isVideo && (
        <foreignObject
          style={{ background: "#000",}}
          x={position.x}
          y={position.y}
          width={size.width}
          height={size.height}
          className={`fade-in ${visible ? "fade-in-visible" : ""}`}
        >
          <video
            src={resourceUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#000",
            }}
            autoPlay
            loop
            muted
            playsInline
          />
        </foreignObject>
      )}
      <rect
        x={position.x}
        y={position.y}
        width={size.width}
        height={size.height}
        fill="transparent"
        style={{ cursor: billboardData?.billboardLink ? 'pointer' : 'default' }}
        onClick={onPress}
      />
    </>
  );
};

export default Billboard;
