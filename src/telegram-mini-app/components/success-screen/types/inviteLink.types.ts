
export interface ChannelLink {
  id: string;
  name: string;
  inviteLink: string | null;
  description?: string;
  isMiniApp?: boolean;
  error?: string;
}

export interface GroupInviteData {
  mainGroupLink: string;
  isGroup: boolean;
  groupName: string;
  channels: ChannelLink[];
}
