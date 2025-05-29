import { createSlice, PayloadAction, configureStore, WithSlice } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { rootReducer } from 'app/store/lazyLoadedSlices';

// Define the interface for the state slice
interface StateSlice {
  value: boolean;
  selectedExpoId: string | null;
}

// Initial state
const initialState: StateSlice = {
  value: true,
  selectedExpoId: null,
};

// Create the slice
const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    },
    setSelectedExpoId: (state, action: PayloadAction<string | null>) => {
      state.selectedExpoId = action.payload;
    },
  },
});

// Configure the store
export const store = configureStore({
  reducer: {
    state: stateSlice.reducer,
  },
});

rootReducer.inject(stateSlice);
const injectedSlice = stateSlice.injectInto(rootReducer);
declare module 'app/store/lazyLoadedSlices' {
  export interface LazyLoadedSlices extends WithSlice<typeof stateSlice> {}
}

// Define RootState and AppDispatch types
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// Custom hooks for using the typed dispatch and selector
export const useExpoDispatch = () => useDispatch<AppDispatch>();
export const useExpoSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export the actions
export const { setState, setSelectedExpoId } = stateSlice.actions;
