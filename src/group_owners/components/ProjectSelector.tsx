
import React, { useEffect } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/group_owners/hooks/useProjects';
import { useProjectContext } from '@/group_owners/hooks/dashboard/useProjectContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const ProjectSelector: React.FC = () => {
  const navigate = useNavigate();
  const { selectedProjectId, setSelectedProjectId, selectedProject, projects, isLoading } = useProjectContext();

  useEffect(() => {
    // If no project is selected but projects are available, select the first one
    if (!selectedProject && projects?.length > 0 && !isLoading) {
      console.log("ProjectSelector: Auto-selecting first project", projects[0].id);
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProject, setSelectedProjectId, isLoading]);

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleSelectProject = (project: Project) => {
    if (project.id !== selectedProjectId) {
      console.log("ProjectSelector: Manually selecting project", project.id);
      setSelectedProjectId(project.id);
      toast.success(`בחרת את הפרויקט: ${project.name}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 gap-1 h-9 w-full justify-start font-normal text-sm"
        >
          {isLoading ? (
            <span className="text-muted-foreground">טוען פרויקטים...</span>
          ) : selectedProject ? (
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <Badge variant="outline" className="bg-indigo-50 px-1.5 py-0">
                {selectedProject.name.substring(0, 1).toUpperCase()}
              </Badge>
              <span className="truncate max-w-[160px]">{selectedProject.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">בחר פרויקט</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] p-2">
        <DropdownMenuGroup className="space-y-1">
          {projects?.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => handleSelectProject(project)}
              className={`gap-2 p-2 rounded-md cursor-pointer ${
                selectedProjectId === project.id ? 'bg-accent' : ''
              }`}
            >
              <Badge variant="outline" className="bg-indigo-50 px-1.5 py-0">
                {project.name.substring(0, 1).toUpperCase()}
              </Badge>
              <span className="truncate flex-1">{project.name}</span>
              {selectedProjectId === project.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          {projects?.length === 0 && !isLoading && (
            <div className="py-2 px-2 text-sm text-muted-foreground text-center">
              לא נמצאו פרויקטים
            </div>
          )}
          
          {isLoading && (
            <div className="py-2 px-2 text-sm text-muted-foreground text-center">
              טוען...
            </div>
          )}
        </DropdownMenuGroup>
        
        <div className="mt-2 pt-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={handleCreateProject}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>צור פרויקט חדש</span>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
