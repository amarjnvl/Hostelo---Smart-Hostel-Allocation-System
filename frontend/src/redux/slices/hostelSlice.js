import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchHostels = createAsyncThunk(
  "hostels/fetchHostels",
  async (collegeId, { rejectWithValue }) => {
    if (!collegeId) {
      return rejectWithValue("College ID is required");
    }

    try {
      const response = await api.get(`/hostels/college/${collegeId}`);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch hostels"
      );
    }
  }
);

const hostelSlice = createSlice({
  name: "hostels",
  initialState: {
    hostels: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearHostels: (state) => {
      state.hostels = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.loading = false;
        state.hostels = action.payload;
        state.error = null;
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hostels = [];
      });
  },
});

export const { clearHostels } = hostelSlice.actions;
export default hostelSlice.reducer;
