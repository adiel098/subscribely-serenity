
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const TEST_COMMUNITY: Community = {
  id: "comm-1",
  name: "Test Community",
  description: "A community for testing purposes",
  telegram_photo_url: "https://placekitten.com/300/300",
  telegram_chat_id: "-1001234567890",
  platform_url: "https://example.com/community/test",
  miniapp_url: "https://t.me/YourBot?start=comm-1",
  subscription_plans: TEST_SUBSCRIPTION_PLANS
};
