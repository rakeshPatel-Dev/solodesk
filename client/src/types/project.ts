
export interface CreateProjectRequest {
  name: string;
  description: string;
}

export  interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
}


export interface DeleteProjectRequest {
  id: string;
}


export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: { _id: string; name: string };
  type: string;
  budget: number;
  status: string;
  startDate: string;
  deadline: string;
}


 export interface ProjectState {
  projects: Project[];
}


export interface ProjectForm {
  name: string;
  description: string;
  clientId: string;
  type: string;
  budget: number;
  status: string;
  startDate: string;
  deadline: string;
}


