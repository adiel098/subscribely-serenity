
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
import { useProjectContext } from '@/contexts/ProjectContext';
import { Badge } from '@/components/ui/badge';

export const ProjectSelector: React.FC = () => {
  const navigate = useNavigate();
  const { 
    selectedProject, 
    selectedProjectId,
    setSelectedProjectId 
  } = useProjectContext();
  const projects = selectedProject ? [selectedProject] : [];
  const isLoading = false;

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleSelectProject = (projectId: string) => {
    if (projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
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
            <span className="text-muted-foreground">Loading projects...</span>
          ) : selectedProject ? (
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <Badge variant="outline" className="bg-indigo-50 px-1.5 py-0">
                {selectedProject.name.substring(0, 1).toUpperCase()}
              </Badge>
              <span className="truncate max-w-[160px]">{selectedProject.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select a project</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px] p-2">
        <DropdownMenuGroup className="space-y-1">
          {projects?.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => handleSelectProject(project.id)}
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
        </DropdownMenuGroup>
        
        <div className="mt-2 pt-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-sm"
            onClick={handleCreateProject}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Project</span>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
