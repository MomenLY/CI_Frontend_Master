import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, GlobalStyles, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import DataTable from 'app/shared-components/data-table/DataTable';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { getUserDetailsAPI } from './apis/userAPI';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSearchParams } from 'react-router-dom';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { BulkDeleteUserAPI } from './apis/Delete-User-Api';
import LocalCache from 'src/utils/localCache';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SettingsApi } from '../settings/SettingsApi';
import { updateDefaultPassword } from '../settings/user-settings/admin-management/api/Update-Status';
import { useUsersSelector } from './UsersSlice';

type Props = {
    keyword?: string;
    setKeyword?: (data: string) => void;
};

const defaultValues = {
    password: "",
    shouldSendEmail: true
};

type FormData = {
    password: string;
    shouldSendEmail: boolean
};

const schema = z.object({
    password: z
        .string()
        .nonempty("Please enter your password."),
    shouldSendEmail: z.boolean()
});

function UsersTable({ keyword, setKeyword }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
	const state = useUsersSelector((state) => state.state.value);

    const [userId, setUserId] = useState<string | null>(null);
    const { control, formState, handleSubmit, setValue } = useForm({
        mode: "onChange",
        defaultValues,
        resolver: zodResolver(schema),
    });

    const [pageReady, setPageReady] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPage] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState({
        pageIndex: -1,
        pageSize: 50,
    });
    const [columnOrder, setColumnOrder] = useState([]);
    const [columnPinning, setColumnPinning] = useState({
        left: ["mrt-row-expand", "mrt-row-select"],
        right: ["mrt-row-actions"],
    });
    const [columnVisibility, setColumnVisibility] = useState({});

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
    const cachedTableData = useRef(null)

    const [resetPasswordDialog, toggleResetPasswordDialog] = React.useState(false);
    const [defaultPassword, setDefaultPassword] = useState("");

    const onResetPasswordConfirmation = async () => {
        if (defaultPassword === "") {
            const passwordData = await SettingsApi({ settingsKey: "password" });
            setDefaultPassword(passwordData.defaultPasswordSetByAdmin);
            setValue("password", passwordData.defaultPasswordSetByAdmin);
        } else {
            setValue("password", defaultPassword);
        }
        toggleResetPasswordDialog(true);
    };

    const columns = [
        {
            accessorKey: "firstName",
            header: `${t('firstName')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.firstName}
                </Typography>
            ),
        },
        {
            accessorKey: "lastName",
            header: `${t('lastName')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.lastName}
                </Typography>
            ),
        },
        {
            accessorKey: "email",
            header: `${t('email')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.email}
                </Typography>
            ),
        },
    ];

    useEffect(() => {
        (async () => {
            try {
                let _pageIndex = Number(searchParams?.get("page"));
                if (isNaN(_pageIndex) || _pageIndex <= 0) {
                    _pageIndex = 1;
                }

                const dataTableLocalConfig = await LocalCache.getItem(
                    `dataTableLocalConfig_${user.uuid}`
                );
                const dataTableLocalConfigProcessed = dataTableLocalConfig ? dataTableLocalConfig : {};
                cachedTableData.current = dataTableLocalConfigProcessed;
                let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
                if (isNaN(_pageSize) || _pageSize < 50) {
                    _pageSize = 50;
                }

                dataTableLocalConfigProcessed?.columnOrder && setColumnOrder(dataTableLocalConfigProcessed.columnOrder);
                dataTableLocalConfigProcessed?.columnVisibility && setColumnVisibility(dataTableLocalConfigProcessed.columnVisibility);
                dataTableLocalConfigProcessed?.columnPinning && setColumnPinning(dataTableLocalConfigProcessed.columnPinning);

                setPagination({
                    pageIndex: _pageIndex - 1,
                    pageSize: _pageSize,
                });
                setPageReady(true);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    useEffect(() => {
        if (pagination.pageIndex >= 0) {
            const urlSearchParams = new URLSearchParams(searchParams);
            urlSearchParams.set("page", `${pagination.pageIndex + 1}`);
            setSearchParams(urlSearchParams);
            getUserData({ pagination, keyword, sorting });
        }
    }, [pagination,state]);

    useEffect(() => {
        (async () => {
            try {
                if (pagination.pageSize > 0) {
                    cachedTableData.current = {
                        ...cachedTableData.current,
                        pagination: pagination.pageSize,
                    }
                    await LocalCache.setItem(
                        `dataTableLocalConfig_${user.uuid}`,
                        cachedTableData.current
                    );
                }
            } catch (error) {
                console.log(error);
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
                    `dataTableLocalConfig_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
                console.log(error);
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
                    `dataTableLocalConfig_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
                console.log(error);
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
                    `dataTableLocalConfig_${user.uuid}`,
                    cachedTableData.current
                );
            } catch (error) {
                console.log(error);
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

    const getUserData = useCallback(
        debounce(async ({ pagination, keyword, sorting }) => {
            setIsLoading(true);
            try {
                const response = await getUserDetailsAPI({ pagination, keyword, sorting });
                

                if (response?.data?.items?.length === 0 && pagination.pageIndex !== 0) {
                    setPagination({
                        pageIndex: 0,
                        pageSize: pagination.pageSize,
                    })
                }
                if (response?.data?.items) {
                    setUsers(response?.data?.items);
                }

                if (response.data?.meta) {
                    setTotalPage(response?.data?.meta?.totalPages || 0);
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

    const bulkDeleteUser = async (ids: string[]) => {
        try {
            const response = await BulkDeleteUserAPI(ids);
            const result = response?.statusCode;
            if (result) {
                dispatch(showMessage({ message: "User deleted", variant: "success" }));
                getUserData({ pagination, keyword, sorting });
            }
        } catch (error) {
            const errorMesssage = error?.response?.data?.message;
            console.log("er", errorMesssage);
            if (errorMesssage) {
                dispatch(
                    showMessage({ message: `${errorMesssage}`, variant: "error" })
                );
            }
        }
    };

    const copyPasswordAndEmail = (password: string) => {
        const currentUser = users.find(u => u._id === userId);
        const textToCopy = `Email: ${currentUser?.email}\nPassword: ${password}`;
    
        navigator.clipboard.writeText(textToCopy).then(
            () => {
                dispatch(
                    showMessage({
                        message: "Email and password copied to clipboard",
                        variant: "success",
                    })
                );
            },
            (err) => {
                console.error('Could not copy text: ', err);
                dispatch(
                    showMessage({
                        message: "Failed to copy",
                        variant: "error",
                    })
                );
            }
        );
    };

    const resetPasswordAPI = async (id: string, password?: string, shouldSendEmail?:boolean) => {
        await updateDefaultPassword(id, password, shouldSendEmail);
        toggleResetPasswordDialog(false)
        dispatch(
            showMessage({
                message: `${t("passwordResetSuccessfully")}`,
                variant: "success",
            })
        );
        getUserData({ pagination, keyword, sorting });
    };

    const resetUserPassword = (data: FormData) => {
        resetPasswordAPI(userId, data.password, data.shouldSendEmail);
    };

    return (
        <>
            <GlobalStyles
                styles={() => ({
                    '#root': {
                        maxHeight: '100vh'
                    }
                })}
            />
            <Paper
                className="flex flex-col flex-auto shadow-3 rounded-4 overflow-hidden h-full "
                elevation={0}
            >
                <Dialog
                    open={resetPasswordDialog}
                    onClose={() => toggleResetPasswordDialog(false)}
                >
                    <OnionConfirmBox
                        onCancel={() => toggleResetPasswordDialog(false)}
                        onConfirm={handleSubmit(resetUserPassword)}
                    >
                        <form
                            name="AdminPasswordReset"
                            noValidate
                            spellCheck={false}
                            className=" flex flex-col left-0 space-y-14 my-5"
                            onSubmit={handleSubmit(resetUserPassword)}
                        >
                            <div className="flex flex-col space-y-5">
                                <Typography
                                    style={{
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'pre-line',
                                    }}
                                    className='font-semibold'
                                    variant="h6">{t('resetPassword')}</Typography>
                                <Typography variant="caption">
                                    {t("resetPasswordHelperText")}
                                </Typography>
                            </div>
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={t("password")}
                                        autoFocus
                                        type="text"
                                        error={!!formState.errors.password}
                                        helperText={formState.errors?.password?.message}
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => copyPasswordAndEmail(field.value)}
                                                    edge="end"
                                                >
                                                    <FuseSvgIcon size={20}>material-solid:content_copy</FuseSvgIcon>
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="shouldSendEmail"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <FormControl>
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={value} onChange={onChange} />
                                            }
                                            label={t("emailUserAboutPasswordReset")}
                                        />
                                    </FormControl>
                                )}
                            />
                        </form>
                    </OnionConfirmBox>
                </Dialog>
                <DataTable
                    data={users}
                    columns={columns}
                    manualPagination={true}
                    enableColumnFilters={false}
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
                    renderRowActionMenuItems={({ closeMenu, row, table }) => [
                        <MenuItem
                            key={0}
                            onClick={() =>
                                dispatch(
                                    openDialog({
                                        children: (
                                            <OnionConfirmBox
                                                title={t('confirmDelete')}
                                                subTitle={t('userModule_DeleteConfirm_warning')}
                                                onCancel={() => dispatch(closeDialog())}
                                                onConfirm={() => {
                                                    bulkDeleteUser([row.original._id]);
                                                    dispatch(closeDialog());
                                                    closeMenu();
                                                }}
                                            />
                                        ),
                                    })
                                )
                            }
                        >
                            {t("common_delete")}
                        </MenuItem>,
                        <MenuItem
                            key={1}
                            onClick={() => {
                                navigate(`edit/${row.original._id}`);
                                closeMenu();
                            }}
                        >
                            {t("common_edit")}
                        </MenuItem>,
                        <MenuItem
                            key={2}
                            onClick={() => {
                                setUserId(row.original._id);
                                onResetPasswordConfirmation();
                                closeMenu();
                            }}
                        >
                            {t("reset_Password")}
                        </MenuItem>
                    ]}
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
                                                <OnionConfirmBox
                                                    title={t('confirmDelete')}
                                                    subTitle={t('userModule_DeleteConfirm_warning')}
                                                    onCancel={() => dispatch(closeDialog())}
                                                    onConfirm={() => {
                                                        const selectedRows = table.getSelectedRowModel().rows;
                                                        const ids = selectedRows.map((row) => row.original._id);
                                                        bulkDeleteUser(ids);
                                                        dispatch(closeDialog());
                                                        table.resetRowSelection();
                                                    }}
                                                />),
                                        })
                                    )
                                }}
                                className="flex shrink min-w-40 ltr:mr-8 rtl:ml-8"
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
        </>
    );
}

export default UsersTable;