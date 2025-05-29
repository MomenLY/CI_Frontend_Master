import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTranslation } from 'react-i18next';

/**
 * The main sidebar more menu.
 */
function DropdownMenu(props) {
  const { handleEdit, handleDelete, handleStatusChange, isItemActive } = props;
  const [moreMenuEl, setMoreMenuEl] = useState(null);
  const { t } = useTranslation();
  function handleMoreMenuClick(event) {
    setMoreMenuEl(event.currentTarget);
  }

  function handleMoreMenuClose() {
    setMoreMenuEl(null);
  }

  function handleEditClick() {
    handleEdit();
    handleMoreMenuClose();
  }

  function handleDeleteClick() {
    handleDelete();
    handleMoreMenuClose();
  }

  function handleStatusClick() {
    handleStatusChange();
    handleMoreMenuClose();
  }

  return (
    <>
      <IconButton
        aria-haspopup="true"
        onClick={handleMoreMenuClick}
        size="small"
        className="h-28 w-28"
        sx={{
          color: 'common.black',
          backgroundColor: 'common.white',
          '&:hover': {
            backgroundColor: 'common.white',
          }
        }}
      >
        <FuseSvgIcon size={18}>heroicons-outline:dots-vertical</FuseSvgIcon>
      </IconButton>
      <Menu
        id="chats-more-menu"
        anchorEl={moreMenuEl}
        open={Boolean(moreMenuEl)}
        onClose={handleMoreMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: "30px", // Adds a 20px top margin
        }}
      >
        <MenuItem color="background.default" onClick={handleEditClick}>
          <FuseSvgIcon className="text-48 me-10" size={16} color="primary">
            feather:edit
          </FuseSvgIcon>
          {t('common_edit')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <FuseSvgIcon className="text-48 me-10" size={16} color="primary">
            feather:trash
          </FuseSvgIcon>
          {t('common_delete')}
        </MenuItem>
        {handleStatusChange &&
          <MenuItem onClick={handleStatusClick}>
            {isItemActive === false &&
              <>
                <FuseSvgIcon className="text-48 me-10" size={16} color="primary">
                  feather:arrow-up
                </FuseSvgIcon> {t('common_publish')}
              </>}
            {isItemActive === true &&
              <>
                <FuseSvgIcon className="text-48 me-10" size={16} color="primary">
                  feather:arrow-down
                </FuseSvgIcon> {t('common_unpublish')}
              </>}
          </MenuItem>}
      </Menu>
    </>
  );
}

export default DropdownMenu;
