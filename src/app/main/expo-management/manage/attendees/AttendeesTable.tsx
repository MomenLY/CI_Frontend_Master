import { Box, Button, GlobalStyles, Paper, Typography } from "@mui/material";
import DataTable from "app/shared-components/data-table/DataTable";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { selectUser, setUser } from "src/app/auth/user/store/userSlice";
import { useSearchParams } from "react-router-dom";
import LocalCache from "src/utils/localCache";
import { custom, z } from "zod";
import { getAttendeeDetailsAPI } from "./apis/Get-Attendees-Api";
import { useAttendeesSelector } from "./AttendeesSlice";
import { useExpoSelector } from "../../ExpoManagementSlice";
import OnionNotFound from "app/shared-components/components/OnionNotFound";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { getSingleExpoAPI } from "app/shared-components/cache/cacheCallbacks";
import { GetFieldsAPI } from "app/shared-components/onion-custom-fields/apis/Get-Fields-Api";
import { generateExcelReport } from "./apis/generateExcelReport";
import FuseLoading from "@fuse/core/FuseLoading";
import moment from "moment";
import { log } from "console";
import { customFileUrl } from "src/utils/urlHelper";

type Props = {
  keyword?: string;
  setKeyword?: (data: string) => void;
  triggerDownload: boolean;
  setTriggerDownload: () => boolean;
  refresh?: boolean;
};

const defaultValues = {
  password: "",
  shouldSendEmail: true,
};

const schema = z.object({
  password: z.string().nonempty("Please enter your password."),
  shouldSendEmail: z.boolean(),
});

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

function AttendeesTable({
  keyword,
  setKeyword,
  triggerDownload,
  setTriggerDownload,
  refresh
}) {
  const navigate = useNavigate();
  const { t } = useTranslation('attendees');
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const state = useAttendeesSelector((state) => state.state.value);
  const routeParams = useParams();
  const [pageReady, setPageReady] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    pageIndex: -1,
    pageSize: 50,
  });
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({
    left: ["mrt-row-expand", "mrt-row-select"],
    right: ["mrt-row-actions"],
  });

  const [expoDetails, setExpoDetails] = useState<Expo | null>(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const sortInitialState = [];
  const _sortBy = searchParams?.get("sortBy");
  const _orderBy = searchParams?.get("orderBy");
  if (_sortBy && _orderBy) {
    sortInitialState.push({
      id: _sortBy,
      desc: _orderBy == "desc",
    });
  }
  const [sorting, setSorting] = useState(sortInitialState);
  const [customFields, setColumFields] = useState({});

  const cachedTableData = useRef(null);

  const defaultColumns = [
    {
      accessorKey: "slno",
      header: t('attendees_slNo'),
      id: "slno",
      options: {
        display: false,
      },
      enableSorting: false,
      Cell: ({ row }) => (
        <Typography className="pl-8">{row.index + 1}</Typography>
      ),
    },
    {
      accessorKey: "Name",
      header: t("attendees_name"),
      id: "Name",
      Cell: ({ row }) => <Typography>{row.original.name}</Typography>,
    },
    {
      accessorKey: "Email",
      header: t("attendees_email"),
      id: "Email",
      Cell: ({ row }) => <Typography>{row.original.email}</Typography>,
    },
    {
      accessorKey: "Device Info",
      header: t("deviceInfo"),
      id: "Device Info",
      Cell: ({ row }) => <Typography>{row.original.attDeviceInfo}</Typography>,
    },
    {
      accessorKey: "Attendance Status",
      header: t("attendees_attendenceStatus"),
      id: "attendanceStatus",
      Cell: ({ row }) => (
        <Typography>
          {row.original.attendanceStatus ? <img
            className="h-24 w-24"
            src={"assets/icons/tick-icon.png"}
            alt=""
          /> : "-"}
        </Typography>
      ),
    },
  ];

  const [columns, setColumns] = useState(defaultColumns);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  useEffect(() => {
    if (triggerDownload) {
      handleDownload();
      setTriggerDownload(false);
    }
  }, [triggerDownload]);

  useEffect(() => {
    (async () => {
      try {
        let _pageIndex = Number(searchParams?.get("page"));
        if (isNaN(_pageIndex) || _pageIndex <= 0) {
          _pageIndex = 1;
        }

        const dataTableLocalConfig = await LocalCache.getItem(
          `dataTableLocalConfigForAttendee_${user.uuid}`
        );
        const dataTableLocalConfigProcessed = dataTableLocalConfig
          ? dataTableLocalConfig
          : {};
        cachedTableData.current = dataTableLocalConfigProcessed;
        let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
        if (isNaN(_pageSize)) {
          _pageSize = 50;
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
      getAttendeesData({ pagination, keyword, sorting });
    }
  }, [pagination, state, refresh]);

  useEffect(() => {
    (async () => {
      try {
        if (pagination.pageSize > 0) {
          cachedTableData.current = {
            ...cachedTableData.current,
            pagination: pagination.pageSize,
          };
          await LocalCache.setItem(
            `dataTableLocalConfigForAttendee_${user.uuid}`,
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
          columnVisibility: columnVisibility,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForAttendee_${user.uuid}`,
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
          `dataTableLocalConfigForAttendee_${user.uuid}`,
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

  const getAttendeesData = useCallback(
    debounce(async ({ pagination, keyword, sorting }) => {
      setIsLoading(true);
      try {
        const expoId = routeParams.id;
        const response = await getAttendeeDetailsAPI({
          pagination,
          keyword,
          sorting,
          expoId,
        });

        const _responseArr = response?.data?.map((ele, ind) => {
          return { ...ele.epUserDetails, ...users[ind] };
        });

        if (response?.data?.length > 0) {
          const res = response.data.map((data, ind) => {
            const attendee = {
              attendanceStatus: data?.epAttendance || false,
              paymentDetails: "Completed",
              attDeviceInfo: data?.attDeviceInfo ? data?.attDeviceInfo['os'] : ''
            };

            Object.keys(data.epUserDetails).forEach((fieldId) => {
              if (customFields[fieldId]) {
                const value = data.epUserDetails[fieldId];

                if (value) {
                  attendee[fieldId] = value || "";
                }
              }
            });

            return { ...attendee, ..._responseArr[ind] };
          });
          setUsers(res);
          setTotalPage(response.totalPage);
        } else {
          setUsers([]);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);
        throw error;
      }
    }, 300),
    [customFields]
  );

  const renderCustomFieldByType = (row, field) => {
    switch (field.pFType) {
      case 'date':
        return row.original[field.pFColumName] ? moment(row.original[field.pFColumName]).format("YYYY-MM-DD") : "-";
      case 'time':
        return row.original[field.pFColumName] ? moment(row.original[field.pFColumName]).format("HH:mm") : "-";
      case 'datetime':
        return row.original[field.pFColumName] ? moment(row.original[field.pFColumName]).format("YYYY-MM-DD HH:mm") : "-";
      case 'file':
        return row.original[field.pFColumName] ? <a target="_blank" className="!bg-transparent !text-[#4f46e5] !underline !decoration-1 !border-b-0" href={customFileUrl(row.original[field.pFColumName])}>{row.original[field.pFColumName]}</a> : "-";
      default:
        return row.original[field.pFColumName] ? row.original[field.pFColumName] : "-";
    }
  }

  const fetchCustomFields = async () => {
    try {
      const response = await GetFieldsAPI({
        data: "profile-fields",
        type: `expo_${routeParams.id}`,
      });

      if (response && response.data) {
        const customFieldsData = response?.data?.data;

        const _customFieldsData = {};
        customFieldsData.forEach((field) => {
          _customFieldsData[field.pFColumName] = field;
        });

        setColumFields(_customFieldsData);

        const defaultColumnLabels = new Set(
          defaultColumns.map((col) => col.header.toLowerCase())
        );

        const customColumns = customFieldsData
          .filter(
            (field) => !defaultColumnLabels.has(field.pFLabel.toLowerCase())
          )
          .map((field) => {
            return {
              accessorKey: field.pFLabel,
              header: field.pFLabel,
              id: field.pFColumName,
              Cell: ({ row }) => (
                <Typography>
                  {renderCustomFieldByType(row, field)}
                </Typography>
              ),
            };
          });

        setColumns([...defaultColumns, ...customColumns]);
      }
    } catch (error) {
      console.error("Error fetching custom fields:", error);
    }
  };

  const handleDownload = async () => {
    const headers = columns
      .filter((column) => column.accessorKey !== "slno")
      .reduce((acc, column) => {
        const customField = customFields[column.id];
        const key = customField?.pFLabel || column.accessorKey;
        const value = customField?.pFColumName || column.accessorKey;
        acc[key] = value;
        return acc;
      }, {});

    try {
      const customFieldUrl = customFileUrl("")
      const response = await generateExcelReport(headers, routeParams.id, customFieldUrl);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendees.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating Excel file:", error);
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
          },
          "& .MuiTableCell-root .MuiTypography-root": {
            fontSize: "13px !important",
            fontWeight: "400 !important",
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
          data={users}
          columns={defaultColumns}
          manualPagination={true}
          enableColumnFilters={false}
          enableRowSelection={false}
          enableColumnActions={false}
          pageCount={totalPages}
          rowCount={pagination.pageSize}
          enableRowActions={false}
          state={{
            pagination,
            columnOrder,
            columnVisibility,
            columnPinning,
            sorting,
            showProgressBars: isLoading,
          }}
          renderTopToolbarCustomActions={({ table }) => {
            const { rowSelection } = table.getState();

            if (Object.keys(rowSelection).length === 0) {
              return null;
            }
          }}
          onPaginationChange={setPagination}
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

export default AttendeesTable;
