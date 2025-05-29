import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Button } from "@mui/material";
import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import { useTranslation } from "react-i18next";

type Props = {
  setKeyword?: (data: string) => void;
  keyword?: string;
  rules?: any;
  heading?: string;
  expoId?: string;
  onDownload?: () => void;
  onRefresh?: () => void;
};
function BoothHeader({
  setKeyword,
  keyword,
  rules,
  expoId,
  onDownload,
  onRefresh
}: Props) {
  const { t } = useTranslation("boothReport");

  const customButtons = [
    {
      key: "refresh",
      component: (
        <>
          <Button
            className="whitespace-nowrap p-0 min-w-40 max-w-40 me-6"
            sx={{
              backgroundColor: "background.default",
            }}
            variant="contained"
            onClick={onDownload}
          >
            <FuseSvgIcon size={20} color="primary">
              material-outline:file_download
            </FuseSvgIcon>
          </Button></>
      ),
    },
    // You can add more custom buttons here as needed
  ];

  return (
    <div className="">
      <OnionCustomHeader
        label={t("booth_heading")}
        searchLabel={t("common_search")}
        searchKeyword={keyword}
        setSearchKeyword={setKeyword}
        buttonLabel={t("attendees_addButton_text")}
        button={false}
        target="_blank"
        customButtons={customButtons}
      />
    </div>
  );
}

export default BoothHeader;
