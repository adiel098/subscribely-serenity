
import { Community } from "../useCommunities";

export interface CommunityGroup extends Community {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  custom_link: string | null;
  created_at: string;
  updated_at: string;
  is_group: boolean; // Virtual property, not in DB
}

// This should only include fields that are specific to community_groups table
export interface GroupSpecificData {
  id: string;
  photo_url: string | null;
}

export interface CommunityGroupMember {
  community_id: string;
  member_id: string;
  added_at: string;
  display_order: number;
}

export interface CommunityGroupWithMembers extends CommunityGroup {
  communities: string[];
}

export interface CreateCommunityGroupData {
  name: string;
  description?: string | null;
  photo_url?: string | null;
  custom_link?: string | null;
  communities: string[];
}

export interface UpdateCommunityGroupData {
  id: string;
  name?: string;
  description?: string | null;
  photo_url?: string | null;
  custom_link?: string | null;
  communities?: string[];
}

export interface CommunityRelationship {
  community_id: string;
  member_id: string;
  display_order: number;
  relationship_type: string;
  added_at: string;
  owner_id?: string; // Added to track ownership
}
