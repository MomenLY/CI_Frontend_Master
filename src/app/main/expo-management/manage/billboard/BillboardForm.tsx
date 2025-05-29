import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
// import DraggableTable from "./DraggableTable";
import DraggableList from "./DraggableList";
import TaskList from "./TaskList";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import OnionFileUpload from "app/shared-components/onion-file-upload/OnionFileUpload";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { useAppDispatch } from "app/store/hooks";
import { bulkUpdateBillboard, createBillbaordDetails, getBillboardList } from './apis';

import { customFilePath, defaultUserImageUrl, expoBillboardResoucesUrl } from "src/utils/urlHelper";
import FuseLoading from "@fuse/core/FuseLoading";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl } from "@mui/base";
import { z } from 'zod';
import { convertImageToDataURL } from "app/shared-components/onion-file-upload/onion-image-cropper/cropper-helper";
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import { useNavigate, useParams } from 'react-router';
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




function BillboardForm(props) {

  const { t } = useTranslation('billboard');
  const [loading, setLoading] = useState(false);  // Add loading state
  const [billboards, setBillboards] = useState<BillboardData>(props);
  const [updateUploadedFiles, setUpdateUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [upLoadProgress, setUploadProgress] = useState<any>();
  const [image, setImage] = useState("");
  const [userPreviewImage, setUserPreviewImage] = useState('');
  const [upLoadImageProgress, setUploadImageProgress] = useState<any>();
  const [imageFileErrors, setImageFileErrors] = useState({});
  const [fileFormat, setfileFormat] = useState("");
  const [autoUpload, setAutoUpload] = useState<boolean>(false);
  const [billboradLayout, setBillboradLayout] = useState("")
  const [fileQueue, setFileQueue] = useState({});
  const dispatch = useAppDispatch();
  const [expoDetails, setExpoDetails] = useState(null);
  const routeParams = useParams();
  useEffect(() => {
    const fetchExpoDetails = async () => {
      let expoDetails = await LocalCache.getItem(
        cacheIndex.expoDetails + "_" + routeParams.id,
        getSingleExpoAPI.bind(this, routeParams.id)
      );
      setExpoDetails(expoDetails);
    };

    fetchExpoDetails();
  }, [routeParams]);
  useEffect(() => {

    // setUpdateUploadedFiles(updateUploadedFiles);
  }, [expoDetails])
  const handleFileSelect = (files) => {


  };
  const schema = z.object({
    billboardFile: z.string().nonempty('Poll question is required'),

  });
  const { control, formState, handleSubmit, watch, reset, setValue, getValues } = useForm({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      billboardFile: ""

    }
  });

  const onSubmit = async (data) => {

  }

  const handleImageSelect = (files, billboard) => {
    setUserPreviewImage("");
    setfileFormat("")
    if (files.identifier === "billboardResouce") {
      for (let [fileKey, _file] of Object.entries(files.files)) {
        convertImageToDataURL(files.files[fileKey]['file'], setUserPreviewImage);
        setfileFormat(files.files[fileKey]['file'].type)

        break;
      }
      setBillboradLayout(billboard?.key)
    }
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[files.identifier] = false;
      return _prev;
    });
  };


  const handleImageDefectiveFiles = (files) => {
    setImageFileErrors((errors) => {
      const _errors = { ...errors };
      for (const fileId in files) {
        if (files.hasOwnProperty(fileId)) {
          const file = files[fileId];
          _errors[file.identifier] = {
            error: true,
            message: `Invalid File`,
          };
        }
      }
      return _errors;
    });

    for (const fileId in files) {
      if (files.hasOwnProperty(fileId)) {
        const file = files[fileId];
        dispatch(showMessage({ message: `${file.defects}`, variant: "error" }));
      }
    }
  };

  const handleImageProgress = (progress: {}) => {

    setUploadImageProgress(progress);
  };

  const handleProgress = (progress: {}) => {
    setUploadProgress(progress);
  }


  const addBillboradDetails = async (payload: any) => {
    try {
      const billboardDetails = await createBillbaordDetails(payload);
      if (billboardDetails?.data?.billboard) {
        // getBillboardJson()
      }
      dispatch(showMessage({ message: t("billboard_added_success"), variant: "success" }));
      setLoading(false);
      setAutoUpload(false);
    } catch (error) {
      console.error("Error fetching billboard details:", error);
      setLoading(false);
    }
  };

  const getBillboardJson = async () => {
    // setBillboards({})
    try {
      let expoCode = expoDetails?.data?.expo?.expCode;
      if (!expoCode) {
        console.warn('Expo code is not available');
        return;
      }
      const billboardDetails = await getBillboardList(expoCode);

      setBillboards(billboardDetails.billBoard);
      setLoading(false);  // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching billboard details:', error);
      setLoading(false);  // Handle loading in case of an error
    }
  };

  const handleImageUploadComplete = async (result) => {

    let expoCode = expoDetails?.data?.expo?.expCode;
    if (!expoCode) {
      console.warn('Expo code is not available');
      return;
    }
    
    const _result = await result?.data;
    setImage(_result?.data); // Set the image URL here
    // After setting the image, you can trigger form submission if needed
    handleSubmit(onSubmit)(); // Trigger form submission
    // Reset file queue or any other state as needed
    setFileQueue((prev) => {
      const _prev = { ...prev };
      _prev[result.id] = true;
      return _prev;
    });

    let billboradCode: any;
    if (billboradLayout == "billboardCenter") {
      billboradCode = "BILLBOARD001"
    } else if (billboradLayout == "billboardLeft") {
      billboradCode = "BILLBOARD002"
    } else if (billboradLayout == "billboardRight") {
      billboradCode = "BILLBOARD003"
    }
    let payload = {
      expoCode: expoCode,
      billboardResources: result?.data?.data,
      billboardLayout: billboradLayout,
      billboardCode: billboradCode

    }
    addBillboradDetails(payload)
    setAutoUpload(false)
    setUserPreviewImage("");
    setfileFormat("")
    window.location.reload();
  };
  const handleCropCancel = (identifier) => {
    if (identifier === 'billboardResouce') {
      setUserPreviewImage("")
    }
  }
  // if (loading) {
  //   return <FuseLoading />;
  // }

  return (
    <>
      {Object.entries(billboards).map(([key, billboard]) => {
   
        return (
          <div className="my-12" key={key}>
            <div className="pt-12 pb-8">
              <Typography
                color="text.primary"
                className="font-semibold text-[13px] block mb-6"
              >
                {t(billboard.componentName)} ({billboard.rules.width}X{billboard.rules.height})
              </Typography>
              <Typography
                variant="caption"
                color="text.disabled"
                className="font-normal text-[11px] block"
              >
                {t(billboard.componentHelperText)}
              </Typography>
            </div>
            <div className="py-20">
              <Box
                className="text-center  rounded-6  sm:max-w-[372px]"
                sx={{
                  Height: "100%",
                  maxHeight: "254px",
                  minHeight: "254px",
                  padding: "0",
                  border: "2px dashed",
                  borderColor: "#D9D9D9",
                }}
              >
                <div className="p-16 justify-center">
                  <div className="min-h-[110px] flex items-center justify-center">
                    {
                      userPreviewImage == "" ?

                        <FuseSvgIcon
                          style={{
                            opacity: "0.2",
                          }}
                          className="text-48"
                          size={100}
                          color="text.disabled"
                        >
                          heroicons-outline:plus-circle
                        </FuseSvgIcon>
                        :

                        <div className="w-[162px] h-[112px] bg-red-300 relative overflow-hidden rounded-[8px]">
                          {
                            fileFormat == "video/mp4" ?
                              <video
                                className="w-full h-full object-cover bg-[#000] opacity-100"
                                src={userPreviewImage}
                                autoPlay
                                muted
                                loop
                              ></video> :
                              <img
                                className="w-full h-full object-cover"
                                src={userPreviewImage}
                              />
                          }

                        </div>

                    }


                  </div>

                  <div className="mt-0 mb-[25px]">
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[12px] block"
                    >
                      {t('supported_file_types_text')}- {billboard.rules.allowedTypes.join(", ")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      className="font-normal text-[11px] block"
                    >
                      ({t('max_file_size_text')} {billboard.rules.maxFileSize} MB)
                    </Typography>
                  </div>

                  <div className="flex  justify-center">

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      autoComplete="off"
                    >
                      <Controller
                        name="billboardFile"
                        control={control}

                        render={({ field: { onChange, value } }) => (
                          < OnionFileUpload
                            id="billboardResouce"
                            loader={false}
                            accept={"image/jpeg, image/png,video/mp4,"}
                            maxFileSize={10}
                            multiple={false}
                            autoUpload={autoUpload}
                            buttonClass="font-medium rounded-lg uppercase"
                            onSelect={(files) => handleImageSelect(files, billboard)}
                            buttonLabel={t('upload_button_text')}
                            buttonColor={"primary"}
                            uploadPath={`uploads/ci/${expoDetails?.data?.expo?.expTenantId}/billboards`}
                            onProgress={handleImageProgress}
                            onFileUploadComplete={handleImageUploadComplete}
                            onSelectingDefectiveFiles={handleImageDefectiveFiles}
                            cropper={true}
                            aspectRatio={2 / 1}
                            onCropCancel={handleCropCancel}


                          />
                        )}
                      /></form>
                    {/* </Button> */}
                    {
                      userPreviewImage !== "" &&
                      <Button
                        className="ms-20 mx-4 rounded-[10px] font-medium uppercase "
                        variant="contained"
                        color="primary"
                      >
                        <span className=" " onClick={() => {
                          setAutoUpload(true); setLoading(true)
                        }}>

                          {loading ? <CircularProgress size={25} color='inherit' /> : t("billboard_upload_btn")}
                        </span>
                      </Button>
                    }

                  </div>


                </div>


              </Box>
            </div>
            <div className="py-8 relative   px-1 w-[100%] overflow-hidden flex ">
              <Box
                sx={{
                  border: "none",
                  margin: 0,
                  boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
                  padding: 0,
                  borderRadius: "12px",
                  width: { xs: "calc(100vw - 80px)", md: "650px" },
                  maxWidth: "650px",
                  overflow: "auto",
                }}
              >
                <TaskList expTenantId={expoDetails?.data?.expo?.expTenantId} setUpdateUploadedFiles={setUpdateUploadedFiles} files={billboard.data?.files} componentName={billboard.key} />
              </Box>
            </div>
          </div>

        );
      })}


    </>
  );
}

export default BillboardForm;
