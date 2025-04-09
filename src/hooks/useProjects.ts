import { useState, useEffect } from 'react';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project.types';
import { ProjectService } from '@/services/projectService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const fetchedProjects = await ProjectService.getProjectsByOwnerId(user.id);
      setProjects(fetchedProjects);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects');
      toast({
        title: 'Error',
        description: 'Failed to fetch projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: CreateProjectDTO) => {
    if (!user?.id) return null;

    try {
      // Validate bot token first
      const isValid = await ProjectService.validateBotToken(data.bot_token);
      if (!isValid) {
        toast({
          title: 'Invalid Bot Token',
          description: 'Please check your bot token and try again.',
          variant: 'destructive',
        });
        return null;
      }

      const newProject = await ProjectService.createProject(data, user.id);
      setProjects(prev => [newProject, ...prev]);
      toast({
        title: 'Success',
        description: 'Project created successfully!',
      });
      return newProject;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProject = async (id: string, data: UpdateProjectDTO) => {
    try {
      if (data.bot_token) {
        const isValid = await ProjectService.validateBotToken(data.bot_token);
        if (!isValid) {
          toast({
            title: 'Invalid Bot Token',
            description: 'Please check your bot token and try again.',
            variant: 'destructive',
          });
          return false;
        }
      }

      const updatedProject = await ProjectService.updateProject(id, data);
      setProjects(prev =>
        prev.map(project => (project.id === id ? updatedProject : project))
      );
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await ProjectService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
      return true;
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: fetchProjects,
  };
};
