import { configureStore } from "@reduxjs/toolkit";
import studentReducer from "./slices/studentSlice";
import hostelReducer from "./slices/hostelSlice";

export const store = configureStore({
  reducer: {
    student: studentReducer,
    hostels: hostelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});