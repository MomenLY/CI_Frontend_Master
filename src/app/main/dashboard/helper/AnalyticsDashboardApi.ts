import { apiService as api } from 'app/store/apiService';
import { rootReducer } from 'app/store/lazyLoadedSlices';
import { WithSlice } from '@reduxjs/toolkit';
import GenderWidgetType from './GenderWidgetType';

export const addTagTypes = ['analytics_dashboard_widgets'] as const;

const AnalyticsDashboardApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (build) => ({
			getAnalyticsDashboardWidgets: build.query<
				GetAnalyticsDashboardWidgetsApiResponse,
				GetAnalyticsDashboardWidgetsApiArg
			>({
				query: () => ({ url: `/mock-api/dashboards/analytics/widgets` }),
				providesTags: ['analytics_dashboard_widgets']
			})
		}),
		overrideExisting: false
	});
export default AnalyticsDashboardApi;

export type GetAnalyticsDashboardWidgetsApiResponse = {
	[key: string]:
		| GenderWidgetType;
};
export type GetAnalyticsDashboardWidgetsApiArg = void;

export const { useGetAnalyticsDashboardWidgetsQuery } = AnalyticsDashboardApi;

declare module 'app/store/lazyLoadedSlices' {
	export interface LazyLoadedSlices extends WithSlice<typeof AnalyticsDashboardApi> {}
}

export const selectWidget = <T>(id: string) =>
	rootReducer.selector((state) => {
		const widgets = AnalyticsDashboardApi.endpoints.getAnalyticsDashboardWidgets.select()(state)?.data;
		return widgets?.[id] as T;
	});
