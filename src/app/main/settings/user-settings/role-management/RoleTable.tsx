import { Avatar, AvatarGroup, Button, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Stack, Typography } from '@mui/material';
import DataTable from 'app/shared-components/data-table/DataTable';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { debounce, size } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSearchParams } from 'react-router-dom';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { BulkDeleteRoleAPI } from './apis/Delete-Role-Api';
import LocalCache from 'src/utils/localCache';
import { getUserDetailsAPIWithSearch } from './apis/Get-User-Details-Api';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { useRoleManagementSelector } from './RoleManagementSlice';
import { Box, width } from '@mui/system';

type Props = {
    keyword?: string;
    setKeyword?: (data: string) => void;
    rules: any
};

function RoleTable({ setKeyword, keyword, rules }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('roleManagement');
    const dispatch = useAppDispatch();
    const params = useParams();
    const user = useAppSelector(selectUser);
    const [pageReady, setPageReady] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [roles, setRoles] = useState([]);
    const [totalPages, setTotalPage] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [columnOrder, setColumnOrder] = useState(["slno"]);
    const [usersWithRoles, setUsersWithRoles] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: -1,
        pageSize: 50,
    });
    const [columnPinning, setColumnPinning] = useState({
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
    });
    const [columnVisibility, setColumnVisibility] = useState({});
    const cachedTableData = useRef(null);
    const state = useRoleManagementSelector((state) => state.state.value)
    const sortInitialState = [];
    const _sortBy = searchParams?.get("sortBy");
    const _orderBy = searchParams?.get("orderBy");
    if (_sortBy && _orderBy) {
        sortInitialState.push({
            id: _sortBy,
            desc: (_orderBy == "desc")
        });
    }
    const [sorting, setSorting] = useState(sortInitialState);

    const stringAvatar = (name: string | null | undefined, noUsers: boolean = false) => {
        if (noUsers) {
            return {};
        }
    
        if (!name) {
            return {};
        }
    
        const nameParts = name.trim().split(' ');
        const initials = nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`
            : `${nameParts[0][0]}`; // Use only the first letter of the single word.
    
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: initials.toUpperCase(), // Ensure initials are uppercase.
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
    }

    const columns = [
        {
            accessorKey: "slno",
            header: `${t('role_Slno')}`,
            size: 40,
            grow: true,
            Cell: ({ row, cell }) => (
                <Typography className='pl-10'>
                    {(row.index + 1) > 9 ? row.index + 1 : ('0' + (row.index + 1))}
                </Typography>
            )
        },
        {
            accessorKey: "roleName",
            header: `${t('role_roleName')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.roleName}
                </Typography>
            ),
            size:10
        },
        {
            accessorKey: "roleType",
            header: `${t('role_roleType')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.roleType}
                </Typography>
            )
        },
        {
            accessorKey: "totalUsers",
            header: `${t('role_users')}`,
            Cell: ({ row }) => (
                (row.original.users && row.original.users.length > 0 && row.original.users.length !== undefined) && (
                    <Stack direction="row">
                        <AvatarGroup renderSurplus={(surplus) => <span className="custom-surplus">+{surplus.toString()[0]}</span>} max={4} spacing={11}
                            sx={{
                                '& .MuiAvatar-root': {
                                    border: '0',
                                    '&:last-child': {
                                        marginLeft: '0px',
                                    },
                                    width: '28px',
                                    height: '26px'
                                },
                                '& .custom-surplus': {
                                    fontSize: '14px',
                                }
                            }}
                        >
                            {row.original.users.map((user: any) => (
                                <Avatar
                                    key={user._id} {...stringAvatar((user.firstName).toUpperCase())} className='text-base' />
                            ))}
                        </AvatarGroup>
                    </Stack>
                )
            )
        }
    ];

    useEffect(() => {
        (async () => {
            try {
                let _pageIndex = Number(searchParams?.get("page"));
                if (isNaN(_pageIndex) || _pageIndex <= 0) {
                    _pageIndex = 1;
                }

                const dataTableLocalConfig = await LocalCache.getItem(
                    `dataTableLocalConfigForRole_${user.uuid}`
                );
                const dataTableLocalConfigProcessed = dataTableLocalConfig ? dataTableLocalConfig : {};
                cachedTableData.current = dataTableLocalConfigProcessed;
                let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
                if (isNaN(_pageSize) || _pageSize < 50) {
                    _pageSize = 50;
                }

                dataTableLocalConfigProcessed?.columnOrder && setColumnOrder(["slno", ...dataTableLocalConfigProcessed.columnOrder.filter((col) => col !== "slno")]);
                dataTableLocalConfigProcessed?.columnVisibility && setColumnVisibility(dataTableLocalConfigProcessed.columnVisibility);
                dataTableLocalConfigProcessed?.columnPinning && setColumnPinning(dataTableLocalConfigProcessed.columnPinning);

                setPagination({
                    pageIndex: _pageIndex - 1,
                    pageSize: _pageSize,    
                });
                setPageReady(true);
            } catch (error) {

            }
        })()
    }, []);

    useEffect(() => {
        if (pagination.pageIndex >= 0) {
            const urlSearchParams = new URLSearchParams(searchParams);
            urlSearchParams.set("page", `${pagination.pageIndex + 1}`);
            setSearchParams(urlSearchParams);
            getRoleData({ pagination, keyword, sorting });
        }
    }, [pagination]);

    useEffect(() => {
        (async () => {
            try {
                if (pagination.pageSize > 0) {
                    cachedTableData.current = {
                        ...cachedTableData.current,
                        pagination: pagination.pageSize,
                    }
                    await LocalCache.setItem(
                        `dataTableLocalConfigForRole_${user.uuid}`,
                        cachedTableData.current
                    );
                }
            } catch (error) {
            }
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

            setSearchParams(urlSearchParams);
            setPagination({
                pageIndex: 0,
                pageSize: pagination.pageSize,
            });
        }
    }, [keyword]);

    useEffect(() => {
        (async () => {
            try {
                cachedTableData.current = {
                    ...cachedTableData.current,
                    columnOrder: columnOrder,
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForRole_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
            }
        })();
    }, [columnOrder]);

    useEffect(() => {
        (async () => {
            try {
                cachedTableData.current = {
                    ...cachedTableData.current,
                    columnVisibility: columnVisibility,
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForRole_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
            }
        })();
    }, [columnVisibility]);

    useEffect(() => {
        (async () => {
            try {
                cachedTableData.current = {
                    ...cachedTableData.current,
                    columnPinning: columnPinning,
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForRole_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
            }
        })();
    }, [columnPinning]);

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(searchParams);
        if (sorting && sorting.length > 0) {
            urlSearchParams.set("sortBy", sorting[0].id);
            urlSearchParams.set("orderBy", (sorting[0].desc === false ? "asc" : "desc"));
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

    useEffect(() => {
        getRoleData({ pagination, keyword, sorting });
    }, [state, keyword])

    const getRoleData = useCallback(
        debounce(async ({ pagination, keyword, sorting }) => {
            setIsLoading(true);
            try {
                const response = await getUserDetailsAPIWithSearch({ pagination, keyword, sorting });
                setUsersWithRoles(response.items);
                if (response?.items?.length === 0 && pagination.pageIndex !== 0) {
                    setPagination({
                        pageIndex: 0,
                        pageSize: pagination.pageSize,
                    })
                }
                if (response.items) {
                    setRoles(response?.items);
                }
                if (response?.meta) {
                    setTotalPage(response?.meta?.totalPages || 0);
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error("Error fetching data:", error);
                throw error;
            }
        }, 300),
        []
    );

    const bulkDeleteRole = async (ids: string[]) => {
        try {
            const response = await BulkDeleteRoleAPI(ids);
            const result = response?.statusCode;
            if (result) {
                dispatch(showMessage({ message: "Role deleted", variant: "success" }));
                getRoleData({ pagination, keyword, sorting });
            }
        } catch (error) {
            const errorMesssage = error?.response?.data?.message;
            if (errorMesssage) {
                dispatch(
                    showMessage({ message: `${errorMesssage}`, variant: "error" })
                );
            }
        }
    };

    const handleUpdate = async (id: any, roleType: string) => {
        navigate(`edit/${id}/${roleType}`);
    }

    const handleDelete = async (id: any) => {
        const res = await BulkDeleteRoleAPI([id]);
        if (res.statusCode === 200) {
            dispatch(showMessage({ message: "Role deleted", variant: "success" }));
            getRoleData({ pagination, keyword, sorting });
        }
    }

    return (
        <Paper
            className="flex flex-col flex-auto shadow-3 rounded-4 overflow-hidden w-full  h-full"
            elevation={0}
        >
            <DataTable
                data={usersWithRoles}
                columns={columns}
                manualPagination={true}
                enableColumnDragging={true}
                enableRowSelection={false}
                state={{
                    pagination,
                    columnOrder,
                    columnVisibility,
                    columnPinning,
                    sorting,
                    showProgressBars: isLoading,
                }}
                onPaginationChange={setPagination}
                rowCount={pagination.pageSize}
                pageCount={totalPages}

                renderRowActions={({ row }) => (
                    <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        {rules?.editRole?.permission &&
                            <IconButton onClick={(event) => handleUpdate(row.original.roleId, row.original.roleType)} disabled={row.original.isDefault === 1}>
                                <FuseSvgIcon
                                    className={`text-48 ${row.original.isDefault === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    size={22}
                                    color="action"
                                >
                                    feather:edit
                                </FuseSvgIcon>
                            </IconButton>}
                        {rules?.deleteRole?.permission && (
                            <IconButton onClick={row.original.areIsDefault === 1 ? null : (event) => {
                                dispatch(openDialog({
                                    children: (
                                        <OnionConfirmBox
                                            confirmButtonLabel={t('common_delete')}
                                            cancelButtonLabel={t('common_cancel')}
                                            variant='warning'
                                            title={t('role_deleteRole_confirmTitle')}
                                            subTitle={t('role_deleteRole_confirmMessage')}
                                            onCancel={() => dispatch(closeDialog())}
                                            onConfirm={() => {
                                                handleDelete(row.original.roleId);
                                                dispatch(closeDialog());
                                            }}
                                        />
                                    ),
                                }));
                            }} disabled={row.original.isDefault === 1}>
                                <FuseSvgIcon
                                    className={`text-48 ${row.original.isDefault === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}

                                    size={22}
                                    color="action"
                                >
                                    feather:trash
                                </FuseSvgIcon>
                            </IconButton>
                        )}
                    </Box>
                )}
                renderTopToolbarCustomActions={({ table }) => {
                    const { rowSelection } = table.getState();

                    if (Object.keys(rowSelection).length === 0) {
                        return null;
                    }

                    return (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                dispatch(
                                    openDialog({
                                        children: (
                                            <>
                                                <DialogTitle id="alert-dialog-title">
                                                    {t("areYouSureYouWantToDelete")}
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-description">
                                                        {t("areYouSureYouWantToDelete")}
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button
                                                        onClick={() => dispatch(closeDialog())}
                                                        color="primary"
                                                    >
                                                        {t('no')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            const selectedRows = table.getSelectedRowModel().rows;
                                                            const ids = selectedRows.map((row) => row.original.roleId);
                                                            bulkDeleteRole(ids);
                                                            dispatch(closeDialog());
                                                            table.resetRowSelection();
                                                        }}
                                                        color="primary"
                                                        autoFocus
                                                    >
                                                        {t("yes")}
                                                    </Button>
                                                </DialogActions>
                                            </>
                                        ),
                                    })
                                )

                            }}
                            className="flex shrink min-w-40 ltr:mr-8 rtl:ml-8 max-w-24"
                            color="secondary"
                        >
                            <FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
                            <span className="hidden sm:flex mx-8">{t('deleteSelectedItems')}</span>
                        </Button>
                    );
                }}
                enableColumnOrdering={true}
                enableColumnPinning={true}
                onColumnOrderChange={setColumnOrder}
                onColumnVisibilityChange={setColumnVisibility}
                onColumnPinningChange={setColumnPinning}
                onSortingChange={setSorting}
            />
        </Paper>
    );
}

export default RoleTable
