import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Button } from "@mui/material";
import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { getAttendeeCountAPI } from "./apis/Get-AttendeeCount-Api";
import LocalCache from "src/utils/localCache";
import { seatLimit } from "src/utils/seatLimit";

type Props = {
  setKeyword?: (data: string) => void;
  keyword?: string;
  rules?: any;
  heading?: string;
  expoId?: string;
  onDownload?: () => void;
  onRefresh?: () => void;
};
function AttendeesHeader({
  setKeyword,
  keyword,
  rules,
  expoId,
  onDownload,
  onRefresh
}: Props) {
  const { t } = useTranslation("attendees");
  const routeParams = useParams();
  const [isSeatFull, setIsSeatFull] = useState<boolean | true>(false);

  useEffect(() => {
    getInitialDetails();
  }, [])

  const getInitialDetails = async () => {
    const isSeatsFull = await seatLimit(routeParams.id);
    setIsSeatFull(isSeatsFull);
  }

  const customButtons = [
    {
      key: "refresh",
      component: (
        <>{onRefresh && <Button
          className="whitespace-nowrap p-0 min-w-40 max-w-40 me-6"
          sx={{
            backgroundColor: "background.default",
          }}
          variant="contained"
          onClick={onRefresh}
        >
          <FuseSvgIcon size={20} color="primary">
            material-outline:refresh
          </FuseSvgIcon>
        </Button>}
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
        label={t("attendees_heading")}
        searchLabel={t("common_search")}
        searchKeyword={keyword}
        setSearchKeyword={setKeyword}
        buttonLabel={t("attendees_addButton_text")}
        isButtonDisabled={isSeatFull}
        button={rules?.addUser?.permission}
        buttonUrl={"/admin/expo/attendee/" + expoId}
        target="_blank"
        customButtons={customButtons}
      />
    </div>
  );
}

export default AttendeesHeader;
