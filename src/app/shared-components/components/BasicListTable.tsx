import * as React from "react";
import { makeStyles } from "@mui/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { useTheme } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
  tableHead: {
    fontWeight: "600",
    fontSize: "12px",
    color: theme.palette.text.primary,
    padding: '12px',
  },
  link: {
    color: `${theme.palette.primary.main} !important` ,
    textDecoration: "none !important",
    fontWeight: "600",
    fontSize: "12px",
  },
  tableBody: {
    fontWeight: "400",
    fontSize: "14px !important",
    color: theme.palette.text.primary,
    padding: '14px',
  },
}));


export default function BasicListTable({key, session, duration, timeSlot, speakers}) {
  const theme = useTheme();
  const classes = useStyles(theme);

  return (
    <>
      <TableContainer component={Paper} className="border-0 shadow-0 rounded-0 mx-[-15px]">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow         
            // sx={{ "&:first-child th, &:last-child th": { paddingX: 0 } }}
            >
              <TableCell className={classes.tableHead}>Timeslot</TableCell>
              <TableCell className={classes.tableHead} align="left">
                Duration
              </TableCell>
              <TableCell className={classes.tableHead} align="left">
                Sessions
              </TableCell>
              <TableCell className={classes.tableHead} align="left">
                Speakers
              </TableCell>
              <TableCell className={classes.tableHead} align="left">
                Speakers Link
              </TableCell>
              <TableCell className={classes.tableHead} align="left">
                Participant Link
              </TableCell>
              <TableCell className={classes.tableHead} align="left">
                Backstage Link
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
              <TableRow 
                key={key}
                // sx={{ "& td, & th": { border: 0, paddingX: 0 } }}
                // sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" className={classes.tableBody} sx={{}} scope="row">
                  {timeSlot}
                </TableCell>
                <TableCell align="left" className={classes.tableBody} >{duration}</TableCell>
                <TableCell align="left" className={classes.tableBody} >Session {session}</TableCell>
                <TableCell align="left" className={classes.tableBody} >{speakers}</TableCell>
              </TableRow>
            
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
