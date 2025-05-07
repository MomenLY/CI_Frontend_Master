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
import LocalCache from 'src/utils/localCache';
import { getHallDetailsAPIWithSearch } from './apis/Get-Hall-Details-Api';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { useRoleManagementSelector } from './HallManagementSlice';
import { Box, width } from '@mui/system';
import { BulkDeleteHallAPI } from './apis/Delete-Hall-Api';

type Props = {
    keyword?: string;
    setKeyword?: (data: string) => void;
    rules: any
};

function HallTable({ setKeyword, keyword, rules }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('hallManagement');
    const dispatch = useAppDispatch();
    const params = useParams();
    const user = useAppSelector(selectUser);
    const [pageReady, setPageReady] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [roles, setRoles] = useState([]);
    const [totalPages, setTotalPage] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [columnOrder, setColumnOrder] = useState(["slno"]);
    const [usersWithRoles, setUsersWithRoles] = useState([]);
   
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });
    const [columnPinning, setColumnPinning] = useState({
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
    });
    const [columnVisibility, setColumnVisibility] = useState({});
    const cachedTableData = useRef(null);
    const state = useRoleManagementSelector((state) => state.state.value)
    const sortInitialState = [];
    const _sortColumn = searchParams?.get("sortColumn");
    const _sortOrder = searchParams?.get("sortOrder");
    if (_sortColumn && _sortOrder) {
        sortInitialState.push({
            id: _sortColumn,
            desc: (_sortOrder == "DESC")
        });
    }
    const [sorting, setSorting] = useState(sortInitialState);




    const columns = [
        {
            accessorKey: "slno",
            header: `${t('hall_Slno')}`,
            size: 40,
            grow: true,
            Cell: ({ row, cell }) => (
                <Typography className='pl-10'>
                    {(row.index + 1) > 9 ? row.index + 1 : ('0' + (row.index + 1))}
                </Typography>
            )
        },
        {
            accessorKey: "hallName",
            header: `${t('hall_hallName')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.hallName}
                </Typography>
            ),
            size:10
        },
        {
            accessorKey: "hallType",
            header: `${t('hall_description')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.hallDescription}
                </Typography>
            )
        },
        {
            accessorKey: "totalUsers",
            header: `${t('hall_hallTotalSessions')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.scheduleCount}
                </Typography>
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
                if (isNaN(_pageSize) || _pageSize < 5) {
                    _pageSize = 5;
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
            getHallData({ pagination, keyword, sorting });
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
            urlSearchParams.set("sortColumn", sorting[0].id);
            urlSearchParams.set("sortOrder", (sorting[0].desc === false ? "asc" : "desc"));
        } else {
            urlSearchParams.delete("sortColumn");
            urlSearchParams.delete("sortOrder");
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
        getHallData({ pagination, keyword, sorting });
    }, [state, keyword])

    const getHallData = useCallback(
        debounce(async ({ pagination, keyword, sorting }) => {
            setIsLoading(true);
            try {
                const response = await getHallDetailsAPIWithSearch({ pagination, keyword, sorting });
                console.log(response,"ress-----------");
                
                setUsersWithRoles(response?.data);
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
        console.log(ids,"idsss");
        
        try {
            const response = await BulkDeleteHallAPI(ids);
            const result = response?.statusCode;
            if (result) {
                dispatch(showMessage({ message: "Hall deleted", variant: "success" }));
                getHallData({ pagination, keyword, sorting });
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
        navigate(`edit/${id}`);
    }

    const handleDelete = async (id: any) => {
        const res = await BulkDeleteHallAPI([id]);
        if (res.statusCode === 200) {
            dispatch(showMessage({ message: "Role deleted", variant: "success" }));
            getHallData({ pagination, keyword, sorting });
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
                        {/* {rules?.editRole?.permission && */}
                            <IconButton onClick={(event) => handleUpdate(row.original.id, row.original.id)} disabled={row.original.isDefault === 1}>
                                <FuseSvgIcon
                                    className={`text-48 ${row.original.isDefault === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    size={22}
                                    color="action"
                                >
                                    feather:edit
                                </FuseSvgIcon>
                            </IconButton>
                            {/* // } */}
                        {/* {rules?.deleteRole?.permission && ( */}
                            <IconButton onClick={row.original.areIsDefault === 1 ? null : (event) => {
                                dispatch(openDialog({
                                    children: (
                                        <OnionConfirmBox
                                            confirmButtonLabel={t('common_delete')}
                                            cancelButtonLabel={t('common_cancel')}
                                            variant='warning'
                                            title={t('hall_deletehall_confirmTitle')}
                                            subTitle={t('hall_deletehall_confirmMessage')}
                                            onCancel={() => dispatch(closeDialog())}
                                            onConfirm={() => {
                                                handleDelete(row.original.id);
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
                        {/* // )} */}
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

export default HallTable
