import { Box, Grid, Tabs, Tab, Typography } from '@mui/material';
import ImageList from 'app/shared-components/components/ImageList';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getExpoLists } from './apis/Get-Expo-Lists';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ExpoDeleteAPI } from './apis/Delete-Expo-Api';
import { useAppDispatch } from 'app/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { setSelectedExpoId, setState, useExpoDispatch, useExpoSelector } from './ExpoManagementSlice';
import OnionNotFound from 'app/shared-components/components/OnionNotFound';
import FuseLoading from '@fuse/core/FuseLoading';
import debounce from 'lodash/debounce';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { useTranslation } from 'react-i18next';
import { defaultExpoImageUrl, expoImageUrl } from 'src/utils/urlHelper';
import { UpdateExpoAPI } from './apis/Update-Expo-Api';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { formatDateForExpo, parseDate } from 'src/utils/dateformatter';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface Expo {
  id: string;
  expName: string;
  expImage: string;
  expDescription: string;
  expStartDate: string;
  expCreator: string;
  expEndDate: string;
  expType: string;
  expStatus: boolean;
  expCode: string
}

type CategorizedExpos = {
  events: any[];
  pastEvents: any[];
};

type Props = {
  keyword?: string;
  setKeyword?: (data: string) => void;
};
const expoImage = import.meta.env.VITE_EXPO_IMAGE

function ExpoList({ keyword, setKeyword }: Props) {
  const [expos, setExpos] = useState<CategorizedExpos>({ events: [], pastEvents: [] });
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: -1,
    pageSize: 10,
  });
  const { t } = useTranslation('expoManagement');
  const [hasMoreExpos, setHasMoreExpos] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPage] = useState(0);
  const dispatch = useAppDispatch();
  const dispatchRefresh = useExpoDispatch();
  const state = useExpoSelector((state) => state.state.value);
  const [sorting, setSorting] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [expoBackgroundImage, setExpoBackgroundImage] = useState('');
  const [totalExpo, setTotalExpo] = useState(false);
  const [totalEvents, setTotalEvents] = useState(false);
  const [totalPastEvents, setTotalPastEvents] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const [activeTab, setActiveTab] = useState(0); // Tracks the active tab
  const [tabStatus, setTabStatus] = useState('UPCOMING');
  const [pastEvents, setPastEvents] = useState([]);
  const [events, setEvents] = useState([]);
  // const [data: ] = useQuery(
  //   {
  //     queryFn: () => getExpoLists({pagination, keyword, sorting, status}),
  //     queryKey: ["expos", pagination, keyword, sorting, status]
  //   }
  // );

  const lastExpoElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreExpos) {
          setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMoreExpos]
  );

  const fetchExposList = useCallback(
    debounce(async ({ pagination, keyword, sorting, status }) => {
      setIsLoading(true);
      try {
        const response = await getExpoLists({ pagination, keyword, sorting, status });
        if (response.total === 0) {
          setTotalExpo(true);
        } else {
          setTotalExpo(false);
        }

        if (status === 'PAST') {
          setPastEvents((prev) => {
            if (pagination.pageIndex === 0) {
              return response.allExpo;
            } else {
              return [...prev, ...response.allExpo]
            }
          })
        } else {
          setEvents((prev) => {
            if (pagination.pageIndex === 0) {
              return response.allExpo
            } else {
              return [...prev, ...response.allExpo]
            }
          })
        }

        const _totalPages = Math.ceil(response.total / pagination.pageSize);
        setTotalPage(_totalPages);
        setHasMoreExpos(pagination.pageIndex < _totalPages - 1);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoaded(false);
        setIsFetching(false);
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    setTotalEvents(events.length === 0);
    setTotalPastEvents(pastEvents.length === 0);
  }, [events, pastEvents])

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setExpoBackgroundImage(expoImage);
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (keyword) {
      urlSearchParams.set("keyword", keyword);
    } else {
      urlSearchParams.delete("keyword");
    }
    const delayDebounceExpoSearch = setTimeout(() => {
      setSearchParams(urlSearchParams);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 500);
    return () => clearTimeout(delayDebounceExpoSearch);
  }, [keyword]);

  useEffect(() => {
    if (pagination.pageIndex >= 0) {
      setIsFetching(true);
      fetchExposList({ pagination, keyword, sorting, status: tabStatus });
    }
  }, [pagination]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    fetchExposList({ pagination, keyword, sorting, status: tabStatus })
  }, [state])

  const handleEdit = async (id: string) => {
    navigate(`edit/${id}`);
  };

  const handleDelete = async (expCode: string, expoId: string) => {
    const deleteExpCodes = [expCode];
    const response = await ExpoDeleteAPI(deleteExpCodes);
    if (response?.statusCode === 200) {
      await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + expoId);
      dispatch(showMessage({ message: "Expo deleted", variant: "success" }));
      navigate('/admin/expo-management');
      fetchExposList({ pagination: { ...pagination, pageIndex: 0 }, keyword, sorting, status: tabStatus });
    }
  };

  const handleClick = (id: string) => {
    dispatchRefresh(setSelectedExpoId(id));
    navigate(`expo/${id}/manage/agenda`, { state: { id } });
  };

  const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
    const status = newValue === 0 ? 'UPCOMING' : 'PAST';
    setTabStatus(status);
    fetchExposList({ pagination: { pageIndex: 0, pageSize: 10 }, keyword, sorting, status })
    setTabValue(newValue);
  };

  const location = useLocation();
  const useQuery = (_location) => {
    return new URLSearchParams(_location.search);
  };

  useEffect(() => {
    const query = useQuery(location);
    const params = {
      keyword: ''
    };
    query.forEach((value, key) => {
      params[key] = value;
    });
    if (params?.keyword) {
      setKeyword(params?.keyword);
    } else {
      setKeyword("");
    }
  }, [location]);

  const renderExpos = (expoList: Expo[]) => {
    if (!expoList && expoList.length === 0) {
      return <OnionNotFound message={t('expo_noExpoFound')} />;
    }
    const confirmExpoStatusChange = async (id, expCode, status) => {
      try {
        const payload = {
          id: id,
          expCode: expCode,
          expStatus: status,
        }
        let _prevExpo;

        const response = await UpdateExpoAPI(payload);

        if (response?.data?.statusCode === 200) {
          if (tabStatus === 'PAST') {
            _prevExpo = [...pastEvents];
          } else {
            _prevExpo = [...events];
          }

          for (const [itemIndex, eventItem] of _prevExpo.entries()) {
            if (id === eventItem.id) {
              _prevExpo[itemIndex]['expStatus'] = status;
              break;
            }
          }

          if (tabStatus === 'PAST') {
            setPastEvents(_prevExpo);
          } else {
            setEvents(_prevExpo);
          }

          await LocalCache.deleteItem(cacheIndex.expoDetails + "_" + id);

          dispatch(showMessage({
            message: (status === true ? t('expo_publishedExpo_successMessage') : t('expo_unpublishedExpo_successMessage')),
            variant: 'success',
          }));
        }
      } catch (err) {
        const errorMessage = err?.response?.data?.message;
        if (errorMessage) {
          dispatch(showMessage({ message: errorMessage || 'Server error', variant: 'error' }));
        }
      }
    }

    const handleExpoStatus = (id: string, expCode: string, status: boolean) => {
      dispatch(openDialog({
        children: (
          <OnionConfirmBox
            confirmButtonLabel={status === true ? t('expo_publishExpo_confirmButton') : t('expo_unpublishExpo_confirmButton')}
            cancelButtonLabel={t('common_cancel')}
            variant='warning'
            title={status === true ? t('expo_publishExpo_confirmTitle') : t('expo_unpublishExpo_confirmTitle')}
            subTitle={status === true ? t('expo_publishExpo_confirmMessage') : t('expo_unpublishExpo_confirmMessage')}
            onCancel={() => dispatch(closeDialog())}
            onConfirm={() => {
              confirmExpoStatusChange(id, expCode, status);
              dispatch(closeDialog());
            }}
          />
        ),
      }))
    }

    return (
      <Box sx={{ flexGrow: 1, padding: 0 }}>
        <Grid container spacing={3}>
          {expoList.map((expo, index) => (
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              key={expo?.id}
              ref={index === expoList.length - 1 ? lastExpoElementRef : null}
            >
              <ImageList
                name={expo?.expName}
                description={expo?.expDescription}
                startDate={expo?.expStartDate}
                createdBy={expo?.expCreator}
                endDate={expo?.expEndDate}
                onClick={() => handleClick(expo?.id)}
                image={expo.expImage === "default.webp"
                  ? defaultExpoImageUrl(
                    expo?.expImage
                  )
                  : expoImageUrl(expo?.expImage)}
                handleEdit={() => handleEdit(expo?.id)}
                handleDelete={() => dispatch(openDialog({
                  children: (
                    <OnionConfirmBox
                      confirmButtonLabel={t('common_delete')}
                      cancelButtonLabel={t('common_cancel')}
                      variant='warning'
                      title={t('expo_deleteExpo_confirmTitle')}
                      subTitle={t('expo_deleteExpo_confirmMessage')}
                      onCancel={() => dispatch(closeDialog())}
                      onConfirm={() => {
                        handleDelete(expo?.expCode, expo?.id);
                        dispatch(closeDialog());
                      }}
                    />
                  ),
                }))}
                handleStatusChange={() => handleExpoStatus(expo?.id, expo?.expCode, !expo?.expStatus)}
                isItemActive={expo?.expStatus}
                expoType={(() => {
                  switch (expo.expType) {
                    case "Online":
                      return t("expo_addExpo_online");
                    case "Offline":
                      return t("expo_addExpo_offline");
                    case "Hybrid":
                      return t("expo_addExpo_hybrid");
                    default:
                      return "Unknown" + "1234"; // Or handle the default case as needed
                  }
                })()}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );  
  };

  if (isLoading && pagination.pageIndex <= 0) {
    return <FuseLoading />;
  }

  return (
    <>
      <Box sx={{ width: '100%', padding: "5px" }}>
        <Box sx={{ borderBottom: 0, borderColor: 'divider', paddingBottom: '28px', marginTop: '-10px', position: "sticky", top : "0", zIndex: "99", background: "#fff", marginBottom: "5px" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="expo tabs" >
            <Tab className='text-[13px] py-0' label={t('expo_events')} {...a11yProps(0)} />
            <Tab className='text-[13px] py-0' label={t('expo_pastEvents')} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={tabValue} index={0}    > 
          {renderExpos(events)}
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          {renderExpos(pastEvents)}
        </CustomTabPanel>
        {isFetching && <FuseLoading />}
      </Box>
      {totalExpo &&
        <OnionNotFound message={t('expo_noExpoFound')} />
      }
      {/* {
        totalEvents && <OnionNotFound message='No events found' />
      }
      {
        totalPastEvents && <OnionNotFound message='No past events found' />
      } */}
    </>
  );
}

export default ExpoList;
