import React, { useState, useEffect } from 'react';
import { Project, Task, User, Status, Priority } from '../types';
import TaskCard from './TaskCard';
import apiService from '../services/api';
import { FaFolder, FaTasks, FaUsers, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

interface ProjectViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  statuses: Status[];
  priorities: Priority[];
  onTaskSelect: (task: Task) => void;
  onProjectSelect?: (project: Project) => void;
  onCreateProject?: (projectData: Partial<Project>) => Promise<Project>;
  onUpdateProject?: (id: string, projectData: Partial<Project>) => Promise<Project>;
  onDeleteProject?: (id: string) => Promise<void>;
}

const ProjectView: React.FC<ProjectViewProps> = ({
  projects,
  tasks,
  users,
  statuses,
  priorities,
  onTaskSelect,
  onProjectSelect,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}) => {
  // Simplified state declarations
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({});
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [projectStats, setProjectStats] = useState<Record<string, { totalTasks: number; completedTasks: number; overdueTasks: number; progress: number }>>({});
  const [selectedProjectStats, setSelectedProjectStats] = useState<{ totalTasks: number; completedTasks: number; overdueTasks: number; progress: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});

  // Early return when a project is selected
  if (selectedProject) {
    return (
      <div>
        <h1>Selected Project View</h1>
        <button onClick={() => setSelectedProject(null)}>
          Back to Projects
        </button>
      </div>
    );
  }

  // Main return - all projects view
  return (
    <div>
      <h1>All Projects</h1>
      <p>Number of projects: {projects.length}</p>
    </div>
  );
};

export default ProjectView;