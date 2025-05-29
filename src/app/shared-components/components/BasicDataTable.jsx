import { useMemo } from "react";
import { Box, Button } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
// import { data } from './makeData';


export const data = [
  {
    sessions: "Session1",
    timeSlot: "09-10 AM",
    speakers: "Sam Lewis",
    halls: "Hall A",
    speakersLink: "Copy Link",
    participantLink: "Copy Link",
    backstageLink: "Copy Link",
  },
  {
    sessions: "Session2",
    timeSlot: "09-10 AM",
    speakers: "Sam Lewis",
    halls: "Hall A",
    speakersLink: "Copy Link",
    participantLink: "Copy Link",
    backstageLink: "Copy Link",
  },
  {
    sessions: "Session3",
    timeSlot: "09-10 AM",
    speakers: "Sam Lewis",
    halls: "Hall A",
    speakersLink: "Copy Link",
    participantLink: "Copy Link",
    backstageLink: "Copy Link",
  },
  {
    sessions: "Session4",
    timeSlot: "09-10 AM",
    speakers: "Sam Lewis",
    halls: "Hall A",
    speakersLink: "Copy Link",
    participantLink: "Copy Link",
    backstageLink: "Copy Link",
  },
];

const BasicDataTable = () => {


  const columns = useMemo(
    //column definitions...
    () => [
      {
        accessorKey: "sessions",
        header: "Sessions",
        size: 50,
      },
      {
        accessorKey: "timeSlot",
        header: "Timeslot",
        size: 50,
      },
      {
        accessorKey: "speakers",
        header: "Speakers",
        size: 50,
        // grow: true,
        // size: 300,
      },
      {
        accessorKey: "halls",
        header: "Halls",
        size: 50,
      },
      {
        accessorKey: "speakersLink",
        header: "Speakers link",
        size: 50,
      },
      {
        accessorKey: "participantLink",
        header: "participant link",
        size: 50,
      },
      {
        accessorKey: "backstageLink",
        header: "Backstage link",
        size: 50,
      },
    ],
    []
    //end
  );

  const table = useMaterialReactTable({
    columns,
    data,

    enableColumnActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: true,


    defaultDisplayColumn: {
      enableResizing: true, //turn on some features that are usually off for all display columns
    },

    // displayColumnDefOptions: {
    //   'mrt-row-actions': {
    //     size: 100, //set custom width

    //     muiTableHeadCellProps: {
    //       align: 'center', //change head cell props
    //     },
    //   },
    //   'mrt-row-numbers': {
    //     enableColumnDragging: true,
    //     enableColumnOrdering: true, //turn on some features that are usually off
    //     enableResizing: true,
    //     muiTableHeadCellProps: {
    //       sx: {
    //         fontSize: '1.2rem',
    //         color: 'red !important',
    //       },
    //     },
    //   },
    //   'mrt-row-select': {
    //     enableColumnActions: true,
    //     enableHiding: true,
    //     size: 100,
    //   },
    // },

    mrtTheme: (theme) => ({
      baseBackgroundColor: theme.palette.background.paper,
    }),
    muiTableBodyRowProps: { hover: false },

    muiTableProps: {
      sx: {
        // border: '1px solid rgba(81, 81, 81, .5)',
        // caption: {
        //   captionSide: 'top',
        // },
      },
    },
    muiTableContainerProps: {
      sx: {
        minHeight: "320px",
        height: "100%",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        // border: '1px solid rgba(81, 81, 81, .5)',
        fontWeight: "500",
        color: "text.primary",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        // border: '1px solid rgba(81, 81, 81, .5)',
        // color: 'red',
        color: "text.primary",
      },
    },
    muiBottomToolbarProps: {
      sx: {
        padding: "20px",
        boxShadow: "none !important",
      },
    },

    enableColumnResizing: false,
    enableColumnOrdering: false,
    enableRowNumbers: false,
    enableRowSelection: false,
    enableRowActions: false,
    // renderRowActions: ({ row }) => (
    //   <Box sx={{ display: "flex", gap: "1rem" }}>
    //       1
    //   </Box>
    // ),
  });

  return (
    <Box
      sx={{
        "& .MuiPaper-root": {
          border: "none",
          margin: "0",
          boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
          // backgroundColor: '#f5f5f5',
          padding: "10px",
        },
      }}
    >
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default BasicDataTable;
