import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import NavLinkAdapter from "@fuse/core/NavLinkAdapter";
import ListItemButton from "@mui/material/ListItemButton";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

function ContactAvatar(props) {
  const { firstName, lastName, avatar, onClick, checked } = props;
  return (
    <>
     <ListItemButton
        className="px-0 py-14 flex align-center"
        sx={{
          bgcolor: "background.paper",
          
          '&:hover': {
            bgcolor: 'transparent'
          }
      }}
        onClick={onClick}
      >
        <div className="flex-1 flex">
          <ListItemAvatar>
          <Avatar alt={firstName} sx={avatar.sx}>{avatar.children}</Avatar>
          </ListItemAvatar>
          <ListItemText
            classes={{ root: "m-0", primary: "font-medium leading-5 truncate" }}
            primary={firstName}
            secondary={
              <Typography
                className="inline"
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {lastName}
              </Typography>
            }
          />
        </div>

        <FormGroup> 
          <FormControlLabel className="m-0" control={<Checkbox size="medium" checked={checked} />} label=""/>
        </FormGroup>
      </ListItemButton>

      {/* <Divider /> */}
    </>
  );
}

export default ContactAvatar;
