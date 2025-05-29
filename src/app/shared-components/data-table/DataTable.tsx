import {
  MaterialReactTable,
  useMaterialReactTable,
  MaterialReactTableProps,
  MRT_Icons,
} from "material-react-table";
import _ from "@lodash";
import { useMemo } from "react";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Theme } from "@mui/material/styles/createTheme";
import DataTableTopToolbar from "./DataTableTopToolbar";
import { useTranslation } from "react-i18next";
import { theme } from "tailwind.config";

const tableIcons: Partial<MRT_Icons> = {
  ArrowDownwardIcon: (props) => (
    <FuseSvgIcon size={20} {...props}>
      material-outline:expand_more
    </FuseSvgIcon>
  ),
  ClearAllIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:menu-alt-3</FuseSvgIcon>
  ), // Adjusted, closest match
  DensityLargeIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:menu-alt-4</FuseSvgIcon>
  ), // Adjusted, closest match
  DensityMediumIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:menu</FuseSvgIcon>
  ), // Adjusted, closest match
  DensitySmallIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:view-list</FuseSvgIcon>
  ), // Adjusted, closest match
  DragHandleIcon: () => (
    <FuseSvgIcon className="rotate-45" size={16}>
      heroicons-outline:arrows-expand
    </FuseSvgIcon>
  ), // Adjusted, closest match
  FilterListIcon: (props) => (
    <FuseSvgIcon size={16} {...props}>
      heroicons-outline:filter
    </FuseSvgIcon>
  ),
  FilterListOffIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:filter</FuseSvgIcon>
  ), // Heroicons may not have a direct match for "off" state; consider custom handling
  FullscreenExitIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:arrows-expand</FuseSvgIcon>
  ), // Adjusted, closest match
  FullscreenIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:arrows-expand</FuseSvgIcon>
  ),
  SearchIcon: (props) => (
    <FuseSvgIcon color="action" size={20} {...props}>
      heroicons-outline:search
    </FuseSvgIcon>
  ),
  SearchOffIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:search</FuseSvgIcon>
  ), // Heroicons may not have a direct match for "off" state; consider custom handling
  ViewColumnIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:dots-vertical</FuseSvgIcon>
  ),
  MoreVertIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:dots-vertical</FuseSvgIcon>
  ),
  MoreHorizIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:dots-horizontal</FuseSvgIcon>
  ),
  SortIcon: (props) => (
    <FuseSvgIcon size={20} {...props}>
      heroicons-outline:sort-ascending
    </FuseSvgIcon>
  ), // Adjusted, closest match
  PushPinIcon: (props) => (
    <FuseSvgIcon size={20} {...props}>
      heroicons-solid:download
    </FuseSvgIcon>
  ), // Adjusted, closest match
  VisibilityOffIcon: () => (
    <FuseSvgIcon size={20}>heroicons-outline:eye-off</FuseSvgIcon>
  ),
};

function DataTable<TData>(
  props: MaterialReactTableProps<TData> & {
    setPagination?: (manualPagination: any) => void;
    // pagination?: Record<string, any>;
    // pageCount?: Record<string, any>;
    // columnOrder?: Record<string, any>;
    // columnPinning?: Record<string, any>;
    // state?: Record<string, any>;
  }
) {
  const { columns, data, ...rest } = props;

  const defaults = useMemo(
    () =>
      _.defaults(rest, {
        initialState: {
          density: "comfortable",
          showColumnFilters: false,
          showGlobalFilter: true,
          columnPinning: {
            left: ['mrt-row-expand', 'mrt-row-select'],
            right: ['mrt-row-actions']
          },
          pagination: {
            pageSize: 50
          },
          enableFullScreenToggle: false,
          showProgressBars: true
        },
        layoutMode: "semantic",
        enableRowSelection: true,
        enableFullScreenToggle: false,
        enableGrouping: false,
        enableColumnPinning: false,
        enableFacetedValues: false,
        enableRowActions: true,
        enableColumnFilters: false,
        enableColumnDragging: true,
        enableColumnActions: false,
        enableColumnOrdering: false,
        enableColumnFilterModes: false,
        enableDensityToggle: false,
        enableBatchRowSelection: true,
        displayColumnDefOptions: { 'mrt-row-actions': { size: 10 } },
        muiBottomToolbarProps: {
          className: "flex items-center min-h-56 h-56",
        },
        muiTablePaperProps: {
          elevation: 5,
          square: true,
          className: "flex flex-col flex-auto h-full rounded-none",
        },
        muiTableContainerProps: {
          className: "flex-auto",
        },
        enableStickyHeader: true,
        paginationDisplayMode: "pages",
        positionToolbarAlertBanner: "top",
        muiPaginationProps: {
          color: "secondary",
          rowsPerPageOptions: [50, 75, 100],
          shape: "rounded",
          variant: "text",
          showRowsPerPage: true,
          value: 50,
        },
        muiSearchTextFieldProps: {
          placeholder: "Search",
          sx: { minWidth: "300px" },
          variant: "outlined",
          size: "small",
        },
        muiFilterTextFieldProps: {
          variant: "outlined",
          size: "small",
          sx: {
            "& .MuiInputBase-root": {
              padding: "0px 8px",
              height: "32px!important",
              minHeight: "32px!important",
            },
          },
        },
        muiColumnDragHandleProps: {
          className: "inset-0 opacity-0"
        },
        muiSelectAllCheckboxProps: {
          className: "w-32 h-32 ms-8",
        },
        muiSelectCheckboxProps: {
          className: "w-32 h-32 ms-8",
        },
        muiLinearProgressProps: ({ }) => {
          return {
            sx: {
              backgroundColor: "secondary.main",
            }
          }
        },
        muiTableBodyRowProps: ({ row, table }) => {
          const { density } = table.getState();

          if (density === "compact") {
            return {
              sx: {
                backgroundColor: "initial",
                boxShadow: "none",
                height: row.getIsPinned() ? `${37}px` : undefined
              },
            };
          }
          return {
            sx: {
              "& .MuiTableCell-root": {
                borderBottom: "none",
              },
              "&:hover td:after": {
                backgroundColor: 'none !important',
              },
              backgroundColor: row.getIsPinned() ? '#ffffff' : "background.paper",
              // opacity: 1,
              boxShadow: "none",
              // Set a fixed height for pinned rows
              height: row.getIsPinned()
                ? `${density === "comfortable" ? 53 : 69}px`
                : undefined,
            },
          };
        },
        muiTableHeadCellProps: ({ column }) => ({
          sx: {
            paddingTop: 1.5,
            paddingBottom: 1.5,
            "& .Mui-TableHeadCell-Content-Labels": {
              flex: 1,
              width: "auto",
            },
            "&.MuiTableCell-root": {
              verticalAlign: "middle"
            },
            "& .Mui-TableHeadCell-Content-Actions": {},
            "& .MuiFormHelperText-root": {
              textAlign: "center",
              marginX: 0,
              color: (theme: Theme) => theme.palette.text.disabled,
              fontSize: 11
            },
            backgroundColor: (theme) =>
              column.getIsPinned() ? theme.palette.background.paper : "inherit"
          },

        }),
        mrtTheme: (theme) => ({
          baseBackgroundColor: theme.palette.background.paper,
          menuBackgroundColor: theme.palette.background.paper,
          pinnedRowBackgroundColor: theme.palette.background.paper,
          pinnedColumnBackgroundColor: theme.palette.background.paper
        }),
        renderTopToolbar: (_props) => <DataTableTopToolbar {..._props} />,
        icons: tableIcons,
      } as Partial<MaterialReactTableProps<TData>>),
    [rest]
  );

  const { t } = useTranslation();
  const localization = {
    "actions": t("common_actions"),
    "rowsPerPage": t("common_rowsPerPage"),
    "noRecordsToDisplay": t("noRecordsFound"),
    "clearSelection": t("clearSelection"),
    "toggleSelectAll": t("toggleSelectAll"),
    "clearSort": t("clearSort"),
    "of": t("of"),
    "or": t("or"),
    "pin": t("pin"),
    "pinToLeft": t("pinToLeft"),
    "pinToRight": t("pinToRight"),
    "unpin": t("unpin"),
    "unpinAll": t("unpinAll"),
    "showAll": t("showAll"),
    "showAllColumns": t("showAllColumns"),
    "selectedCountOfRowCountRowsSelected": t('selectedCountOfRowCountRowsSelected'),
    "sortByColumnAsc": t("sortByColumnAsc"),
    "sortByColumnDesc": t("sortByColumnDesc"),
    "sortedByColumnAsc": t("sortedByColumnAsc"),
    "sortedByColumnDesc": t("sortedByColumnDesc"),
    "hideColumn": t("hideColumn"),
    "hideAll": t("hideAll"),
    "dropToGroupBy": t("dropToGroupBy"),
    "toggleDensity": t("toggleDensity"),
    "showHideColumns": t("showHideColumns")
  };
  const table = useMaterialReactTable<TData>({
    columns,
    data,
    manualSorting: true,
    getRowId: (row: any) => row._id,
    localization,
    ...defaults,
    ...rest,
  });

  return <MaterialReactTable table={table} />;
}

export default DataTable;
