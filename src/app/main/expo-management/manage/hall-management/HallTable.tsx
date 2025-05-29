import {
  Avatar,
  AvatarGroup,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
  GlobalStyles,
} from "@mui/material";
import DataTable from "app/shared-components/data-table/DataTable";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { debounce, size } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { closeDialog, openDialog } from "@fuse/core/FuseDialog/fuseDialogSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useSearchParams } from "react-router-dom";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import LocalCache from "src/utils/localCache";
import { getHallDetailsAPIWithSearch } from "./apis/Get-Hall-Details-Api";
import OnionConfirmBox from "app/shared-components/components/OnionConfirmBox";
import { useHallManagementSelector } from "./HallManagementSlice";
import { Box, width } from "@mui/system";
import { BulkDeleteHallAPI } from "./apis/Delete-Hall-Api";
import { isDefaultLobby } from "src/utils/common";
import { GetScheduleAPI } from "./apis/Get-Schedule-API";

type Props = {
  keyword?: string;
  setKeyword?: (data: string) => void;
  rules: any;
};

function HallTable({ keyword }: Props) {
  const routeParams = useParams();
  let expoId = routeParams.id
  const navigate = useNavigate();
  const { t } = useTranslation("hallManagement");
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [pageReady, setPageReady] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [columnOrder, setColumnOrder] = useState(["slno"]);
  const [halls, setHalls] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 50,
  });
  const [columnPinning, setColumnPinning] = useState({
    left: ["mrt-row-expand", "mrt-row-select"],
    right: ["mrt-row-actions"],
  });
  const [columnVisibility, setColumnVisibility] = useState({});
  const cachedTableData = useRef(null);
  const state = useHallManagementSelector((state) => state.state.value);

  const sortInitialState = [];
  const _sortColumn = searchParams?.get("sortColumn");
  const _sortOrder = searchParams?.get("sortOrder");
  if (_sortColumn && _sortOrder) {
    sortInitialState.push({
      id: _sortColumn,
      desc: _sortOrder == "DESC",
    });
  }
  const [sorting, setSorting] = useState(sortInitialState);

  const columns = [
    {
      accessorKey: "slno",
      header: `${t("hall_Slno")}`,
      size: 10,
      options: {
        display: false,
      },
      enableSorting: false,
      Cell: ({ row, cell }) => (
        <Typography className="pl-10">
          {row.index + 1 > 9 ? row.index + 1 : "0" + (row.index + 1)}
        </Typography>
      ),
    },
    {
      accessorKey: "hallName",
      header: `${t("hall_hallName")}`,
      Cell: ({ row }) => <Typography>{isDefaultLobby(row.original.hallName) ? t(row.original.hallName) : row.original.hallName}</Typography>,
    },
    {
      accessorKey: "scheduleCount",
      header: `${t("hall_hallTotalSessions")}`,
      size: 10,
      // size: 10,
      Cell: ({ row }) => (
        <Typography
          sx={{ fontWeight: "700 !important", textAlign: "center" }}
          color="primary"
        >
          {row.original.scheduleCount}
        </Typography>
      ),
    },
    {
      accessorKey: "hallDescription",
      header: `${t("hall_description")}`,
      // grow: true,
      Cell: ({ row }) => (
        <Typography>{row.original.hallDescription}</Typography>
      ),
    },

  ];

  useEffect(() => {
    (async () => {
      try {
        let _pageIndex = Number(searchParams?.get("page"));
        if (isNaN(_pageIndex) || _pageIndex <= 0) {
          _pageIndex = 1;
        }

        const dataTableLocalConfig = await LocalCache.getItem(
          `dataTableLocalConfigForHall_${user.uuid}`
        );
        const dataTableLocalConfigProcessed = dataTableLocalConfig
          ? dataTableLocalConfig
          : {};
        cachedTableData.current = dataTableLocalConfigProcessed;
        let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
        if (isNaN(_pageSize) || _pageSize < 50) {
          _pageSize = 50;
        }

        dataTableLocalConfigProcessed?.columnOrder &&
          setColumnOrder([
            "slno",
            ...dataTableLocalConfigProcessed.columnOrder.filter(
              (col) => col !== "slno"
            ),
          ]);
        dataTableLocalConfigProcessed?.columnVisibility &&
          setColumnVisibility(dataTableLocalConfigProcessed.columnVisibility);
        dataTableLocalConfigProcessed?.columnPinning &&
          setColumnPinning(dataTableLocalConfigProcessed.columnPinning);

        setPagination({
          pageIndex: _pageIndex - 1,
          pageSize: _pageSize,
        });
        setPageReady(true);
      } catch (error) { }
    })();
  }, []);

  useEffect(() => {
    if (pagination.pageIndex >= 0) {
      const urlSearchParams = new URLSearchParams(searchParams);
      urlSearchParams.set("page", `${pagination.pageIndex + 1}`);
      setSearchParams(urlSearchParams);
      getHallData({ pagination, keyword, sorting });
    }
  }, [pagination, state]);

  useEffect(() => {
    (async () => {
      try {
        if (pagination.pageSize > 0) {
          cachedTableData.current = {
            ...cachedTableData.current,
            pagination: pagination.pageSize,
          };
          await LocalCache.setItem(
            `dataTableLocalConfigForHall_${user.uuid}`,
            cachedTableData.current
          );
        }
      } catch (error) { }
    })();
  }, [pagination.pageSize]);

  useEffect(() => {
    if (pageReady === true) {
      const urlSearchParams = new URLSearchParams(searchParams);
      if (keyword) {
        urlSearchParams.set("keyword", keyword);
      } else {
        urlSearchParams.delete("keyword");
      }

      setSearchParams(urlSearchParams);
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      });
    }
  }, [keyword]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnOrder: columnOrder,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForHall_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) { }
    })();
  }, [columnOrder]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnVisibility: columnVisibility,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForHall_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) { }
    })();
  }, [columnVisibility]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnPinning: columnPinning,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForHall_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) { }
    })();
  }, [columnPinning]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (sorting && sorting.length > 0) {
      urlSearchParams.set("sortColumn", sorting[0].id);
      urlSearchParams.set(
        "sortOrder",
        sorting[0].desc === false ? "asc" : "desc"
      );
    } else {
      urlSearchParams.delete("sortColumn");
      urlSearchParams.delete("sortOrder");
    }
    setSearchParams(urlSearchParams);
    if (pageReady) {
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      });
    }
  }, [sorting]);

  // useEffect(() => {
  //   alert("inital call")
  //   getHallData({ pagination, keyword, sorting });
  // }, [state, keyword]);

  const getHallData = useCallback(
    debounce(async ({ pagination, keyword, sorting }) => {
      setIsLoading(true);
      try {
        const response = await getHallDetailsAPIWithSearch({
          pagination,
          keyword,
          sorting,
          expoId
        });

        setHalls(response?.allHall);
        if (response?.items?.length === 0 && pagination.pageIndex !== 0) {
          setPagination({
            pageIndex: 0,
            pageSize: pagination.pageSize,
          });
        }
        if (response) {
          setTotalPage(response?.totalPages || 0);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);
        throw error;
      }
    }, 300),
    []
  );

  const handleUpdate = async (id: any) => {
    navigate(`edit-hall/${id}`);
  };

  const handleDelete = async (id: any) => {
    try {
      const res = await BulkDeleteHallAPI([id]);
      if (res.statusCode === 200) {
        dispatch(showMessage({ message: "Hall deleted", variant: "success" }));
        getHallData({ pagination, keyword, sorting });
      }
    } catch (error) {
      const errorMesssage = error?.response?.data?.message;
      if (errorMesssage) {
        dispatch(
          showMessage({ message: `${errorMesssage}`, variant: "error" })
        );
      }
    }
  };

  return (
    <>
      <GlobalStyles
        styles={() => ({
          "#root": {
            maxHeight: "100vh",
          },
          "& .MuiTableCell-root": {
            fontSize: "12px !important",
            fontWeight: "600 !important",
            // color: "text.primary",
          },
          "& .MuiTableCell-root .MuiTypography-root": {
            fontSize: "13px !important",
            fontWeight: "400 !important",
            // color: "text.primary",
          },
        })}
      />
      <Paper
        className=" overflow-auto w-full h-full"
        elevation={0}
        sx={{
          border: "none",
          margin: "0",
          boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
          padding: "0",
        }}
      >
        <DataTable
          data={halls}
          columns={columns}
          manualPagination={true}
          enableColumnDragging={true}
          enableRowSelection={false}
          // enableBottomToolbar= {true}
          state={{
            pagination,
            columnOrder,
            columnVisibility,
            columnPinning,
            sorting,
            showProgressBars: isLoading,
          }}
          onPaginationChange={setPagination}
          rowCount={pagination.pageSize}
          pageCount={totalPages}
          renderRowActions={({ row }) => (
            <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
              {/* {rules?.editRole?.permission && */}
              <IconButton
                onClick={(event) => handleUpdate(row.original.id)}
                disabled={row.original.areIsDefault === 1}
              >
                <FuseSvgIcon
                  className={`text-48 ${row.original.areIsDefault === 1 ? " text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}
                  size={20}
                  color="primary"
                >
                  feather:edit
                </FuseSvgIcon>
              </IconButton>
              {/* // } */}
              {/* {rules?.deleteRole?.permission && ( */}
              <IconButton
                onClick={
                  row.original.areIsDefault === 1
                    ? null
                    : async (event) => {
                      try {
                        // Call the API to check if sessions exist
                        const response = await GetScheduleAPI({ expId:expoId, hallid:row.original.id}); // Replace with your actual API call

                        if (response.data.allSchedules.length>0) {
                          // If sessions exist, show a warning or block delete
                          dispatch(
                            showMessage({
                              message:t('hall_canot_deleteMessage'),
                              variant: "warning",
                            })
                          );
                        } else {
                          // If no sessions exist, open the delete confirmation dialog
                          dispatch(
                            openDialog({
                              children: (
                                <OnionConfirmBox
                                  confirmButtonLabel={t("common_delete")}
                                  cancelButtonLabel={t("common_cancel")}
                                  variant="warning"
                                  title={t("hall_deletehall_confirmTitle")}
                                  subTitle={t("hall_deletehall_confirmMessage")}
                                  onCancel={() => dispatch(closeDialog())}
                                  onConfirm={() => {
                                    handleDelete(row.original.id);
                                    dispatch(closeDialog());
                                  }}
                                />
                              ),
                            })
                          );
                        }
                      } catch (error) {
                        console.error("Error checking sessions:", error);
                        // Handle API errors (e.g., show a notification)
                      }
                    }
                }
                disabled={row.original.areIsDefault === 1}
              >

                <FuseSvgIcon
                  className={`text-48 ${row.original.areIsDefault === 1 ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}
                  size={20}
                  color="primary"
                >
                  feather:trash
                </FuseSvgIcon>
              </IconButton>
              {/* // )} */}
            </Box>
          )}
          renderTopToolbarCustomActions={({ table }) => {
            const { rowSelection } = table.getState();

            if (Object.keys(rowSelection).length === 0) {
              return null;
            }
          }}
          enableColumnOrdering={true}
          enableColumnPinning={true}
          onColumnOrderChange={setColumnOrder}
          onColumnVisibilityChange={setColumnVisibility}
          onColumnPinningChange={setColumnPinning}
          onSortingChange={setSorting}
        />
      </Paper>
    </>
  );
}

export default HallTable;
