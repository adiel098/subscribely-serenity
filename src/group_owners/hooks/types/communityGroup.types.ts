
export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  photo_url: string | null;
  custom_link: string | null;
  created_at: string;
  updated_at: string;
  is_group: boolean;
}

export interface CommunityRelationship {
  community_id: string;
  member_id: string;
  added_at: string;
  display_order: number;
  relationship_type: string;
}

export interface CommunityGroupWithMembers extends CommunityGroup {
  communities: string[];
}

export interface CommunityGroupMember {
  id: string;
  community_id: string;
  added_at: string;
  relationship_type: string;
}

export interface CreateCommunityGroupData {
  name: string;
  description?: string;
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
