
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
import { Community } from "@/group_owners/hooks/useCommunities";
import { Project } from "@/group_owners/hooks/types/project.types";
import { cn } from "@/lib/utils";
import { FolderKanban, Users } from "lucide-react";

interface CommunityDropdownProps {
  communities: Community[] | undefined;
  projects: Project[] | undefined;
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isMobile: boolean;
}

export const CommunityDropdown: React.FC<CommunityDropdownProps> = ({
  communities,
  projects,
  selectedCommunityId,
  setSelectedCommunityId,
  selectedProjectId,
  setSelectedProjectId,
  isMobile
}) => {
  const handleValueChange = (value: string) => {
    const [type, id] = value.split(":");
    
    if (type === "community") {
      setSelectedCommunityId(id);
      setSelectedProjectId(null);
    } else if (type === "project") {
      setSelectedProjectId(id);
      setSelectedCommunityId(null);
    }
  };

  const getSelectedValue = () => {
    if (selectedCommunityId) return `community:${selectedCommunityId}`;
    if (selectedProjectId) return `project:${selectedProjectId}`;
    return "";
  };
  
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  const sanitizedCommunities = communities?.filter(c => c && c.id && c.name) || [];
  const sanitizedProjects = projects?.filter(p => p && p.id && p.name) || [];

  return (
    <Select value={getSelectedValue()} onValueChange={handleValueChange}>
      <SelectTrigger 
        className={cn(
          "gap-2",
          isMobile ? "max-w-[200px] h-9" : "w-[220px] h-10",
          "bg-white border border-slate-200 shadow-sm"
        )}
      >
        <SelectValue placeholder="Select...">
          <div className="flex items-center gap-2 truncate">
            {selectedCommunity && (
              <>
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                <span className="truncate">{selectedCommunity.name}</span>
              </>
            )}
            {selectedProject && (
              <>
                <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                  <FolderKanban className="h-3 w-3 text-purple-600" />
                </div>
                <span className="truncate">{selectedProject.name}</span>
              </>
            )}
            {!selectedCommunity && !selectedProject && (
              <span className="text-slate-500">Select...</span>
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
              <SelectItem key={project.id} value={`project:${project.id}`}>
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
        
        {sanitizedCommunities.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs font-semibold text-slate-500">
              Communities
            </SelectLabel>
            {sanitizedCommunities.map((community) => (
              <SelectItem key={community.id} value={`community:${community.id}`}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="truncate">{community.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        
        {sanitizedCommunities.length === 0 && sanitizedProjects.length === 0 && (
          <div className="p-2 text-center text-sm text-slate-500">
            No communities or projects found
          </div>
        )}
      </SelectContent>
    </Select>
  );
};
