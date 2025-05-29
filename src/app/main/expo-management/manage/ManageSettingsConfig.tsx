import { Navigate } from "react-router-dom";

import Attendees from "./attendees/Attendees";
import ManageSetting from "./ManageSetting";
import Schedules from "./schedules/Schedules";
import ScheduleAddForm from "./schedules/schedule/ScheduleAddForm";
import HallManagement from "./hall-management/HallManagement";
import AddHallForm from "./hall-management/hall-management/AddHallForm";
import EditHallForm from "./hall-management/hall-management/EditHallForm";
import RegistrationContent from "./registration/RegistrationContent";
import RegistrationForm from "./registration/registration/RegistrationForm";
import GeneralContent from "./general/GeneralContent";
import ScheduleUpdateForm from "./schedules/schedule/ScheduleUpdateForm";
import ExpoUpdateForm from "../expo/ExpoUpdateForm";
import Billboard from "./billboard/Billboard";
import Agenda from "./agenda/Agenda";
import { Bluetooth } from "@mui/icons-material";
import Booth from "./booth/Booth";
import BillboardReport from "./billboard-report/BillboardReport";
import BoothReport from "./booth-report/BoothReport";

const ManageSettingsConfig = [
  {
    path: "manage",
    element: <ManageSetting />,
    children: [
      {
        path: "",
        element: <Navigate to="agenda" />,
      },
      {
        path: "billboard",
        element: <Billboard />,
      },
      {
        path: "attendees",
        element: <Attendees />,
        // children: [
        //   {
        //     path: "new",
        //     element: <AttendeeForm />,
        //   },
        //   // {
        //   //     path: 'edit/:id',
        //   //     element: <UpdateAttendeeForm />
        //   // }
        // ],
      },
      // {
      //   path: "attendees/new",
      //   element: <AttendeeForm />,
      // },
      {
        path: "hall",
        element: <HallManagement />,
        children: [
          {
            path: "new",
            element: <AddHallForm />,
          },
          {
            path: "edit-hall/:hallId",
            element: <EditHallForm />,
          },
        ],
      },
      {
        path: "registration",
        element: <RegistrationContent />,
        children: [
          {
            path: ":registration-form",
            element: <RegistrationForm />,
          },
        ],
      },
      {
        path: "general",
        element: <GeneralContent />,
      },
      {
        path: "schedule",
        element: <Schedules />,
        children: [
          {
            path: "new",
            element: <ScheduleAddForm />,
          },
          {
            path: "edit/:scheduleId",
            element: <ScheduleUpdateForm />,
          },
        ],
      },
      {
        path: "booth",
				element: <Booth />
      },
      {
        path: "agenda",
        element: <Agenda />,
        children: [
          {
            path: "edit/:id",
            element: <ExpoUpdateForm />,
          },
        ],
      },
      {
        path: "billboard-report",
        element: <BillboardReport />,
      },
      {
        path: "booth-report",
        element: <BoothReport />,
      },
      // {
    ],
  },
];

export default ManageSettingsConfig;
