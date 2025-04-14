import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/group_owners/hooks/useProjects";
import { cn } from "@/lib/utils";
import { FolderKanban } from "lucide-react";

interface ProjectDropdownProps {
  projects: Project[] | undefined;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isMobile: boolean;
}

export const ProjectDropdown: React.FC<ProjectDropdownProps> = ({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isMobile
}) => {
  const handleValueChange = (value: string) => {
    setSelectedProjectId(value);
  };
  
  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  const sanitizedProjects = projects?.filter(p => p && p.id && p.name) || [];

  return (
    <Select value={selectedProjectId || ""} onValueChange={handleValueChange}>
      <SelectTrigger 
        className={cn(
          "gap-2",
          isMobile ? "max-w-[200px] h-9" : "w-[220px] h-10",
          "bg-white border border-slate-200 shadow-sm"
        )}
      >
        <SelectValue placeholder="בחר פרויקט">
          <div className="flex items-center gap-2 truncate">
            {selectedProject && (
              <>
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                  <FolderKanban className="h-3 w-3 text-purple-600" />
                </div>
                <span className="truncate">{selectedProject.name}</span>
              </>
            )}
            {!selectedProject && (
              <span className="text-slate-500">Choose a project</span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      
      <SelectContent>
        {sanitizedProjects.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-slate-500">
              Projects
            </SelectLabel>
            {sanitizedProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                    <FolderKanban className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="truncate">{project.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {sanitizedProjects.length === 0 && (
          <div className="p-2 text-center text-sm text-slate-500">
            לא נמצאו פרויקטים
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
