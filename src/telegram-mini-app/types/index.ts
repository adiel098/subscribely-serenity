
export interface Community {
  id: string;
  name: string;
  description?: string;
  telegram_photo_url?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description?: string;
  features?: string[];
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      photo_url?: string;
    };
    start_param?: string;
  };
  MainButton: {
    text: string;
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    setParams: (params: { text: string; color: string; }) => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

export interface SuccessScreenProps {
  communityName?: string;
  communityInviteLink?: string | null;
}

export interface SubscriptionPlansProps {
  communityId: string;
  userId?: string;
}
