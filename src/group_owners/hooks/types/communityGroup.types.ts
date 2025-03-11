
export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  photo_url: string | null;
  custom_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityGroupMember {
  group_id: string;
  community_id: string;
  added_at: string;
  display_order: number;
}

export interface CommunityGroupWithMembers extends CommunityGroup {
  communities: string[];
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
