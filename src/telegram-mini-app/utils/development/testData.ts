
import { Community } from "../types/community.types";

// Sample community data for development
export const sampleCommunity: Community = {
  id: "sample-community-1",
  name: "Sample Community",
  description: "A test community for development purposes",
  telegram_photo_url: null,
  telegram_chat_id: "12345",
  custom_link: null,
  photo_url: "https://via.placeholder.com/150",
  member_count: 120,
  subscription_count: 45,
  subscription_plans: [
    {
      id: "plan-1",
      name: "Monthly Premium",
      price: 9.99,
      interval: "monthly",
      description: "Access to all premium content",
      features: ["Premium content", "Early access", "Monthly newsletter"],
      is_active: true,
      community_id: "sample-community-1",
      project_id: "project-1",
      has_trial_period: true,
      trial_days: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "plan-2",
      name: "Yearly Premium",
      price: 99.99,
      interval: "yearly",
      description: "Access to all premium content, yearly discount",
      features: ["Premium content", "Early access", "Monthly newsletter", "Save 20%"],
      is_active: true,
      community_id: "sample-community-1",
      project_id: "project-1",
      has_trial_period: true,
      trial_days: 14,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  platform_url: "https://example.com/community/sample-community-1",
  miniapp_url: "https://t.me/sample_bot/app"
};
