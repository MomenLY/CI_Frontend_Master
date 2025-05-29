import { Box, GlobalStyles, IconButton, Paper, Typography } from '@mui/material';
import DataTable from 'app/shared-components/data-table/DataTable';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { debounce, size } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { useSearchParams } from 'react-router-dom';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import LocalCache from 'src/utils/localCache';
import { useSchedulesSelector } from './SchedulesSlice';
import { getScheduleDetailsAPI } from './apis/Get-Schedules-Api';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { ScheduleDeleteAPI } from './apis/Delete-Schedule-Api';
import { differenceInMinutes, format } from 'date-fns';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import FuseLoading from '@fuse/core/FuseLoading';
import OnionNotFound from 'app/shared-components/components/OnionNotFound';
import { isDefaultLobby } from 'src/utils/common';
import { getTimeZoneSettings } from 'src/utils/getSettings';
import { scheduleDateFormat, scheduleTimeFormat } from 'src/utils/dateformatter';

type Props = {
  keyword?: string;
  setKeyword?: (data: string) => void;
  // expoId: string;
};

interface Expo {
  id: string;
  expName: string;
  expImage: string;
  expDescription: string;
  expStartDate: string;
  expCreator: string;
  expEndDate: string;
  expType: string;
}

function SchedulesTable({ keyword, setKeyword }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation('schedules');
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const state = useSchedulesSelector((state) => state.state.value);
  const [pageReady, setPageReady] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    pageIndex: -1,
    pageSize: 10,
  });
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({
    left: ["mrt-row-expand", "mrt-row-select"],
    right: ["mrt-row-actions"],
  });
  const [columnVisibility, setColumnVisibility] = useState({});
  const [timeZone, setTimZone] = useState();

  const sortInitialState = [];
  const _sortBy = searchParams?.get("sortBy");
  const _orderBy = searchParams?.get("orderBy");
  if (_sortBy && _orderBy) {
    sortInitialState.push({
      id: _sortBy,
      desc: _orderBy == "desc",
    });
  }
  const routeParams = useParams();
  const [sorting, setSorting] = useState(sortInitialState);
  const cachedTableData = useRef(null);
  const [expoDetails, setExpoDetails] = useState<Expo | null>(null);
  const [schedules, setSchedules] = useState([]);
  const [noData, setNoData] = useState(false);
  let expoId = routeParams.id;

  const baseColumns = [
    {
      accessorKey: "schName",
      header: `${t("schedules_sessions")}`,
      size: 150,
      Cell: ({ row }) => <Typography>{row.original.schName}</Typography>,
    },
    {
      accessorKey: "speakers",
      header: `${t("schedules_speakers")}`,
      Cell: ({ row }) => <Typography>{row.original.speakers}</Typography>,
    },
    {
      accessorKey: "schStartDateTime",
      header: `${t("schedules_startDate")}`,
      Cell: ({ row }) => {
        const { schStartDateTime } = row.original;

        if (!schStartDateTime) {
          return null;
        }

        let formattedStartDate = format(
          new Date(schStartDateTime),
          "dd/MM/yyyy"
        );

        return <Typography>{formattedStartDate}</Typography>;
      },
    },
    {
      accessorKey: "schStartTime",
      header: `${t("schedules_startTime")}`,
      width: "500px",
      Cell: ({ row }) => {
        const { schStartDateTime } = row.original;

        if (!schStartDateTime) {
          return null;
        }

        let formattedStartTime = format(
          new Date(schStartDateTime),
          "hh:mm a"
        )

        return <Typography>{formattedStartTime}</Typography>;
      },
    },
    {
      accessorKey: "schDuration",
      header: `${t("schedules_duration")}`,
      Cell: ({ row }) => {
        const { schStartDateTime, schEndDateTime } = row.original;

        if (!schStartDateTime || !schEndDateTime) {
          return null;
        }

        let startDate = new Date(schStartDateTime);
        let endDate = new Date(schEndDateTime);
        let durationInMinutes = differenceInMinutes(endDate, startDate);

        let formattedDuration = `${Math.floor(durationInMinutes / 60)}h ${durationInMinutes % 60}m`;

        return <Typography>{formattedDuration}</Typography>;
      },
    },
    {
      accessorKey: "hallName",
      header: `${t("schedules_halls")}`,
      Cell: ({ row }) => <Typography>{row.original.hallName === 'defaultLobby' ? t('defaultLobby') : row.original.hallName}</Typography>,
    },
    {
      accessorKey: "schType",
      header: `${t("schedule_type_title")}`,
      size: 150,
      Cell: ({ row }) => <Typography>{row.original.schType}</Typography>,
    }
  ];

  const onlineColumns = [
    {
      accessorKey: "schSpeakerLink",
      header: `${t("schedules_speakersLink")}`,
      Cell: ({ row }) => (
        <Typography>{row.original.schType === 'Video Conference' ? row.original.schSpeakerLink : ''}</Typography>
      ),
    },
    {
      accessorKey: "schParticipantLink",
      header: `${t("schedules_participantLink")}`,
      Cell: ({ row }) => (
        <Typography>{row.original.schType === 'Video Conference' ? row.original.schParticipantLink : ''}</Typography>
      ),
    },
    {
      accessorKey: "schBackstageLink",
      header: `${t("schedules_backStageLink")}`,
      Cell: ({ row }) => (
        <Typography>{row.original.schType === 'Video Conference' ? row.original.schBackStageLink : ''}</Typography>
      ),
    },
    {
      accessorKey: "schStreamingLink",
      header: `${t("schedule_streamingLink_title")}`,
      Cell: ({ row }) => (
        <Typography>{row.original.schType === 'Streaming' ? row.original.schStreamingLink : ''}</Typography>
      ),
    }
  ];

  const columns =
    (expoDetails?.expType === "Online" || expoDetails?.expType === 'Hybrid')
      ? [...baseColumns, ...onlineColumns]
      : baseColumns;

  useEffect(() => {
    (async () => {
      try {
        let _pageIndex = Number(searchParams?.get("page"));
        if (isNaN(_pageIndex) || _pageIndex <= 0) {
          _pageIndex = 1;
        }

        const dataTableLocalConfig = await LocalCache.getItem(
          `dataTableLocalConfigForSchedule_${user.uuid}`
        );
        const dataTableLocalConfigProcessed = dataTableLocalConfig
          ? dataTableLocalConfig
          : {};
        cachedTableData.current = dataTableLocalConfigProcessed;
        let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
        if (isNaN(_pageSize) || _pageSize < 50) {
          _pageSize = 10;
        }
        dataTableLocalConfigProcessed?.columnOrder &&
          setColumnOrder(dataTableLocalConfigProcessed.columnOrder);
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
      getScheduleData({ pagination, keyword, sorting });
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
            `dataTableLocalConfigForSchedule_${user.uuid}`,
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
      const delayDebounceExpoSearch = setTimeout(() => {
        setSearchParams(urlSearchParams);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      }, 500);
      return () => clearTimeout(delayDebounceExpoSearch);
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
          `dataTableLocalConfigForSchedule_${user.uuid}`,
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
          `dataTableLocalConfigForSchedule_${user.uuid}`,
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
          `dataTableLocalConfigForSchedule_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) { }
    })();
  }, [columnPinning]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (sorting && sorting.length > 0) {
      urlSearchParams.set("sortBy", sorting[0].id);
      urlSearchParams.set(
        "orderBy",
        sorting[0].desc === false ? "ASC" : "DESC"
      );
    } else {
      urlSearchParams.delete("sortBy");
      urlSearchParams.delete("orderBy");
    }
    setSearchParams(urlSearchParams);
    if (pageReady) {
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      });
    }
  }, [sorting]);

  useEffect(() => {
    getExpoDetails();
  }, []);

  const getExpoDetails = async () => {
    const expoDetails = await LocalCache.getItem(
      cacheIndex.expoDetails + "_" + routeParams.id,
      getSingleExpoAPI.bind(this, routeParams.id)
    );
    const timeZone = await getTimeZoneSettings();
    setTimZone(timeZone);
    setExpoDetails(expoDetails.data.expo);
  };

  const getScheduleData = useCallback(
    debounce(async ({ pagination, keyword, sorting }) => {
      try {
        setIsLoading(true);
        const response = await getScheduleDetailsAPI({
          pagination,
          keyword,
          sorting,
          expoId,
        });
        // if(response.allSchedules.length === 0 ){
        //   setIsLoading(false);
        //   setNoData(true);
        // }else {
        setSchedules(response.allSchedules);
        setTotalPage(response.totalPages || 0);
        setIsLoading(false);
        // }
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    }, 300),
    []
  );

  const handleUpdate = (id: string) => {
    navigate(`edit/${id}`, { state: { expoId } });
  };

  const handleDelete = async (id: string) => {
    const response = await ScheduleDeleteAPI(id, expoDetails.id);
    if (response?.statusCode === 200) {
      await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + routeParams.id)
      dispatch(
        showMessage({
          message: t("schedules_deleteConfirmMessage"),
          variant: "success",
        })
      );
      getScheduleData({ pagination, keyword, sorting });
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
          data={schedules}
          columns={columns}
          manualPagination={true}
          enableColumnDragging={true}
          enableRowSelection={false}
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
                disabled={row.original.isDefault === 1}
              >
                <FuseSvgIcon
                  className={`text-48 ${row.original.isDefault === 1 ? " cursor-not-allowed" : "cursor-pointer"}`}
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
                    : (event) => {
                      dispatch(
                        openDialog({
                          children: (
                            <OnionConfirmBox
                              confirmButtonLabel={t("common_delete")}
                              cancelButtonLabel={t("common_cancel")}
                              variant="warning"
                              title={t(
                                "schedule_deleteSchedule_confirmTitle"
                              )}
                              subTitle={t(
                                "schedule_deleteSchedule_confirmMessage"
                              )}
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
                }
                disabled={row.original.isDefault === 1}
              >
                <FuseSvgIcon
                  className={`text-48 ${row.original.isDefault === 1 ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}`}
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
          enableColumnPinning={false}
          onColumnOrderChange={setColumnOrder}
          onColumnVisibilityChange={setColumnVisibility}
          onColumnPinningChange={setColumnPinning}
          onSortingChange={setSorting}
        />
      </Paper>

    </>
  );
}

export default SchedulesTable;
