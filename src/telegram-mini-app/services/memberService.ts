
// This file re-exports all the functionality from the refactored service files
// to maintain backward compatibility

export type { 
  Community, 
  Subscription, 
  CreateMemberData, 
  UserExistsResponse 
} from "./types/memberTypes";

export { 
  getUserSubscriptions,
  cancelSubscription 
} from "./subscriptionService";

export { 
  searchCommunities 
} from "./communityService";

export {
  checkUserExists,
  collectUserEmail,
  createOrUpdateMember
} from "./userService";
