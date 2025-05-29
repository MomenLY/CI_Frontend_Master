import BoothBanner from "./BoothBanner";
import BoothList from "./BoothList";
import { useNavigate, useParams } from "react-router";
import { getExpoJson } from "./apis.ts/get-expo-json";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LocalCache from "src/utils/localCache";
import { useEffect, useState } from "react";
import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { useDispatch } from "react-redux";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { Button } from "@mui/material";
import ImageModal from "../billboard/imageModal";
import FuseLoading from "@fuse/core/FuseLoading";

function BoothContent() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to manage modal open/close
  const [showEachBooth, setShowEachBooth] = useState<boolean>(false);

  const handleOpen = () => {
    setShowEachBooth(false)
    setIsModalOpen(true)
  }; // Open modal
  const handleClose = () => setIsModalOpen(false); // Close modal

  // First query to fetch expo details
  const {
    data: expoDetails,
    error: expoError,
    isLoading: isLoadingExpo,
  } = useQuery({
    queryKey: ["expoDetails", id], // Unique key for caching
    queryFn: async () => {
      const details = await LocalCache.getItem(
        `expoDetails_${id}`,
        () => getSingleExpoAPI(id) // Fetch function to get expo details
      );
      return details.data.expo; // Return the expo data
    },
    enabled: !!id, // Only run the query if id is available
    staleTime: 0, // Keep the data fresh for 5 minutes
    retry: 2, // Retry the request up to 2 times if it fails
    refetchOnWindowFocus: false, // Avoid refetching when the window is focused
  });

  // Second query to fetch additional expo data
  const {
    data: expoJson,
    error: additionalError,
    isLoading: isLoadingExpoJson,
    isError: isAdditionalError,
  } = useQuery({
    queryKey: ["expoData", expoDetails?.expCode], // Unique key for the second query
    queryFn: () => getExpoJson(expoDetails?.expCode), // Fetch function for additional data
    enabled: !!expoDetails?.expCode, // Prevents the query from running if id is falsy
    staleTime: 0, // Keep the data fresh for 5 minutes
    retry: 2, // Retry the request up to 2 times if it fails
    refetchOnWindowFocus: false, // Avoid refetching when the window is focused
  });

  // Effect to handle errors for both queries
  useEffect(() => {
    if (expoError) {
      dispatch(
        showMessage({
          message: `Expo not found: ${expoError.message}`,
          variant: "error",
        })
      );
      navigate("/admin/expo-management");
    } else if (additionalError) {
      dispatch(
        showMessage({
          message: `Error fetching additional data: ${additionalError.message}`,
          variant: "error",
        })
      );
    }
  }, [expoError, additionalError, dispatch, navigate]);

  return (
    <div className="flex flex-col ">
      <div className="pt-[10px] p-[26px]">
        <BoothBanner expoDetails={expoDetails} isLoadingExpoJson={isLoadingExpoJson} />
      </div>

      <div className="pt-[-10px] p-[-26px]">
        <BoothList json={expoJson} expoDetails={expoDetails} />
      </div>

      <div className="flex gap-16 justify-center mt-40">
        <Button
          className="min-w-[92px] min-h-[41px] font-medium rounded-lg uppercase"
          variant="outlined"
          color="primary"
          onClick={handleOpen}
          sx={{
            borderColor: "primary.main",
            border: "1px solid",
            "&:hover": {
              border: "1px solid",
              borderColor: "primary.main",
              backgroundColor: "primary.main",
              color: "background.paper",
            },
          }}
        >
          PREVIEW
        </Button>

        {/* <Button
          className="min-w-[68px] min-h-[41px] font-medium rounded-lg uppercase"
          variant="contained"
          color="primary"
          sx={{
            // borderWidth: 2,
            border: "1px solid",
            borderColor: "primary.main",
            backgroundColor: "primary.main",
            color: "background.paper",
            "&:hover": {
              border: "1px solid",
              borderColor: "primary.main",
              backgroundColor: "primary.main",
              color: "background.paper",
              opacity: "0.8",
            },
          }}
        >
          Save
        </Button> */}

        {!isLoadingExpo && (
          <ImageModal
            expo={expoDetails}
            open={isModalOpen}
            handleClose={handleClose}
            showEachBooth={showEachBooth}
            setShowEachBooth={setShowEachBooth}
          />
        )}
      </div>
    </div>
  );
}

export default BoothContent;
