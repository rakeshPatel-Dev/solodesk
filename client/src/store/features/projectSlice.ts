import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  projects: [],
};


const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    addProject: (state, action) => {
      state.projects = action.payload;
    },
   updateProject: (state, action) => {
      const updatedProject = action.payload;
      state.projects = state.projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      );
    },
    deleteProject: (state, action) => {
      const projectId = action.payload;
      state.projects = state.projects.filter((project) => project.id !== projectId);
    },
    updateProjectStatus: (state, action) => {
      const { projectId, status } = action.payload;
      state.projects = state.projects.map((project) =>
        project.id === projectId ? { ...project, status } : project
      );
    },
    
  },
});

export const { setProjects } = projectSlice.actions;
export default projectSlice.reducer;