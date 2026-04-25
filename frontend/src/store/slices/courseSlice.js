import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classes: [],
  subjects: [],
  myCourses: [],
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.classes = action.payload.classes;
      state.subjects = action.payload.subjects;
    },
    setMyCourses: (state, action) => {
      state.myCourses = action.payload;
    },
  },
});

export const { setCourses, setMyCourses } = courseSlice.actions;
export default courseSlice.reducer;
