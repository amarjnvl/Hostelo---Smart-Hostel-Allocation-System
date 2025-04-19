import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  sendOtpAPI,
  verifyOtpAPI,
  getProfileAPI,
} from "../../features/studentAPI";

const tokenFromStorage = localStorage.getItem("token");

export const sendOtp = createAsyncThunk("student/sendOtp", async (rollNo) => {
  await sendOtpAPI(rollNo);
  return rollNo;
});

export const verifyOtp = createAsyncThunk(
  "student/verifyOtp",
  async ({ rollNo, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyOtpAPI(rollNo, otp);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "student/fetchProfile",
  async (rollNo) => {
    const res = await getProfileAPI(rollNo);
    return res.data;
  }
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    student: null,
    rollNo: "",
    token: tokenFromStorage || null,
    loading: false,
    error: null,
    pendingGroupRequest: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("rollNo");
      state.student = null;
      state.token = null;
      state.pendingGroupRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingGroupRequest = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.student = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});
export const { logout } = studentSlice.actions;
export default studentSlice.reducer;
