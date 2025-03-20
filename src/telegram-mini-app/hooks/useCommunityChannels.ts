
// This file serves as a re-export for backward compatibility
// It allows existing code to continue working without changes
// while using the new refactored structure

import { useCommunityChannels } from "./community-channels/useCommunityChannels";
import type { ChannelInfo, CommunityChannelsHookResult } from "./community-channels/types";

export { useCommunityChannels };
export type { ChannelInfo, CommunityChannelsHookResult };
export type ChannelType = ChannelInfo; // For backward compatibility
