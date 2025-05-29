import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useSelector } from "react-redux";
import { toggleFavoriteAttendeeStatus } from "../api/favorite-attendee";
import { useAppDispatch } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";

type UserItemProps = {
  name: string;
  imageSrc: string;
  userId: string;
  isFavorite?: boolean;
  setUsersWithFavoriteStatus?: (users: any) => void;
  email: string;
  userRole: string;
};

function UserItem({
  name,
  imageSrc,
  userId,
  isFavorite = false,
  setUsersWithFavoriteStatus,
  email,
  userRole,
}: UserItemProps) {
  const user = useSelector(selectUser);
  const dispatch = useAppDispatch();
  const [fillColor, setFillColor] = useState(
    isFavorite ? "#f7ca69" : "#D8DBDE"
  );

  const changeFavoriteUserStatus = async () => {
    try {
      setFillColor(fillColor === "#D8DBDE" ? "#f7ca69" : "#D8DBDE");
      const toggleResponse = await toggleFavoriteAttendeeStatus(
        userId,
        isFavorite ? "remove" : "add"
      );

      // Update the favorite status in state immutably
      setUsersWithFavoriteStatus((pre) =>
        pre.map((item) =>
          item.epUserId === userId
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
    } catch (error) {
      console.log(error);
      setFillColor(isFavorite ? "#f7ca69" : "#D8DBDE");
      dispatch(
        showMessage({
          message: `Failed to make ${name} ${isFavorite ? "unfavorite" : "favorite"}`,
          variant: "error",
        })
      );
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center flex-1 overflow-hidden pe-20">
        <Avatar
          sx={{
            background: (theme) => theme.palette.background.default,
            color: (theme) => theme.palette.text.secondary,
            width: "30px",
            height: "30px",
          }}
          className="me-10"
          alt="user photo"
          src={imageSrc}
        />
        <div className="flex flex-col">
          <Typography
            component="span"
            className="font-normal text-[14px] block mb-0 truncate whitespace-nowrap"
          >
            {name}
          </Typography>
          <Typography
            component="span"
            className="font-normal text-[9px] mb-0 truncate whitespace-nowrap"
          >
            {email}
          </Typography>
        </div>
      </div>
      {userId !== user?.uuid && userRole !== "admin" && (
        <span onClick={changeFavoriteUserStatus} className="cursor-pointer">
          <svg
            id="mySvg"
            width="24"
            height="22"
            viewBox="0 0 24 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="myPath"
              d="M12 0L14.6942 8.2918H23.4127L16.3593 13.4164L19.0534 21.7082L12 16.5836L4.94658 21.7082L7.64074 13.4164L0.587322 8.2918H9.30583L12 0Z"
              fill={fillColor}
            />
          </svg>
        </span>
      )}
    </div>
  );
}

export default UserItem;
