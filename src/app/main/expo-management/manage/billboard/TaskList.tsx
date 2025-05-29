import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import { IconButton } from "@mui/material";
import format from "date-fns/format";
import clsx from "clsx";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import ImageModal from "./priviewModal";
import AddLink from "./AddLink";
import { bulkUpdateBillboard, deleteBillboardById, updateBillboardById } from "./apis";
import OnionConfirmBox from "app/shared-components/components/OnionConfirmBox";
import { useAppDispatch } from "app/store/hooks";
import { closeDialog, openDialog } from "@fuse/core/FuseDialog/fuseDialogSlice";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
type File = {
  billboardResources: string;
  billboardLink: string;
  billboardDuration: number;
  billboardOrder: number;
};

type Files = {
  [key: string]: File;
};
function TaskList({ expTenantId, setUpdateUploadedFiles, files, componentName, }) {

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);  // Add loading state
  const { t } = useTranslation('billboard');
  const filesData: Files = files;
  const filesDataArray =

    filesData !== null && filesData !== undefined && Object.entries(filesData).map(([key, value]) => ({ id: key, ...value }));
  const [filesState, setFilesState] = useState(filesDataArray);
  const [uploadedFiles, setUploadedFiles] = useState(filesDataArray);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBillboardId, setActiveBillboardId] = useState(null); // Store the active billboard ID
  const [newLink, setNewLink] = useState(""); // Store the new link entered in the modal
  const [linkValue, setLinkValue] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [updatedFiles, setUpdatedFiles] = useState([]);
  const [debouncedDuration, setDebouncedDuration] = useState(null); // For debounced value
  const [debounceTimeout, setDebounceTimeout] = useState(null); // For managing the timeout
  const [imageUrl, setImageUrl] = useState("")
  const [isModalOpen1, setIsModalOpen1] = useState(false);


  // if (uploadedFiles.length === 0) {
  //   return (
  //     <div className="flex flex-1 items-center justify-center h-full">
  //       <Typography color="text.secondary" variant="h5">
  //         {t('billboard_table_no_items_text')}
  //       </Typography>
  //     </div>
  //   );
  // }

  function onDragEnd(result) {
    if (uploadedFiles.length <= 1) return;

    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // Copy the array of uploaded files
    const newItems = Array.from(uploadedFiles);

    // Remove the dragged item from the original position
    const [movedItem] = newItems.splice(source.index, 1);

    // Add the dragged item to the new position
    newItems.splice(destination.index, 0, movedItem);

    // Update the billboardOrder based on the new positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      billboardOrder: index + 1,  // Reassign billboardOrder based on the new index
    }));

    // Update the state with the new ordered list
    setUploadedFiles(updatedItems);
    updateBillboardBulk(updatedItems)
  }



  function handleDurationChange(e, id) {
    const newDuration = Number(e.target.value); // Convert to number
    const updatedItems = uploadedFiles.map((item) =>
      item.id === id ? { ...item, billboardDuration: newDuration } : item
    );

    setUploadedFiles(updatedItems);
    const updatedItem = updatedItems.find(item => item.id === id);
    // Debounce the update (3 seconds delay)
    if (debounceTimeout) {
      clearTimeout(debounceTimeout); // Clear the previous timeout
    }

    // Set a new timeout for 3 seconds before making the API call
    setDebounceTimeout(setTimeout(() => {
      if (updatedItem) {
        const updatedDetails = {
          ...updatedItem,
          billboardDuration: newDuration,
        };
        updateBillbordbyId(updatedDetails); // Trigger API call after 3 seconds of inactivity
      }
    }, 3000)); // 3-second delay before triggering the API
  }

  const handleSaveLink = () => {
    const updatedItems = uploadedFiles.map((item) =>
      item.id === selectedFileId
        ? { ...item, billboardLink: linkValue }  // Update the link
        : item
    );

    // Find the updated item (after modification)
    const updatedItem = updatedItems.find(item => item.id === selectedFileId);
    updateBillbordbyId(updatedItem);
    setUploadedFiles(updatedItems);
    handleCloseModal();
  };


  const handlePlusClick = (item) => {
    setSelectedFileId(item.id);  // Track which item is being edited
    setLinkValue(item.billboardLink || "");  // Populate modal with existing link if any
    setIsModalOpen(true);  // Open modal when the plus icon is clicked
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewLink(""); // Clear the input when the modal is closed without saving
  };

  const handleDelete = async (id) => {

    await deleteUser(id)
  };
  const updateBillbordbyId = async (uploadedFiles: any) => {
    setLoading(true)
    try {
      const billboardDetails = await updateBillboardById(uploadedFiles)
      setLoading(false);
      dispatch(showMessage({ message: t("billboard_update_success"), variant: "success" }));
    } catch (error) {
      console.error('Error fetching billboard details:', error);
      setLoading(false);  // Handle loading in case of an error
    }
  };

  const deleteBillbordbyId = async (billId: any) => {
    setLoading(true)
    try {

      const billboardDetails = await deleteBillboardById(billId)
      setLoading(false);
      dispatch(showMessage({ message: t("billboard_deleted_success"), variant: "success" }));
    } catch (error) {
      console.error('Error fetching billboard details:', error);
      setLoading(false);
    }
  };
  const deleteUser = (id) => {
    dispatch(openDialog({
      children: (
        <OnionConfirmBox
          title={t('billboardDeleteConfirm')}
          subTitle={t('billboardDeleteHelperText')}
          onCancel={() => dispatch(closeDialog())}
          variant="warning"
          onConfirm={() => {
            deleteBillbordbyId([id]);
            const filteredItems = uploadedFiles.filter(item => item.id !== id);
            const updatedItems = filteredItems.map((item, index) => ({
              ...item,
              billboardOrder: index + 1,
            }));
            setUploadedFiles(updatedItems);
            dispatch(closeDialog());
          }}
        />
      ),
    }));
  }
  const updateBillboardBulk = async (updatedItems) => {
    setLoading(true)
    try {
      // Assuming billboards?.billboardData?.data?.files holds the billboard data
      // const billboardData = billboards?.billboardData?.data?.files || {};

      // Map the billboard data to the desired format
      const billboardArray = Object.keys(updatedItems).map(key => ({
        id: key,
        ...updatedItems[key],
      }));
      // Create the correct payload format for the API request
      const payload = {
        billboard: billboardArray,
      };
      // Call the bulk update API with the formatted payload
      const billboardDetails = await bulkUpdateBillboard(payload);
      dispatch(showMessage({ message: t("billboard_update_success"), variant: "success" }));
      // Set loading to false once the data is fetched
      setLoading(false);

    } catch (error) {
      console.error('Error fetching billboard details:', error);
      setLoading(false);  // Handle loading in case of an error
    }
  };
  // useEffect(() => {

  //   // updateBillbordbyId(uploadedFiles)
  //   setUpdateUploadedFiles(uploadedFiles);
  // }, [uploadedFiles, setUpdateUploadedFiles]);
  const handlePlusClick1 = (item) => {
    setImageUrl(item.billboardResources)
    setIsModalOpen1(true);
  };
  const handleCloseModal1 = () => {
    setIsModalOpen1(false); // Close modal
  }

  return (
    <>
      <List className="m-0 p-0 rounded-8 min-w-[650px]" key={files?.componentName + "_List"}>
        {
          uploadedFiles.length > 0 &&
          <div className="flex p-[25px] !pb-[6px] ps-[75px]">
            <div className="flex flex-1 py-5 px-10 break-words text-[12px] font-[600] w-[200px]">
              {t('billboard_table_head_name_text')}
            </div>
            <div className="flex py-5 px-10 w-[100px] items-center justify-center break-words text-[12px] font-[600]">
              {t('billboard_table_head_duration_text')}
            </div>
            <div className="flex py-5 px-10 w-[80px] items-center justify-center break-words text-[12px] font-[600]">
              {t('billborad_priview_btn1')}
            </div>
            <div className="flex py-5 px-10 w-[80px] items-center justify-center break-words text-[12px] font-[600]">
              {t('billboard_table_head_link_text')}
            </div>
            <div className="w-[30px] py-5 px-10 break-words"></div>
          </div>
        }


        <DragDropContext onDragEnd={onDragEnd} key={files?.componentName + "_DragDropContext"}>
          <Droppable droppableId="list" type="list" direction="vertical" key={files?.componentName + "_Droppable"} >
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} key={files?.componentName + "_div_ref"}>
                {uploadedFiles.length > 0 && uploadedFiles.map((item, index) => {

                  //if (item.type === "task") {
                  return (
                    <>
                      <Draggable
                        key={files?.componentName + "_" + item.id.toString()}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <>
                            <ListItem
                              key={files?.componentName + "_ListItem_" + item.id.toString()}
                              className={clsx(
                                snapshot.isDragging ? "shadow-lg" : "shadow",
                                "ps-40 pe-20 py-12 group"
                              )}
                              sx={{ bgcolor: "background.paper" }}
                              button
                              component={NavLinkAdapter}
                              // to={`/apps/tasks/${item.id}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div
                                className="md:hidden absolute flex items-center justify-center inset-y-0 left-8 w-32 cursor-move md:group-hover:flex"
                                {...provided.dragHandleProps}
                                key={files?.componentName + "_dv"}
                              >
                                <FuseSvgIcon
                                  sx={{ color: "text.disabled" }}
                                  size={20}
                                >
                                  material-solid:drag_indicator
                                </FuseSvgIcon>
                              </div>

                              <div className="flex flex-1 py-5 px-10 break-words items-center w-[200px]" key={files?.componentName + "_dv2"}>
                                <ListItemIcon className="min-w-40 -ml-10 mr-8" key={files?.componentName + "_listitem2"}>
                                  <IconButton

                                    onClick={(ev) => {
                                      ev.preventDefault();
                                      ev.stopPropagation();
                                    }}
                                  >
                                    <FuseSvgIcon size={20} key={files?.componentName + "_fuseicon"}>
                                      feather:file
                                    </FuseSvgIcon>
                                  </IconButton>
                                </ListItemIcon>

                                <ListItemText
                                  key={files?.componentName + "_listitem_text"}
                                  // classes={{ root: "m-0", primary: "truncate" }}
                                  primary={item.billboardResources}
                                />
                              </div>
                              <div className="flex  py-5 px-10 break-words text-center w-[100px] justify-center items-center">
                                <TextField
                                  type="number"
                                  id="outlined-error"
                                  value={item?.billboardDuration}  // Set the value to billboardDuration
                                  size="small"
                                  onChange={(e) => handleDurationChange(e, item.id)}  // Pass the event and item ID
                                  InputProps={{
                                    inputProps: { min: 0 }  // Prevent entering values less than 0
                                  }}
                                />

                              </div>
                              <div className="flex  py-5 px-10 break-words  items-center w-[80px] justify-center">
                                <FuseSvgIcon onClick={() => handlePlusClick1(item)}
                                  className="text-48"
                                  size={24}
                                  color="text.disabled"
                                >
                                  feather:eye
                                </FuseSvgIcon>
                              </div>
                              <div className="flex  py-5 px-10 break-words  items-center w-[80px] justify-center">
                                <FuseSvgIcon
                                  onClick={() => handlePlusClick(item)}
                                  className="text-48"
                                  size={26}
                                  color="text.disabled"
                                >
                                  feather:plus
                                </FuseSvgIcon>
                              </div>
                              <div className="w-[30px] py-5 px-10 break-words">
                                <FuseSvgIcon
                                  onClick={() => handleDelete(item.id)}
                                  className="text-48"
                                  size={20}
                                  color="error"
                                >
                                  feather:trash
                                </FuseSvgIcon>
                              </div>
                            </ListItem>

                            <Divider />
                          </>
                        )}
                      </Draggable>
                    </>
                  );
                  //}
                  //return null;
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </List>

      <AddLink
        open={isModalOpen}
        linkValue={linkValue}
        setLinkValue={setLinkValue}
        handleClose={handleCloseModal}
        handleSave={handleSaveLink}
      />
      <ImageModal expTenantId={expTenantId} imageUrl={imageUrl} open={isModalOpen1} handleClose={handleCloseModal1} />
    </>
  );
}

export default TaskList;
