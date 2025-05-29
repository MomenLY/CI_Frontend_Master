import { Grid } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EventCard from "../common/EventCard";
import { getAllEvents } from "../api/event-list-api";
import { debounce } from "lodash";
import FuseLoading from "@fuse/core/FuseLoading";
import SearchBox from "../common/SearchBox";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";


const HomeList = ({ tenantId }) => {
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation("user-dashboard");
  const observer = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["events", tenantId, keyword],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await getAllEvents(keyword, pageParam, 12, 'UPCOMING');
      return {
        allExpo: response?.allExpo,
        nextPage: response?.currentPage + 1,
        hasMore: response?.totalPages > response?.currentPage,
      };
    },
    getNextPageParam: (lastPage: any) => (lastPage?.hasMore ? lastPage?.nextPage : undefined),
    staleTime: 0,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  });

  const handleSearch = useCallback(
    debounce((searchKeyword) => {
      setKeyword(searchKeyword);
      refetch();
    }, 500),
    [refetch]
  );

  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      // Get the current data from the query
      const currentData: any = queryClient.getQueryData(["events", tenantId, keyword]);

      // If there are pages, keep only the first page
      if (currentData?.pages) {
        const updatedPages = [currentData?.pages[0]]; // Keep only the zeroth indexed element
        queryClient.setQueryData(["events", tenantId, keyword], {
          ...currentData,
          pages: updatedPages,
        });
      }
    };
  }, [queryClient, tenantId, keyword]);


  // Infinite scroll observer
  const lastEventElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current?.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && data?.pages[data?.pages?.length - 1]?.hasMore) {
          fetchNextPage();
        }
      });
      if (node) observer.current?.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const events = data?.pages?.flatMap((page: any) => page?.allExpo) || [];

  return (
    <>
     <Box className="flex flex-col sm:flex-row  items-center justify-between pt-24 md:pt-30 mb-24 md:mb-28 gap-4">
        <Typography
          variant="caption"
          color="text.primary"
          component="h3"
          className=" font-semibold text-[16px] lg:text-[18px] truncate  mt-6 md:mt-0 order-1 sm:order-none"
          noWrap
        >
          {t("uD_menu_events_text")}
        </Typography>
        <SearchBox onSearch={handleSearch} />
      </Box>

      <div className="flex justify-center items-center">
        {isLoading && events?.length === 0 ? (
          <FuseLoading />
        ) : events?.length === 0 ? (
          <Typography variant="h6" color="textSecondary">
            {t("onionNoRecordFound")}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {events?.map((event, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={event?.id}
                ref={index === events?.length - 1 ? lastEventElementRef : null}
              >
                <EventCard data={event} />
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {isFetchingNextPage && events?.length > 0 && <FuseLoading />}
    </>
  );
};

export default HomeList;
