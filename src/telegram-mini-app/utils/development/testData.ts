import { SubscriptionPlan } from "../../types/subscriptionTypes";
import { Community } from "../types/community.types";

export const TEST_USER = {
  id: "123456789",
  telegram_id: "123456789",
  username: "test_user",
  first_name: "Test",
  last_name: "User",
  photo_url: "https://placekitten.com/200/200",
  auth_date: "1629123456",
  hash: "test_hash"
};

export const TEST_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-1",
    name: "Monthly Basic",
    price: 9.99,
    interval: "monthly",
    description: "Basic monthly subscription",
    features: ["Access to exclusive content", "Community chat"],
    is_active: true,
    community_id: "comm-1",
    project_id: "proj-1",
    has_trial_period: true,
    trial_days: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "plan-2",
    name: "Annual Premium",
    price: 99.99,
    interval: "yearly",
    description: "Premium yearly subscription with discounts",
    features: ["Access to exclusive content", "Community chat", "Private Q&A", "Priority support"],
    is_active: true,
    community_id: "comm-1",
    project_id: "proj-1",
    has_trial_period: false,
    trial_days: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const TEST_COMMUNITY: Community = {
  id: "test-community-id",
  name: "Test Community",
  description: "This is a test community for development purposes",
  telegram_group_id: "test-telegram-group-id",
  telegram_photo_url: "https://placehold.co/100",
  is_public: true,
  is_group: true,
  platform_url: "https://example.com/communities/test-community-id",
  miniapp_url: "https://t.me/YourBot?start=test-community-id",
  project_plans: TEST_SUBSCRIPTION_PLANS
};
