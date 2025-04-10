import { Community } from "@/telegram-mini-app/types/community.types";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";

export const TEST_USER: TelegramUser = {
  id: '123456789',
  username: 'test_user',
  first_name: 'Test',
  last_name: 'User',
  photo_url: 'https://via.placeholder.com/100'
};

export const TEST_COMMUNITY: Community = {
  id: '27052464-6e68-4116-bd79-6af069fe67cd',
  name: 'Test Community',
  description: 'This is a test community for development purposes',
  telegram_photo_url: null,
  telegram_chat_id: null,
  custom_link: 'test-community',
  subscription_plans: [
    {
      id: 'test-plan-1',
      name: 'Monthly Plan',
      price: 9.99,
      interval: 'monthly',
      description: 'Basic monthly subscription',
      features: ['Access to all content', '24/7 support'],
      is_active: true,
      community_id: '27052464-6e68-4116-bd79-6af069fe67cd'
    },
    {
      id: 'test-plan-2',
      name: 'Yearly Plan',
      price: 99.99,
      interval: 'yearly',
      description: 'Premium yearly subscription',
      features: ['Access to all content', '24/7 support', 'Special perks'],
      is_active: true,
      community_id: '27052464-6e68-4116-bd79-6af069fe67cd'
    }
  ]
};

export const mockSubscriptionPlans = [
  {
    id: "plan-1",
    name: "Basic Plan",
    price: 9.99,
    interval: "monthly",
    description: "Starter plan with basic features",
    features: ["Access to main content", "Basic support", "1 device"],
    is_active: true,
    community_id: "community-1",
    project_id: "project-1",
    has_trial_period: false,
    trial_days: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "plan-2",
    name: "Premium Plan",
    price: 99.99,
    interval: "yearly",
    description: "Premium plan with all features",
    features: ["Access to all content", "Priority support", "Multiple devices", "Exclusive content"],
    is_active: true,
    community_id: "community-1",
    project_id: "project-1",
    has_trial_period: true,
    trial_days: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
