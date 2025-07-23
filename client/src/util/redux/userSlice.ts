/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store.ts';

export interface UserState {
  _id: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  admin: boolean | null;
  role: string | null;
}

interface Payload {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  role: string;
}

const initialState = {
  _id: null,
  email: null,
  firstName: null,
  lastName: null,
  admin: null,
  role: null,
} as UserState;

/**
 * A slice of the redux store that contains the user's information. This slice defines reducer for logging in a user, logging out a user, and promoting a user to admin.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Payload>) => {
      state._id = action.payload._id;
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.admin = action.payload.admin;
      state.role = action.payload.role;
    },
    toggleAdmin: (state) => {
      state.admin = !state.admin;
    },
    logout: (state) => {
      state._id = null;
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.admin = null;
      state.role = null;
    },
  },
});

export const { login, logout, toggleAdmin } = userSlice.actions;
export default userSlice.reducer;

/**
 * A selector that returns the user state
 * @param state The redux store state
 * @returns The user state
 */
export const selectUser = (state: RootState) => state.user;
