import { createSlice } from "@reduxjs/toolkit";

export const userListSlice = createSlice({
  name: "userList",
  initialState: {
    shouldUpdate: false,
    loggedUser: {},
    enforcePasswordReset: false, // New state for enforcing password reset
    userRole: null, // New state for storing user role
  },
  reducers: {
    setShouldUpdate: (state, action) => {
      state.shouldUpdate = action.payload;
    },
    setLoginUser: (state, action) => {
      state.loggedUser = action.payload;
    },
    setUserEnforcePasswordReset: (state, action) => {
      state.enforcePasswordReset = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
  },
});

export const {
  setShouldUpdate,
  setLoginUser,
  setUserEnforcePasswordReset,
  setUserRole,
} = userListSlice.actions;

export default userListSlice.reducer;
