import { Box, Container, Grid, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import EventCard from "../common/EventCard";
import { getAllEvents, getRegisteredEvents } from "../api/event-list-api";
import SearchBox from "../common/SearchBox";
import { debounce } from "lodash";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import FuseLoading from "@fuse/core/FuseLoading";
import { useTranslation } from "react-i18next";

type eventListPros = {
  is_registered_event?: boolean;
};

function EventList({ is_registered_event = false }: eventListPros) {
  const [keyword, setKeyword] = useState("");
  const { t } = useTranslation("user-dashboard");
  const observer = useRef(null);
  const eventHead = is_registered_event
    ? t("uD_menu_registered_events_text")
    : t("uD_newEvents_title");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: [is_registered_event ? "registered_events" : "events", keyword],
    queryFn: async ({ pageParam = 1 }: any) => {
      const response = await (is_registered_event
        ? getRegisteredEvents(keyword, pageParam, 12)
        : getAllEvents(keyword, pageParam, 12, "UPCOMING"));
      return {
        allExpo: is_registered_event
          ? response?.registerdEventsList
          : response?.allExpo,
        nextPage: response?.currentPage + 1,
        hasMore: response?.totalPages > response?.currentPage,
      };
    },
    getNextPageParam: (lastPage: any) =>
      lastPage?.hasMore ? lastPage?.nextPage : undefined,
    staleTime: 0,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
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
      const currentData: any = queryClient.getQueryData([
        is_registered_event ? "registered_events" : "events",
        keyword,
      ]);

      // If there are pages, keep only the first page
      if (currentData?.pages) {
        const updatedPages = [currentData.pages[0]]; // Keep only the zeroth indexed element
        queryClient.setQueryData(
          [is_registered_event ? "registered_events" : "events", keyword],
          {
            ...currentData,
            pages: updatedPages,
          }
        );
      }
    };
  }, [queryClient, keyword]);

  // Infinite scroll observer
  const lastEventElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          data?.pages[data?.pages?.length - 1]?.hasMore
        ) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const events = data?.pages?.flatMap((page) => page?.allExpo) || [];

  return (
    <>
      <Box
        sx={{ padding: { xs: "90px 0 0 0", md: "90px 0 40px 0" } }}
      >
        <Container
          className="max-w-[1160px] w-full px-20 lg:px-0 m-auto mt-0 "
        >
          <Box className="flex flex-col sm:flex-row  items-center justify-between pt-24 md:pt-30 mb-24 md:mb-28 gap-4">
            <Typography
              variant="caption"
              color="text.primary"
              component="h3"
              className=" font-semibold text-[16px] lg:text-[18px] truncate  mt-6 md:mt-0 order-1 sm:order-none"
              noWrap
            >
              {eventHead}
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
                    ref={
                      index === events?.length - 1 ? lastEventElementRef : null
                    }
                  >
                    <EventCard
                      is_registered_event={is_registered_event}
                      data={event}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </div>

          {isFetchingNextPage && events?.length > 0 && <FuseLoading />}
        </Container>
      </Box>
    </>
  );
}

export default EventList;
