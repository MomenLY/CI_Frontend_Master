import React, { useEffect, useState } from "react";
import BillboardBanner from "./BillboardBanner";
import BillboardForm from "./BillboardForm";
import data from "./layout1.json";
import { Button, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { useNavigate, useParams } from "react-router";
import { getBillboardList } from "./apis";
import ImageModal from "./imageModal";
import FuseLoading from "@fuse/core/FuseLoading";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpoJson } from "../booth/apis.ts/get-expo-json";
import { useDispatch } from "react-redux";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
interface Billboard {
  key: string;
  componentName: string;
  componentHelperText: string;
  rules: {
    width: number;
    height: number;
    maxFileSize: number;
    allowedTypes: string[];
  };
  data: {
    files: {
      [fileId: string]: {
        billboardResources: string;
        billboardLink: string;
        billboardDuration: number;
        billboardOrder: number;
      };
    };
  };
}

interface BillboardData {
  [key: string]: Billboard;
}

function BillboardContent({
  getBillboardJson1,
  billboardJsonDetails,
}: {
  getBillboardJson1?: () => void;
  billboardJsonDetails: { billBoard: BillboardData };
}) {
  // Correctly accessing `billBoard` from `billboardJsonDetails`
  // const billboards: BillboardData = billboardJsonDetails?.billBoard;
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal open/close
  const handleOpen = () => {
    setShowEachBooth(false)
    setIsModalOpen(true)
  }; // Open modal
  const handleClose = () => setIsModalOpen(false); // Close modal
  const [showEachBooth, setShowEachBooth] = useState<boolean>(false); // for showing each booth
  const { id } = useParams();
  const { t } = useTranslation("billboard");
  const [expoDetails, setExpoDetails] = useState(null);
  const routeParams = useParams();
  const [billboardDetails, setBillboardDetails] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state
  const [billboardUpdate, setBillboardUpdate] = useState(false)
  const [queryTrigger, setQueryTrigger] = useState(false)


  const generatePreview = () => {
    getBillboardJson();
  };
  const getBillboardJson = async () => {
    setLoading(true);
    try {
      let expoCode = expo?.expCode;
      if (!expoCode) {
        console.warn("Expo code is not available");
        return;
      }
      const billboardDetails = await getBillboardList(expoCode);
      setBillboardDetails(billboardDetails);
      setLoading(false); // Set loading to false after data is fetched
      handleOpen();
    } catch (error) {
      console.error("Error fetching billboard details:", error);
      setLoading(false); // Handle loading in case of an error
    }
  };
  const {
    data: expo,
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
    queryKey: ["expoData", expo?.expCode], // Unique key for the second query
    queryFn: () => getExpoJson(expo?.expCode), // Fetch function for additional data
    enabled: !!expo?.expCode, // Prevents the query from running if id is falsy
    staleTime: 0, // Keep the data fresh for 5 minutes
    retry: 2, // Retry the request up to 2 times if it fails
    refetchOnWindowFocus: false, // Avoid refetching when the window is focused
  });

  const dispatch = useDispatch()
  const navigate = useNavigate()
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


  // If expo data is present, you can use it

  let billboards = {}
  if (expoJson) {
    billboards = expoJson?.billBoard;
  }
  if (isLoadingExpoJson) return <FuseLoading />

  return (
    <div className="">
      <BillboardBanner expoDetails={expo} />
      {Object.entries(billboards).map(([key, billboard]) => (
        <BillboardForm billboardData={billboard} key={key}  />
      ))}
      <div className="flex gap-16 justify-end max-w-[580px] mt-40">
        <Button
          onClick={() => {
            generatePreview();
          }}
          className="min-w-[92px] min-h-[41px] font-medium rounded-lg uppercase"
          variant="outlined"
          color="primary"
          disabled={loading}
          // onClick={handleClose}getBillboardJson
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
          {loading === true ? (
            <CircularProgress size={25} color="inherit" />
          ) : (
            t("billborad_priview_btn")
          )}
        </Button>

        {/* <Button
        onClick={()=>{
          // updateBillboardBulk()
        }}
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
      </div>
      {!loading && (
        <ImageModal
          expo={expo}
          open={isModalOpen}
          handleClose={handleClose}
          setShowEachBooth={setShowEachBooth}
          showEachBooth={showEachBooth}
        />
      )}
    </div>
  );
}

export default BillboardContent;
