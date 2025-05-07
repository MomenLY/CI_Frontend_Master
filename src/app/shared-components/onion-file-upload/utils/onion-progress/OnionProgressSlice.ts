import { createSlice, PayloadAction, WithSlice, current } from '@reduxjs/toolkit';
import { rootReducer } from 'app/store/lazyLoadedSlices';

/**
 * The type definition for the initial state of the message slice.
 */
type InitialProps = {
	fileQueue: {
		[key: string]: {
			name: string;
			progress: number;
			id: string;
			status: 'pending' | 'uploading' | 'completed' | 'failed';
		};
	};
	defectiveFileQueue: {
		[key: string]: {
			name: string;
			progress: number;
			id: string;
			status: 'defective';
		};
	};
	retryFileUpload: {
		fileId: string;
	};
	removeFile: {
		fileId: string;
	};
	removeDefectiveFile: {
		fileId: string;
	};
};
/**
 * The initial state of the onionProgress slice.
 */
const initialState: { state: boolean; options: InitialProps } = {
	state: false,
	options: {
		fileQueue: {},
		defectiveFileQueue: {},
		retryFileUpload: {
			fileId: ''
		},
		removeFile: {
			fileId: ''
		},
		removeDefectiveFile: {
			fileId: ''
		}
	}
};

/**
 * The onionProgress slice.
 */
export const onionProgressSlice = createSlice({
	name: 'onionProgress',
	initialState,
	reducers: {
		showProgress(state, action: PayloadAction<Partial<InitialProps>>) {
			state.state = true;
			const fileQueue = {
				fileQueue: {
					...current(state).options.fileQueue,
					...action.payload.fileQueue
				},
				defectiveFileQueue: {
					...current(state).options.defectiveFileQueue,
					...action.payload.defectiveFileQueue
				},
				retryFileUpload: {
					...initialState.options.retryFileUpload,
					...action.payload.retryFileUpload
				},
				removeFile: {
					...initialState.options.removeFile,
					...action.payload.removeFile
				},
				removeDefectiveFile: {
					...initialState.options.removeDefectiveFile,
					...action.payload.removeDefectiveFile
				}
			};
			state.options = { ...fileQueue };
		},
		hideProgress(state) {
			state.state = false;
			state.options.fileQueue = {};
			state.options.defectiveFileQueue = {};
		},
		removeFiles(state, action: PayloadAction<{ queue: 'fileQueue' | 'defectiveFileQueue'; key: string }>) {
			const { queue, key } = action.payload;
			const newQueue = { ...current(state).options[queue] };
			delete newQueue[key];
			state.options = { ...state.options, [queue]: newQueue };
		}
	},
	selectors: {
		selectOnionProgressState: (onionProgress) => onionProgress.state,
		selectOnionProgressOptions: (onionProgress) => onionProgress.options
	}
});

/**
 * Lazy load
 * */
rootReducer.inject(onionProgressSlice);
const injectedSlice = onionProgressSlice.injectInto(rootReducer);
declare module 'app/store/lazyLoadedSlices' {
	export interface LazyLoadedSlices extends WithSlice<typeof onionProgressSlice> {}
}

export const { hideProgress, showProgress, removeFiles } = onionProgressSlice.actions;

export const { selectOnionProgressOptions, selectOnionProgressState } = injectedSlice.selectors;

export type onionProgressSliceType = typeof onionProgressSlice;

export default onionProgressSlice.reducer;
