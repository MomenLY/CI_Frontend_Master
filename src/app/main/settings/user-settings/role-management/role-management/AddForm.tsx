import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  List,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  debounce,
  styled,
} from "@mui/material";
import * as _ from "lodash";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import ContactAvatar from "app/theme-layouts/shared-components/ContactAvatar";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { RoleSelectorAPI } from "src/app/main/users/apis/Role-Selector-Api";
import { addRoleAPI, getRoleDetailsAPI } from "../apis/RoleAPI";
import { getUserDetailsAPI } from "src/app/main/users/apis/userAPI";
import { UpdateUserAPI } from "src/app/main/users/apis/Update-User-Api";
import { BulkUpdateUserAPI } from "../apis/Bulk-User-Update-Api";
import { useDateField } from "@mui/x-date-pickers/DateField/useDateField";
import { AirlineSeatReclineNormalTwoTone } from "@mui/icons-material";
import * as z from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OnionSidebar from "app/shared-components/components/OnionSidebar";
import LocalCache from "src/utils/localCache";
import OnionSearch from "app/shared-components/components/OnionSearch";
import OnionSubHeader from "app/shared-components/components/OnionSubHeader";
import { getRoleObject } from "src/utils/role";
import { getModuleAccessRules } from "src/utils/aclLibrary";
import { init } from "i18next";
import { setState, useRoleManagementDispatch, useRoleManagementSelector } from "../RoleManagementSlice";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getRoles } from "app/shared-components/cache/cacheCallbacks";
import OnionNotFound from "app/shared-components/components/OnionNotFound";

const Div = styled("div")(({ theme }) => ({
  ...theme.typography.button,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1),
}));

export default function AddForm() {
  const { t } = useTranslation('roleManagement');
  const [searchParams, setSearchParams] = useSearchParams();
  const [roleTypes, setRoleTypes] = useState([]);
  const [roleType, setRoleType] = useState("");
  const [roleName, setRoleName] = useState("");
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const user = useAppSelector(selectUser);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [updateUsers, setUpdateUsers] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const defaultValues = {
    name: '',
    roleType: '',
    userList: []
  };

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const sortInitialState = [];
  const _sortBy = searchParams?.get("sortBy");
  const _orderBy = searchParams?.get("orderBy");
  if (_sortBy && _orderBy) {
    sortInitialState.push({
      id: _sortBy,
      desc: (_orderBy == "desc")
    });
  }
  const dispatchRefresh = useRoleManagementDispatch();
  const state = useRoleManagementSelector((state) => state.state.value);
  const [roleObject, setRoleObject] = useState({});
  const [refreshRole, setRefreshRole] = useState(true);
  const [sorting, setSorting] = useState(sortInitialState);
  const firstUserItemRef = useRef(null);
  const lastUserItemRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(true);
  const [roles, setRoles] = useState([]);
  const [userWithRoles, setUsersWithRoles] = useState([]);
  const [isB2B, setIsB2B] = useState();
  const [roleRules, setRoleRules] = useState({});

  type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    userList: any;
  };

  const schema = z.object({
    name: z.string().nonempty('role_name_requiredMessage'),
    roleType: z.string().optional()
  });

  useEffect(() => {
    getSettings();
    const init = async () => {
      const roleRules = await getModuleAccessRules('role');
      setRoleRules(roleRules.access);
    }
    init();
  }, [])

  useEffect(() => {
    getSettings();
  }, [])

  const getSettings = async () => {
    const settings = await LocalCache.getItem(cacheIndex.settings, getSettings.bind(null));
    setIsB2B(settings?.B2B);
  }

  useEffect(() => {
    getRoleData();
  }, []);

  const getRoleData = async () => {
    try {
      const roleArray = await LocalCache.getItem(cacheIndex.roles, getRoles.bind(null));
          const uniqueRoleTypes = Array.from(new Set(roleArray.map((role: any) => role.roleType)));
          setRoleTypes(uniqueRoleTypes);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    if (refreshRole) {
      getRoleObject().then((roleObj) => {
        setRoleObject(roleObj);
        setRefreshRole(false);
      });
    }
  }, [refreshRole]);

  const convertRoleIdtoName = (roleIds, roleObject) => {
    if (!roleIds) return '';
    const roleNames = roleIds.map((roleId) => {
      return roleObject[String(roleId)]?.name || null;
    });

    const filteredRoleNames = roleNames.filter((name, index, self) => {
      return name && self.indexOf(name) === index;
    });

    return filteredRoleNames.join(', ');
  };

  const usersWithSelection = users.map((user) => ({
    ...user,
    selected: selectedUsers.some(selectedUser => selectedUser.id === user._id),
  }));

  const handleUserClick = (user: any) => () => {
    toggleUserSelection(user);
  };

  const getUserData = useCallback(
    debounce(async ({ pagination, keyword, sorting }) => {
      setIsLoading(true);
      setIsFetching(true);
      try {
        const response = await getUserDetailsAPI({
          pagination,
          keyword,
          sorting,
        });
        if (response?.data && Array.isArray(response.data.items)) {
          setUsers((prevUsers) => [...prevUsers, ...response.data.items]);
        } else {
          throw new Error("Unexpected response format from getUserDetailsAPI");
        }

        if (response?.data?.meta && typeof response.data.meta.totalPages === "number") {
          setTotalPage(response.data.meta.totalPages);
        } else {
          throw new Error("Unexpected response format from getUserDetailsAPI");
        }
        setIsLoading(false);
        setIsFetching(false);
      } catch (error) {
        setIsLoading(false);
        setIsFetching(false);
        throw error;
      }
    }, 300),
    [sorting]
  );

  useEffect(() => {
    setUsers([]);
    setPagination({ pageIndex: 0, pageSize: 5 });
    getUserData({ pagination, keyword });
  }, [keyword]);

  useEffect(() => {
    if (!isFetching && hasMoreUsers && lastUserItemRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (entry.target === lastUserItemRef.current) {
                setPagination((prevPagination) => ({
                  ...prevPagination,
                  pageIndex: prevPagination.pageIndex + 1,
                }));
              }
            }
          });
        },
        { root: null, threshold: 1 }
      );

      observer.observe(lastUserItemRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [isFetching, hasMoreUsers]);

  useEffect(() => {
    setHasMoreUsers(pagination.pageIndex < totalPages - 1);
  }, [pagination.pageIndex, totalPages]);

  useEffect(() => {
    getUserData({ pagination, keyword });
  }, [pagination, keyword]);

  const handleRoleType = (event: SelectChangeEvent) => {
    setRoleType(event.target.value as string);
  };

  const handleRoleName = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRoleName(event.target.value)
    setValue('name', event.target.value);
  };

  const onSubmit = async (formData) => {
    try {
      setFormSubmissionOnProgress(true);
      let payload;
      if (isB2B === true) {
        const { name } = formData;
        payload = {
          roleName: name,
          roleType: 'admin',
        };
      } else {
        const { name, roleType } = formData;
        payload = {
          roleName: name,
          roleType,
        };
      }

      const roleResponse = await addRoleAPI(payload);
      const roleResult = roleResponse?.data;
      const roleId = roleResult._id;
      setRoleId(roleId);
      await LocalCache.deleteItem(cacheIndex.roles);
      if (roleId) {
        const updatedUsers = selectedUsers
        .filter((user) => user.id && user.id.trim())
        .map((user) => ({
          _id: user.id,
          roleIds: [...new Set([...user.roleIds, roleId])],
        }));
        

        if (Array.isArray(updatedUsers) && updatedUsers.length > 0) {
          setUpdateUsers(updatedUsers);
          try {
            const userResponse = await BulkUpdateUserAPI(updatedUsers);
            if (userResponse.data.data.failed.length === 0) {
              dispatch(showMessage({ message: t('role_addRoleWithUser_success'), variant: "success" }));
              getUserData({ pagination, sorting, keyword });
              navigate('/admin/settings/user-settings/role-management');
            } else {
              dispatch(showMessage({ message: t('role_addRoleButNoPermissionForUsers_info'), variant: "info" }));
              getUserData({ pagination, sorting, keyword });
              navigate('/admin/settings/user-settings/role-management');
            }
            getUserData({ pagination, sorting, keyword });
            dispatchRefresh(setState(!state));
            await LocalCache.deleteItem(cacheIndex.roles)
          } catch (bulkUpdateError) {
            setRefresh(false);
            dispatch(showMessage({ message: t('role_addRoleWithUsers_error'), variant: "warning" }));
          }
        } else {
          dispatch(showMessage({ message: t("role_addRoleWithoutUser_warning"), variant: "warning" }));
          getUserData({ pagination, sorting, keyword });

          navigate('/admin/settings/user-settings/role-management');
          dispatchRefresh(setState(!state));
        }
      }
      setFormSubmissionOnProgress(false);
    } catch (e) {
      setFormSubmissionOnProgress(false);
      const errorMessage = e?.response?.data?.message;
      if (errorMessage) {
        dispatch(showMessage({ message: errorMessage || t('role_addRoleRoleAlreadyExists_warning'), variant: "error" }));
      }
    }
  };

  const shouldEnableSaveButton = () => {
    const { name, roleType } = getValues();
    if (!name) {
      return false;
    }
    if (!isB2B) {
      if (!roleType) {
        return false;
      }
    }
    return true;
  }

  const stringAvatar = (name: string) => {
    if (!name) return {};
    const nameParts = name.split(' ');
    const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : name[0];
    return {
      sx: {
        bgcolor: stringToColor(initials),

      },
      children: initials,
    };
  };

  const stringToColor = (string: string) => {
    let colors = ['#62A1FF', '#FF6262', '#FF62E6', '#FFC52E', '#9D62FF', '#44C969', '#FF3939', '#2461FF', '#8D4221', '#1A4B41', '#4B09B8', '#008A48', '#8DA432', '#6072B0', '#6B0A98', '#044690', '#7E7E7E', '#F98554', '#8F2727', '#44C9AD', '#AE7657', '#047575', '#77D400', '#120B7F', '#4A6F68', '#A23DB3'];
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers) {
        const userExists = prevSelectedUsers.some(selectedUser => selectedUser.id === user._id);
        if (userExists) {
          return prevSelectedUsers.filter(selectedUser => selectedUser.id !== user._id);
        } else {
          return [...prevSelectedUsers, { id: user._id, roleIds: user.roleIds }];
        }
      }
      return [{ id: user._id, roleIds: user.roleIds }];
    });
  };

  useEffect(() => {
  }, [selectedUsers]);
  const { control, formState, handleSubmit, setValue, getValues } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  const { isValid, dirtyFields, errors } = formState;
  const [formSubmitted, setFormSubmissionOnProgress] = useState(false);

  return (
    <>
      <OnionSidebar
        title={t('role_addRole_title')}
        exitEndpoint="/admin/settings/user-settings/role-management"
        sidebarWidth="small"
        footer
        footerButtonClick={handleSubmit(onSubmit)}
        footerButtonLabel={t('common_submit')}
        footerButtonDisabled={!shouldEnableSaveButton()}
        footerButtonSize="full"
        isFooterButtonLoading={formSubmitted}
      >
        <div className="">
          <OnionSubHeader
            title={t('role_addRoleRoleInfo_title')}
            subTitle={t('role_addRoleRoleInfo_text')}
          />
          <form
            name="RoleAddForm"
            noValidate
            spellCheck={false}
            className="flex w-full md:w-full flex-col justify-center"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <div className="my-32 space-y-16 w-full md:w-[90%]">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("role_roleName")}
                    autoFocus
                    type="name"
                    error={!!errors.name}
                    onChange={(e) => { field.onChange(e.target.value); handleRoleName(e) }}
                    helperText={t(errors?.name?.message)}
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
              {!isB2B && <Controller
                name="roleType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">{t('role_roleType')}</InputLabel>
                    <Select
                      {...field}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={field.value || ''}
                      onChange={(e) => { field.onChange(e.target.value); handleRoleType(e) }}
                      label={roleType}
                      error={!!errors.roleType}
                    >
                      {roleTypes &&
                        roleTypes.map((option) => (
                          <MenuItem key={option._id} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.roleType && <FormHelperText error>{errors.roleType.message}</FormHelperText>}
                  </FormControl>
                )}
              />}
            </div>
            {roleRules['assignUser']?.permission &&
              <div>
                <div className="">
                  <OnionSubHeader
                    title={t('role_addRoleUsersList_title')}
                    subTitle={t('role_addRoleUsersList_text')}
                  />
                </div>

                <div className="relative">
                  <Box
                    className="flex flex-1 items-center pt-32 pb-28 sticky top-72 z-30"
                    sx={{
                      backgroundColor: "background.paper",
                    }}
                  >
                    <OnionSearch isHeader={false} keyword={keyword} setKeyword={setKeyword} searchLabel={t("role_search")} />
                  </Box>

                  <div className="pt-4 flex flex-col flex-auto h-full overflow-hidden sticky top-0 z-20">
                    <List className="w-full m-0 p-0 overflow-y-auto">
                      {(users && users.length>0) ?
                        users.map((user, index) => (
                          <div
                            id={`user-${user._id}`}
                            key={user._id}
                            ref={index === users.length - 1 ? lastUserItemRef : null}
                          >
                            <ContactAvatar
                              firstName={user.firstName}
                              lastName={convertRoleIdtoName(user.roleIds, roleObject)}
                              onClick={handleUserClick(user)}
                              avatar={stringAvatar(user.firstName)}
                              checked={selectedUsers.some(selectedUser => selectedUser.id === user._id)}
                            />  
                          </div>
                        )): <div className="flex align-center justify-center">{t('role_addRoleUsersNotFound_error')}</div>}
                    </List>
                  </div>


                </div>
              </div>
            }
          </form>
        </div>
      </OnionSidebar>
    </>
  );
}

