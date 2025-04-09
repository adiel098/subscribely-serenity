
import { useState } from "react";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useProjects, Project } from "@/group_owners/hooks/useProjects";
import { useProjectContext } from "@/contexts/ProjectContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProjectSelector() {
  const { data: projects, isLoading } = useProjects();
  const { selectedProjectId, setSelectedProjectId, selectedProject } = useProjectContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleCreateNew = () => {
    navigate("/projects/new");
    setOpen(false);
  };
  
  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[180px] justify-start" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span className="truncate">Loading...</span>
      </Button>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Button 
        variant="outline" 
        className="w-[180px] justify-start"
        onClick={() => navigate("/projects/new")}
      >
        <Plus className="mr-2 h-4 w-4" />
        <span className="truncate">Create Project</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-[180px] justify-between",
            isMobile ? "px-2 text-xs" : ""
          )}
        >
          <div className="flex items-center truncate">
            <span className="truncate">
              {selectedProject ? selectedProject.name : "Select Project"}
            </span>
          </div>
          <ChevronDown className={cn(
            "ml-2 h-4 w-4 shrink-0 opacity-50",
            isMobile ? "h-3 w-3" : ""
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            className={cn(
              "cursor-pointer flex justify-between",
              selectedProjectId === project.id ? "bg-accent" : ""
            )}
            onClick={() => handleSelectProject(project)}
          >
            <span className="truncate mr-2">{project.name}</span>
            {selectedProjectId === project.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create New Project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
