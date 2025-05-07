import { Navigate } from "react-router";
import ManageSettings from "./ManageSettings";
import HallManagement from "./hall-management/HallManagement";
import AddHallForm from "./hall-management/hall-management/AddHallForm";
import EditHallForm from "./hall-management/hall-management/EditHallForm";
import RegistrationContent from "./registration/RegistrationContent";
import RegistrationForm from "./registration/registration/RegistrationForm";
import General from "./general/General";

const ManageSettingsConfig = [
  // {
  // 	path: 'manage-settings',
  // 	element: <Navigate to="profile-field-settings" />
  // },
  {
    path: "manage",
    element: <ManageSettings />,
    children: [
      {
        path: "hall",
        element: <HallManagement />,
        children: [
          {
            path: ":id",
            element: <AddHallForm />,
          },
          {
            path: "edit/:id",
            element: <EditHallForm />,
          },
        ],
      },
      {
        path:"registration",
        element: <RegistrationContent/>,
        children:[
          {
            path:":id",
            element: <RegistrationForm/>
          }
        ]
      },
      {
        path:"general",
        element: <General/>,
      }
    ],
  },
];

export default ManageSettingsConfig;
